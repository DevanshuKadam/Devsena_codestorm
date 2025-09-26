import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { db } from "./firestore.js";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

// JWT Secret for punch-in tokens (in production, use a secure random string)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Google OAuth2 client for redirect flow
const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Scopes for Google Calendar access
const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
];

var transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com", // Brevo SMTP server
    port: 587,                     // or 465 for SSL
    secure: false,                 // true for port 465, false for 587
    auth: {
        user: '97f29b001@smtp-brevo.com', // your Brevo SMTP username
        pass: 'fHLxUPcJvWQpB3IO' // your Brevo SMTP password (API key)
    }
});

// Generate Google OAuth URL for redirect
app.get("/auth/google", (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });
    res.json({ authUrl });
});

// Handle Google OAuth callback
app.get("/auth/google/callback", async (req, res) => {
    try {
        console.log('OAuth Callback: Received request with query:', req.query);
        const { code, error } = req.query;

        // Check for OAuth error
        if (error) {
            console.error('OAuth Error:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.redirect(`${frontendUrl}/?error=oauth_denied`);
        }

        if (!code) {
            console.error('No authorization code provided');
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.redirect(`${frontendUrl}/?error=no_code`);
        }

        console.log('OAuth Callback: Processing authorization code:', code);

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        console.log('OAuth Callback: Received tokens:', { 
            access_token: tokens.access_token ? 'present' : 'missing',
            refresh_token: tokens.refresh_token ? 'present' : 'missing'
        });
        
        oauth2Client.setCredentials(tokens);

        // Get user info
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data: userInfo } = await oauth2.userinfo.get();
        console.log('OAuth Callback: Retrieved user info:', userInfo);

        const { id: googleId, email, name, picture } = userInfo;

        // Check if owner already exists
        const ownerRef = db.collection("owners").doc(googleId);
        const ownerDoc = await ownerRef.get();

        if (!ownerDoc.exists) {
            console.log('OAuth Callback: Creating new owner document');
            // Create initial owner document
            await ownerRef.set({
                googleId,
                email,
                name,
                picture,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                createdAt: new Date(),
                isRegistered: false, // not completed registration yet
            });
        } else {
            console.log('OAuth Callback: Updating existing owner tokens');
            // Update tokens
            await ownerRef.update({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                updatedAt: new Date(),
            });
        }

        // Store auth data temporarily
        const authData = {
            success: true,
            googleId,
            email,
            name,
            picture,
            isRegistered: ownerDoc.exists ? ownerDoc.data().isRegistered : false
        };

        // Store temporarily (in production, use Redis or similar)
        tempAuthData = authData;
        
        console.log('OAuth Callback: Stored auth data:', authData);
        console.log('OAuth Callback: Redirecting to onboarding page');

        // Redirect to onboarding page with auth data
        
        res.status(200).json(authData);
    } catch (err) {
        console.error("Google OAuth Callback Error:", err);
        const errorData = {
            success: false,
            message: "Authentication failed"
        };
        tempAuthData = errorData;
        
        // Redirect to home page with error
      
        res.status(500).json({ success: false, message: "Authentication failed" });
    }
});

// Temporary storage for auth data (in production, use Redis or similar)
let tempAuthData = null;

// Store temporary auth data
app.post("/auth/temp", (req, res) => {
    tempAuthData = req.body;
    res.json({ success: true });
});

// Get temporary auth data
app.get("/auth/status", (req, res) => {
    console.log('Auth Status: Checking for temp auth data...');
    console.log('Auth Status: tempAuthData exists:', !!tempAuthData);
    
    if (tempAuthData) {
        console.log('Auth Status: Returning auth data:', tempAuthData);
        const data = tempAuthData;
        // Don't clear immediately - let it expire after some time
        setTimeout(() => {
            console.log('Auth Status: Clearing temp auth data after timeout');
            tempAuthData = null;
        }, 30000); // Clear after 30 seconds
        res.json(data);
    } else {
        console.log('Auth Status: No auth data available');
        res.json({ success: false, message: "No auth data available" });
    }
});


app.post("/owner/register", async (req, res) => {
    try {
      const { googleId, shopName, businessHours, ownerPhone, mapsUrl, roles } = req.body;
  
      const ownerRef = db.collection("owners").doc(googleId);
      const ownerDoc = await ownerRef.get();
  
      if (!ownerDoc.exists) {
        return res.status(404).json({ success: false, message: "Owner not found" });
      }
  
      await ownerRef.update({
        phone: ownerPhone,
        mapsUrl,
        isRegistered: true,
      });
  
      const shopRef = db.collection("shops").doc();
      await shopRef.set({
        shopId: shopRef.id,
        ownerId: googleId,
        shopName,
        businessHours: businessHours || [],
        roles: roles || [],
        mapsUrl,
        createdAt: new Date(),
      });
  
      res.json({ success: true, shopId: shopRef.id });
    } catch (err) {
      console.error("Registration Error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  


// Get shop by owner ID
app.get("/owner/:ownerId/shop", async (req, res) => {
    try {
        const { ownerId } = req.params;

        const shopsRef = db.collection("shops");
        const shopSnapshot = await shopsRef.where("ownerId", "==", ownerId).get();

        if (shopSnapshot.empty) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }

        const shopDoc = shopSnapshot.docs[0];
        const shopData = shopDoc.data();

        res.json({
            success: true,
            shop: {
                id: shopDoc.id,
                ...shopData
            }
        });
    } catch (err) {
        console.error("Get Shop by Owner Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Update shop business hours
app.patch("/shop/:shopId/business-hours", async (req, res) => {
    try {
        const { shopId } = req.params;
        const { businessHours } = req.body; // Array of { weekday, start, end, isOpen }

        const shopRef = db.collection("shops").doc(shopId);
        const shopDoc = await shopRef.get();

        if (!shopDoc.exists) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }

        // Update business hours
        await shopRef.update({
            businessHours,
            updatedAt: new Date(),
        });

        res.json({ success: true, message: "Business hours updated" });
    } catch (err) {
        console.error("Update Business Hours Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.post("/owner/add-employee", async (req, res) => {
    try {
        const { ownerId, shopId, name, email, phone, role, wage } = req.body;

        // verify owner exists
        const ownerRef = db.collection("owners").doc(ownerId);
        const ownerDoc = await ownerRef.get();
        if (!ownerDoc.exists) {
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        // generate random password (12 chars)
        const plainPassword = Math.random().toString(36).substring(2, 14);

        // create employee doc
        const empRef = db.collection("employees").doc();
        await empRef.set({
            employeeId: empRef.id,
            ownerId,
            shopId,
            name,
            email,
            phone,
            role,
            wage,
            password: plainPassword, // ❗ plain password (not secure, prototype only)
            createdAt: new Date(),
        });

        // send email with credentials
        const mailOptions = {
            from: `aryanmauryaofficial2601@gmail.com`,
            to: email,
            subject: "Welcome to Shift Scheduler",
            text: `Hello ${name},
  
  You have been added as an employee by ${ownerDoc.data().name}.
  Here are your login credentials:
  
  Email: ${email}
  Password: ${plainPassword}
  
  Please log in and update your availability.
  
  - Shift Scheduler Team`,
        };

        const response = await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Employee onboarded and email sent" });
    } catch (err) {
        console.error("Employee Onboarding Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.get("/owner/:googleId", async (req, res) => {
    try {
        const { googleId } = req.params;

        const ownerRef = db.collection("owners").doc(googleId);
        const ownerDoc = await ownerRef.get();

        if (!ownerDoc.exists) {
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        const ownerData = ownerDoc.data();

        // Remove sensitive tokens from response
        const { accessToken, refreshToken, ...safeOwnerData } = ownerData;

        res.json({ success: true, owner: safeOwnerData });
    } catch (err) {
        console.error("Get Owner Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Update employee availability (full week)
app.post("/employee/:employeeId/availability", async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { availabilities } = req.body; // array of { weekday, start, end, isDayOff, date }

        // Fetch employee
        const empRef = db.collection("employees").doc(employeeId);
        const empDoc = await empRef.get();
        if (!empDoc.exists) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        // Update availability
        await empRef.update({
            availabilities, // replace existing availabilities with the new array
            updatedAt: new Date(),
        });

        res.json({ success: true, message: "Availability updated" });
    } catch (err) {
        console.error("Update Availability Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Update single day availability
app.patch("/employee/:employeeId/availability/:weekday", async (req, res) => {
    try {
        const { employeeId, weekday } = req.params;
        const { start, end, isDayOff } = req.body;

        // Fetch employee
        const empRef = db.collection("employees").doc(employeeId);
        const empDoc = await empRef.get();
        if (!empDoc.exists) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        const employeeData = empDoc.data();
        let availabilities = employeeData.availabilities || [];

        // Find existing availability for this weekday
        const dayIndex = availabilities.findIndex(av => av.weekday === parseInt(weekday));

        const dayAvailability = {
            weekday: parseInt(weekday),
            start: isDayOff ? "00:00" : start,
            end: isDayOff ? "00:00" : end,
            isDayOff: isDayOff || false
        };

        if (dayIndex >= 0) {
            // Update existing day
            availabilities[dayIndex] = dayAvailability;
        } else {
            // Add new day
            availabilities.push(dayAvailability);
        }

        // Sort by weekday
        availabilities.sort((a, b) => a.weekday - b.weekday);

        // Update availability
        await empRef.update({
            availabilities,
            updatedAt: new Date(),
        });

        res.json({ success: true, message: "Day availability updated", availability: dayAvailability });
    } catch (err) {
        console.error("Update Day Availability Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get employee availability
app.get("/employee/:employeeId/availability", async (req, res) => {
    try {
        const { employeeId } = req.params;

        // Fetch employee
        const empRef = db.collection("employees").doc(employeeId);
        const empDoc = await empRef.get();
        if (!empDoc.exists) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        const employeeData = empDoc.data();
        const availabilities = employeeData.availabilities || [];

        res.json({
            success: true,
            availabilities,
            employee: {
                id: employeeId,
                name: employeeData.name,
                email: employeeData.email,
                role: employeeData.role
            }
        });
    } catch (err) {
        console.error("Get Availability Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Google Calendar Integration
// Create calendar event for shift
app.post("/calendar/create-event", async (req, res) => {
    try {
        const { googleId, eventData } = req.body;

        // Get owner's tokens
        const ownerRef = db.collection("owners").doc(googleId);
        const ownerDoc = await ownerRef.get();

        if (!ownerDoc.exists) {
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        const ownerData = ownerDoc.data();
        if (!ownerData.accessToken) {
            return res.status(401).json({ success: false, message: "No calendar access" });
        }

        // Set up OAuth2 client with owner's tokens
        const ownerOAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        ownerOAuth2Client.setCredentials({
            access_token: ownerData.accessToken,
            refresh_token: ownerData.refreshToken
        });

        // Create calendar service
        const calendar = google.calendar({ version: 'v3', auth: ownerOAuth2Client });

        // Create event
        const event = {
            summary: eventData.title || 'Work Shift',
            description: eventData.description || `Shift for ${eventData.employeeName}`,
            start: {
                dateTime: eventData.startDateTime,
                timeZone: eventData.timeZone || 'UTC',
            },
            end: {
                dateTime: eventData.endDateTime,
                timeZone: eventData.timeZone || 'UTC',
            },
            attendees: eventData.attendees || [],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 10 },
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        res.json({
            success: true,
            eventId: response.data.id,
            eventLink: response.data.htmlLink
        });
    } catch (err) {
        console.error("Create Calendar Event Error:", err);
        res.status(500).json({ success: false, message: "Failed to create calendar event" });
    }
});

// Get calendar events
app.get("/calendar/events/:googleId", async (req, res) => {
    try {
        const { googleId } = req.params;
        const { timeMin, timeMax } = req.query;

        // Get owner's tokens
        const ownerRef = db.collection("owners").doc(googleId);
        const ownerDoc = await ownerRef.get();

        if (!ownerDoc.exists) {
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        const ownerData = ownerDoc.data();
        if (!ownerData.accessToken) {
            return res.status(401).json({ success: false, message: "No calendar access" });
        }

        // Set up OAuth2 client with owner's tokens
        const ownerOAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        ownerOAuth2Client.setCredentials({
            access_token: ownerData.accessToken,
            refresh_token: ownerData.refreshToken
        });

        // Create calendar service
        const calendar = google.calendar({ version: 'v3', auth: ownerOAuth2Client });

        // Get events
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin || new Date().toISOString(),
            timeMax: timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime',
        });

        res.json({
            success: true,
            events: response.data.items || []
        });
    } catch (err) {
        console.error("Get Calendar Events Error:", err);
        res.status(500).json({ success: false, message: "Failed to get calendar events" });
    }
});

// Delete calendar event
app.delete("/calendar/events/:googleId/:eventId", async (req, res) => {
    try {
        const { googleId, eventId } = req.params;

        // Get owner's tokens
        const ownerRef = db.collection("owners").doc(googleId);
        const ownerDoc = await ownerRef.get();

        if (!ownerDoc.exists) {
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        const ownerData = ownerDoc.data();
        if (!ownerData.accessToken) {
            return res.status(401).json({ success: false, message: "No calendar access" });
        }

        // Set up OAuth2 client with owner's tokens
        const ownerOAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        ownerOAuth2Client.setCredentials({
            access_token: ownerData.accessToken,
            refresh_token: ownerData.refreshToken
        });

        // Create calendar service
        const calendar = google.calendar({ version: 'v3', auth: ownerOAuth2Client });

        // Delete event
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
        });

        res.json({ success: true, message: "Event deleted successfully" });
    } catch (err) {
        console.error("Delete Calendar Event Error:", err);
        res.status(500).json({ success: false, message: "Failed to delete calendar event" });
    }
});

// Generate punch-in QR token
app.post("/punchin/generate", async (req, res) => {
    try {
        const { ownerId, shopId } = req.body;

        // Validate required fields
        if (!ownerId || !shopId) {
            return res.status(400).json({ 
                success: false, 
                message: "Owner ID and Shop ID are required" 
            });
        }

        // Verify owner exists
        const ownerRef = db.collection("owners").doc(ownerId);
        const ownerDoc = await ownerRef.get();
        if (!ownerDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: "Owner not found" 
            });
        }

        // Verify shop exists and belongs to owner
        const shopRef = db.collection("shops").doc(shopId);
        const shopDoc = await shopRef.get();
        if (!shopDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: "Shop not found" 
            });
        }

        const shopData = shopDoc.data();
        if (shopData.ownerId !== ownerId) {
            return res.status(403).json({ 
                success: false, 
                message: "Shop does not belong to this owner" 
            });
        }

        // Generate JWT token with 24-hour expiration
        const tokenPayload = {
            ownerId,
            shopId,
            shopName: shopData.shopName,
            generatedAt: new Date().toISOString(),
            type: 'punchin_qr'
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { 
            expiresIn: '24h' 
        });

        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(token, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // Store the token in database for validation (optional - for tracking)
        const punchinTokenRef = db.collection("punchin_tokens").doc();
        await punchinTokenRef.set({
            tokenId: punchinTokenRef.id,
            token,
            ownerId,
            shopId,
            generatedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            isUsed: false,
            usedAt: null
        });

        res.json({
            success: true,
            token,
            qrCode: qrCodeDataURL,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            shopName: shopData.shopName
        });

    } catch (err) {
        console.error("Generate Punch-in QR Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to generate punch-in QR code" 
        });
    }
});

// Employee authentication endpoint
app.post("/employee/authenticate", async (req, res) => {
    try {
        const { employeeId, password } = req.body;
        
        if (!employeeId || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Employee ID and password are required" 
            });
        }

        // Fetch employee
        const empRef = db.collection("employees").doc(employeeId);
        const empDoc = await empRef.get();
        
        if (!empDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: "Employee not found" 
            });
        }

        const employeeData = empDoc.data();
        
        // Verify password (in production, use proper password hashing)
        if (employeeData.password !== password) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        // Return employee data (without password)
        const { password: _, ...safeEmployeeData } = employeeData;
        
        res.json({
            success: true,
            employee: {
                id: employeeId,
                ...safeEmployeeData
            }
        });
    } catch (err) {
        console.error("Employee Authentication Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Authentication failed" 
        });
    }
});

// Employee authentication middleware
const authenticateEmployee = async (req, res, next) => {
    try {
        const { employeeId, password } = req.body;
        
        if (!employeeId || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Employee ID and password are required" 
            });
        }

        // Fetch employee
        const empRef = db.collection("employees").doc(employeeId);
        const empDoc = await empRef.get();
        
        if (!empDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: "Employee not found" 
            });
        }

        const employeeData = empDoc.data();
        
        // Verify password (in production, use proper password hashing)
        if (employeeData.password !== password) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        // Add employee data to request
        req.employee = {
            id: employeeId,
            ...employeeData
        };
        
        next();
    } catch (err) {
        console.error("Employee Authentication Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Authentication failed" 
        });
    }
};

// Punch in scan API - verifies QR token and punches in employee
app.post("/punchin/scan", authenticateEmployee, async (req, res) => {
    try {
        const { qrToken } = req.body;
        const employee = req.employee;

        if (!qrToken) {
            return res.status(400).json({ 
                success: false, 
                message: "QR token is required" 
            });
        }

        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(qrToken, JWT_SECRET);
        } catch (jwtErr) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid or expired QR token" 
            });
        }

        // Check if token is for punch-in
        if (decoded.type !== 'punchin_qr') {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid token type" 
            });
        }

        // Verify employee belongs to the shop
        if (employee.shopId !== decoded.shopId) {
            return res.status(403).json({ 
                success: false, 
                message: "Employee does not belong to this shop" 
            });
        }

        // Check if employee is already punched in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const punchRecordsRef = db.collection("punch_records");
        const existingPunchIn = await punchRecordsRef
            .where("employeeId", "==", employee.id)
            .where("shopId", "==", decoded.shopId)
            .where("punchType", "==", "punchin")
            .where("timestamp", ">=", today)
            .where("timestamp", "<", tomorrow)
            .get();

        if (!existingPunchIn.empty) {
            return res.status(400).json({ 
                success: false, 
                message: "Employee has already punched in today" 
            });
        }

        // Create punch-in record
        const punchRecordRef = db.collection("punch_records").doc();
        const punchRecord = {
            recordId: punchRecordRef.id,
            employeeId: employee.id,
            employeeName: employee.name,
            shopId: decoded.shopId,
            shopName: decoded.shopName,
            ownerId: decoded.ownerId,
            punchType: "punchin",
            timestamp: new Date(),
            qrToken: qrToken,
            location: "QR Scan", // Could be enhanced with GPS coordinates
            createdAt: new Date()
        };

        await punchRecordRef.set(punchRecord);

        // Mark QR token as used (optional)
        const punchinTokenRef = db.collection("punchin_tokens");
        const tokenQuery = await punchinTokenRef
            .where("token", "==", qrToken)
            .where("isUsed", "==", false)
            .get();

        if (!tokenQuery.empty) {
            const tokenDoc = tokenQuery.docs[0];
            await tokenDoc.ref.update({
                isUsed: true,
                usedAt: new Date(),
                usedBy: employee.id
            });
        }

        res.json({
            success: true,
            message: "Successfully punched in",
            punchRecord: {
                id: punchRecord.recordId,
                employeeName: employee.name,
                shopName: decoded.shopName,
                punchType: "punchin",
                timestamp: punchRecord.timestamp
            }
        });

    } catch (err) {
        console.error("Punch In Scan Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to process punch in" 
        });
    }
});

// Punch out API - for employee self punch out and owner manual punch out
app.post("/punchout", async (req, res) => {
    try {
        const { employeeId, password, ownerId, shopId } = req.body;

        let employee, shopIdToUse;

        // Check if this is an owner manually punching out an employee
        if (ownerId && shopId && !password) {
            // Owner punch out - verify owner exists
            const ownerRef = db.collection("owners").doc(ownerId);
            const ownerDoc = await ownerRef.get();
            
            if (!ownerDoc.exists) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Owner not found" 
                });
            }

            // Verify shop belongs to owner
            const shopRef = db.collection("shops").doc(shopId);
            const shopDoc = await shopRef.get();
            
            if (!shopDoc.exists || shopDoc.data().ownerId !== ownerId) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Shop not found or does not belong to owner" 
                });
            }

            // Get employee
            const empRef = db.collection("employees").doc(employeeId);
            const empDoc = await empRef.get();
            
            if (!empDoc.exists) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Employee not found" 
                });
            }

            employee = { id: employeeId, ...empDoc.data() };
            shopIdToUse = shopId;

        } else {
            // Employee self punch out - authenticate employee
            if (!employeeId || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Employee ID and password are required" 
                });
            }

            const empRef = db.collection("employees").doc(employeeId);
            const empDoc = await empRef.get();
            
            if (!empDoc.exists) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Employee not found" 
                });
            }

            const employeeData = empDoc.data();
            
            if (employeeData.password !== password) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Invalid credentials" 
                });
            }

            employee = { id: employeeId, ...employeeData };
            shopIdToUse = employee.shopId;
        }

        // Check if employee has punched in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const punchRecordsRef = db.collection("punch_records");
        const punchInRecord = await punchRecordsRef
            .where("employeeId", "==", employee.id)
            .where("shopId", "==", shopIdToUse)
            .where("punchType", "==", "punchin")
            .where("timestamp", ">=", today)
            .where("timestamp", "<", tomorrow)
            .get();

        if (punchInRecord.empty) {
            return res.status(400).json({ 
                success: false, 
                message: "Employee has not punched in today" 
            });
        }

        // Check if employee has already punched out today
        const punchOutRecord = await punchRecordsRef
            .where("employeeId", "==", employee.id)
            .where("shopId", "==", shopIdToUse)
            .where("punchType", "==", "punchout")
            .where("timestamp", ">=", today)
            .where("timestamp", "<", tomorrow)
            .get();

        if (!punchOutRecord.empty) {
            return res.status(400).json({ 
                success: false, 
                message: "Employee has already punched out today" 
            });
        }

        // Get shop information
        const shopRef = db.collection("shops").doc(shopIdToUse);
        const shopDoc = await shopRef.get();
        const shopData = shopDoc.data();

        // Create punch-out record
        const punchRecordRef = db.collection("punch_records").doc();
        const punchRecord = {
            recordId: punchRecordRef.id,
            employeeId: employee.id,
            employeeName: employee.name,
            shopId: shopIdToUse,
            shopName: shopData.shopName,
            ownerId: shopData.ownerId,
            punchType: "punchout",
            timestamp: new Date(),
            location: ownerId ? "Manual (Owner)" : "Self",
            punchedOutBy: ownerId || null,
            createdAt: new Date()
        };

        await punchRecordRef.set(punchRecord);

        // Calculate work hours
        const punchInTime = punchInRecord.docs[0].data().timestamp.toDate();
        const punchOutTime = new Date();
        const workHours = (punchOutTime - punchInTime) / (1000 * 60 * 60); // Convert to hours

        res.json({
            success: true,
            message: "Successfully punched out",
            punchRecord: {
                id: punchRecord.recordId,
                employeeName: employee.name,
                shopName: shopData.shopName,
                punchType: "punchout",
                timestamp: punchRecord.timestamp,
                workHours: Math.round(workHours * 100) / 100 // Round to 2 decimal places
            }
        });

    } catch (err) {
        console.error("Punch Out Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to process punch out" 
        });
    }
});

// Get punch records for an employee
app.get("/employee/:employeeId/punch-records", async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { startDate, endDate, limit = 50 } = req.query;

        // Verify employee exists
        const empRef = db.collection("employees").doc(employeeId);
        const empDoc = await empRef.get();
        
        if (!empDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: "Employee not found" 
            });
        }

        let query = db.collection("punch_records")
            .where("employeeId", "==", employeeId)
            .orderBy("timestamp", "desc")
            .limit(parseInt(limit));

        // Add date filters if provided
        if (startDate) {
            query = query.where("timestamp", ">=", new Date(startDate));
        }
        if (endDate) {
            query = query.where("timestamp", "<=", new Date(endDate));
        }

        const punchRecordsSnapshot = await query.get();
        const punchRecords = punchRecordsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate()
        }));

        res.json({
            success: true,
            punchRecords,
            employee: {
                id: employeeId,
                name: empDoc.data().name,
                email: empDoc.data().email
            }
        });

    } catch (err) {
        console.error("Get Punch Records Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to get punch records" 
        });
    }
});

// Get all punch records for a shop (owner view)
app.get("/shop/:shopId/punch-records", async (req, res) => {
    try {
        const { shopId } = req.params;
        const { startDate, endDate, limit = 100 } = req.query;

        // Verify shop exists
        const shopRef = db.collection("shops").doc(shopId);
        const shopDoc = await shopRef.get();
        
        if (!shopDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: "Shop not found" 
            });
        }

        let query = db.collection("punch_records")
            .where("shopId", "==", shopId)
            .orderBy("timestamp", "desc")
            .limit(parseInt(limit));

        // Add date filters if provided
        if (startDate) {
            query = query.where("timestamp", ">=", new Date(startDate));
        }
        if (endDate) {
            query = query.where("timestamp", "<=", new Date(endDate));
        }

        const punchRecordsSnapshot = await query.get();
        const punchRecords = punchRecordsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate()
        }));

        res.json({
            success: true,
            punchRecords,
            shop: {
                id: shopId,
                name: shopDoc.data().shopName
            }
        });

    } catch (err) {
        console.error("Get Shop Punch Records Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to get punch records" 
        });
    }
});

app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});