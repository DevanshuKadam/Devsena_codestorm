import express from "express";
import cors from "cors";
import { createServer } from "http"
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { db } from "./firestore.js";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { AImodel } from "./geminiAi.js";

dotenv.config();

const app = express()
const httpserver = createServer(app)

// JWT Secret for punch-in tokens (in production, use a secure random string)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

const io = new Server(httpserver, {
    cors: {
        origin: "http://localhost:5173"
    }
})

io.use((socket, next) => {
    const user_name = socket.handshake.auth.user_name;
    console.log(user_name)
    socket.user_name = user_name
    next()
});

async function fetchAllemployees(shopId) {
    const employeesRef = db.collection("employees").where("shopId", "==", shopId);
    const employeesDoc = await employeesRef.get();
    return employeesDoc.docs.map(doc => doc.data());
}

async function fetchShopData(shopId) {
    const shopRef = db.collection("shops").doc(shopId);
    const shopDoc = await shopRef.get();
    return shopDoc.data();
}

io.on('connection', (socket) => {
    console.log(socket.id, socket.user_name)

    const actual_history = [{
        role: "user",
        parts: [
            {
                text: `You are Jharkhand Tourism Assistant, a specialized AI guide for exploring the beautiful state of Jharkhand, India. Your name is Sarthi meaning guide or companion in Hindi.

Your primary functions are:
1. Help users discover tourist destinations, attractions, and activities in Jharkhand
2. Generate personalized itineraries based on user preferences, budget, and duration
3. Provide detailed information about places, timings, entry fees, and best times to visit
4. Answer tourism-related questions about Jharkhand's culture, history, and attractions
5. Navigate users through different sections of the tourism website
6. Save and update itineraries when users request to save their itinerary
7. Act as a general website assistant for any other queries

When users ask about destinations or attractions, provide comprehensive information including description and highlights, best time to visit, entry fees and timings, nearby attractions, budget estimates, and travel tips.

For general questions about the website, tourism, or any other topics, provide helpful and informative responses without asking follow-up questions.

Only when users specifically ask to generate an itinerary, then ask follow-up questions to gather more details about their preferences before creating the itinerary. Ask about their interests, budget range, preferred duration, accommodation preferences, and any specific places they want to visit.

When the user wants to search for destinations or attractions, generate the response in JSON format as follows:
{
  "data-type": "JSON",
  "search_result": [{destination1}, {destination2}, ...],
  "summary": "Brief overview of search results"
}

For itinerary requests, respond with:
{
  "data-type": "ITINERARY",
  "itinerary": {
    "title": "Itinerary Title",
    "duration": "X days",
    "budget": "₹X-₹Y per person",
    "destinations": ["Destination1", "Destination2"],
    "day_wise_plan": [
      {
        "day": 1,
        "date": "YYYY-MM-DD",
        "destinations": ["Destination1", "Destination2"],
        "activities": ["Activity1", "Activity2"],
        "accommodation": "Hotel/Resort name"
      }
    ],
    "tips": ["Tip1", "Tip2"]
  }
}

After generating an itinerary, always include a short summary about the places visited and cost estimation in paragraph format.

When users ask to save their itinerary, emit a save command with the itinerary data in JSON format as follows. Make sure to include the exact command "SAVE_ITINERARY" in quotes:

{
  "data-type": "SAVE_ITINERARY",
  "command": "save",
  "itinerary": {
    "title": "Itinerary Title",
    "duration": "X days",
    "budget": "₹X-₹Y per person",
    "destinations": ["Destination1", "Destination2"],
    "day_wise_plan": [
      {
        "day": 1,
        "date": "YYYY-MM-DD",
        "destinations": ["Destination1", "Destination2"],
        "activities": ["Activity1", "Activity2"],
        "accommodation": "Hotel/Resort name"
      }
    ],
    "tips": ["Tip1", "Tip2"]
  }
}

After emitting the save command, respond with only: "Itinerary saved successfully!"

When the user asks to navigate to a page, respond with exactly: open pagename. Available pages are home, destinations, itinerary, marketplace, profile. Do not add any other text or explanation when responding to navigation requests.

Always answer in paragraph format only. Do not use bullet points, numbered lists, or any special characters. Write complete sentences in flowing paragraphs. Keep responses helpful, engaging, and focused on promoting Jharkhand tourism. Always provide practical and accurate information.

`
            },
        ],
    },
    {
        role: "user",
        parts: [
            { text: JSON.stringify(user_profile) },
        ],
    },
    {
        role: "user",
        parts: [
            { text: JSON.stringify(tourism_destinations) },
        ],
    },
    {
        role: "user",
        parts: [
            { text: "Attractions are now included within each destination data." },
        ],
    },
    {
        role: "model",
        parts: [
            { text: "Namaste! I am Sarthi, your personal tourism guide for Jharkhand. I'm here to help you discover the incredible beauty, culture, and attractions of our state. How can I assist you in planning your Jharkhand adventure?" },
        ],
    },]


        const chatSession = AImodel.startChat({

            // safetySettings: Adjust safety settings
            // See https://ai.google.dev/gemini-api/docs/safety-settings
            history: actual_history
        });

        socket.on('prompt', async (response) => {
            console.log(response)

            actual_history.push({
                role: "user",
                parts: [
                    { text: `${response}` }
                ]
            })

            try {
                const result = await chatSession.sendMessage(response);
                const Airesponse = result.response.text();

                if (Airesponse) {
                    actual_history.push({
                        role: "model",
                        parts: [
                            { text: `${Airesponse}` }
                        ]
                    })
                }
                console.log(Airesponse)

                // Check if the AI response contains save itinerary command
                let isSavingItinerary = false;
                try {
                    const responseText = Airesponse;
                    if (responseText.includes('"data-type": "SAVE_ITINERARY"')) {
                        isSavingItinerary = true;
                        // Extract JSON from the response
                        const jsonMatch = responseText.match(/\{[\s\S]*"data-type":\s*"SAVE_ITINERARY"[\s\S]*\}/);
                        if (jsonMatch) {
                            const saveData = JSON.parse(jsonMatch[0]);
                            if (saveData.itinerary) {
                                // Save itinerary to in-memory array
                                const itineraryId = `itinerary_${Date.now()}`;
                                const itineraryToSave = {
                                    id: itineraryId,
                                    title: saveData.itinerary.title,
                                    duration: saveData.itinerary.duration,
                                    budget: saveData.itinerary.budget,
                                    destinations: saveData.itinerary.destinations,
                                    day_wise_plan: saveData.itinerary.day_wise_plan,
                                    tips: saveData.itinerary.tips || [],
                                    user_id: socket.user_name || "anonymous",
                                    created_by: "AI Assistant",
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString(),
                                    status: "active"
                                };

                                // Add to in-memory array
                                all_itineraries.itineraries.push(itineraryToSave);

                                console.log("Itinerary saved:", itineraryToSave);
                            }
                        }
                    }
                } catch (parseError) {
                    console.log("Could not parse save itinerary command from AI response:", parseError);
                }

                // Emit response only when saving itinerary with success message, otherwise emit the AI response
                if (isSavingItinerary) {
                    socket.emit("response", "Itinerary saved successfully!");
                } else {
                    socket.emit("response", Airesponse);
                }

            }
            catch (err) {
                socket.emit("error", "some internal error occured")
                console.error(err)
            }

        })
    })



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

        // console.log('OAuth Callback: Processing authorization code:', code);

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        // console.log('OAuth Callback: Received tokens:', { 
        //     access_token: tokens.access_token ? 'present' : 'missing',
        //     refresh_token: tokens.refresh_token ? 'present' : 'missing'
        // });
        
        oauth2Client.setCredentials(tokens);

        // Get user info
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data: userInfo } = await oauth2.userinfo.get();
        // console.log('OAuth Callback: Retrieved user info:', userInfo);

        const { id: googleId, email, name, picture } = userInfo;

        // Check if owner already exists
        const ownerRef = db.collection("owners").doc(googleId);
        const ownerDoc = await ownerRef.get();

        if (!ownerDoc.exists) {
            // console.log('OAuth Callback: Creating new owner document');
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
            // console.log('OAuth Callback: Updating existing owner tokens');
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
        
        // console.log('OAuth Callback: Stored auth data:', authData);
        // console.log('OAuth Callback: Redirecting to onboarding page');

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
    // console.log('Auth Status: Checking for temp auth data...');
    // console.log('Auth Status: tempAuthData exists:', !!tempAuthData);
    
    if (tempAuthData) {
        // console.log('Auth Status: Returning auth data:', tempAuthData);
        const data = tempAuthData;
        // Don't clear immediately - let it expire after some time
        setTimeout(() => {
            // console.log('Auth Status: Clearing temp auth data after timeout');
            tempAuthData = null;
        }, 30000); // Clear after 30 seconds
        res.json(data);
    } else {
        // console.log('Auth Status: No auth data available');
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

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Employee onboarded and email sent" });
    } catch (err) {
        console.error("Employee Onboarding Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get complete business profile data (owner + shop) for BusinessProfile component
app.get("/owner/:googleId/business-profile", async (req, res) => {
    try {
        const { googleId } = req.params;

        // Get owner data
        const ownerRef = db.collection("owners").doc(googleId);
        const ownerDoc = await ownerRef.get();

        if (!ownerDoc.exists) {
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        const ownerData = ownerDoc.data();

        // Get shop data
        const shopsRef = db.collection("shops");
        const shopSnapshot = await shopsRef.where("ownerId", "==", googleId).get();

        let shopData = null;
        if (!shopSnapshot.empty) {
            const shopDoc = shopSnapshot.docs[0];
            shopData = {
                id: shopDoc.id,
                ...shopDoc.data()
            };
        }

        // Remove sensitive tokens from owner data
        const { accessToken, refreshToken, ...safeOwnerData } = ownerData;

        // Combine data for BusinessProfile component
        const businessProfile = {
            owner: safeOwnerData,
            shop: shopData,
            hasShop: !!shopData
        };

        res.json({ 
            success: true, 
            businessProfile 
        });
    } catch (err) {
        console.error("Get Business Profile Error:", err);
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

app.post("/employee/login", async(req, res) => {
    const { email, password } = req.body;
    const empRef = db.collection("employees").where("email", "==", email);
    const empDoc = await empRef.get();
    if (!empDoc.exists) {
        return res.status(404).json({ success: false, message: "Employee not found" });
    }

    if (empDoc.data().password !== password) {
        return res.status(401).json({ success: false, message: "Invalid password" });
    }

    res.json({ success: true, employeeId : empDoc.data().employeeId });
})

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
app.patch("/employee/:employeeId/update-availability", async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { weekday, start, end, isDayOff } = req.body;

        // Validate required fields
        if (weekday === undefined || weekday === null) {
            return res.status(400).json({ success: false, message: "Weekday is required" });
        }

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


app.post("/week-schedule", async (req, res) => {
    const { shopId, minimumHours = 8, maximumHours = 40, prompt } = req.body;

    const employeeData = await fetchAllemployees(shopId);
    const shopData = await fetchShopData(shopId);

    const history = [
        {
            role: "user",
            parts: [
                {
                    text: `You will be provided with the shop's details, including its working hours for each day of the week, as well as the list of employees along with their availability for the entire week. Your task is to generate a complete weekly schedule for all employees, ensuring that ALL working hours of the shop are FULLY COVERED with NO GAPS.

CRITICAL REQUIREMENT: The shop's operating hours must be covered entirely - there should be NO time periods during business hours where no employee is scheduled to work. Every minute of the shop's operating hours must have at least one employee assigned.

IMPORTANT CONSTRAINTS:
- Maximum working hours per employee per week: ${maximumHours} hours
- Minimum working hours per employee per week: ${minimumHours} hours
- Custom user requirements: ${prompt || 'No specific requirements provided'}
- MANDATORY: Complete coverage of all shop operating hours with no gaps

Assign employees to shifts based on their availability, and if no employee is available for a particular shift, assign the employee whose availability is closest and include an incentive for that shift. The schedule should be balanced, avoiding overloading a single employee whenever possible. Respect the maximum working hours constraint and ensure fair distribution of shifts among all employees.

PRIMARY OBJECTIVE: Ensure 100% coverage of shop operating hours. If necessary, overlap shifts or assign multiple employees to ensure continuous coverage throughout all business hours.

Present the schedule in JSON format for all workdays of the week (Sunday = 0 to Saturday = 6), including the shop ID, day-wise schedule, shift start and end times, and assigned employee IDs. Additionally, provide brief AI-powered suggestions for optimizing the schedule in short paragraph format.

The JSON response structure should follow this format:
{
  "shopId": "shop_123",
  "schedule": [
    {
      "workday": 0,
      "timings": [
        { "start": "09:00", "end": "13:00", "employeeId": "emp_1" },
        { "start": "13:00", "end": "17:00", "employeeId": "emp_2" }
      ]
    },
    {
      "workday": 1,
      "timings": [
        { "start": "10:00", "end": "14:00", "employeeId": "emp_2" }
      ]
    },
    ...
    {
      "workday": 6,
      "timings": [
        { "start": "12:00", "end": "16:00", "employeeId": "emp_3" }
      ]
    }
  ],
  "ai_suggestions": "Consider hiring additional weekend staff to reduce overtime costs. Adjust Wednesday afternoon coverage to prevent gaps. Cross-train employees to improve schedule flexibility and reduce bottlenecks."
}

Ensure that every day of the week is included in the schedule, all shop hours are covered, and incentives are noted whenever an employee is assigned outside their usual availability. Provide concise AI suggestions in a single paragraph format focusing on the most important recommendations.` },
            ],
        },
        {
            role: "user",
            parts: [
                { text: `SHOP DATA: ${JSON.stringify(shopData)}` },
            ],
        },
        {
            role: "user",
            parts: [
                { text: `EMPLOYEE DATA: ${JSON.stringify(employeeData)}` },
            ],
        },
    ]

    try {
        const chatSession = AImodel.startChat({
            history
        });

        const result = await chatSession.sendMessage("Generate the weekly schedule based on the provided data and constraints.");
        const response = result.response.text();

        // Parse the JSON response
        let scheduleData;
        try {
            // Extract JSON from the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                scheduleData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("No valid JSON found in response");
            }
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            return res.status(500).json({ 
                success: false, 
                message: "Failed to parse schedule response",
                rawResponse: response 
            });
        }

        res.json({ 
            success: true, 
            schedule: scheduleData,
            message: "Weekly schedule generated successfully"
        });

    } catch (err) {
        console.error("Schedule Generation Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to generate schedule",
            error: err.message 
        });
    }
})


app.post("/save-week-schedule", async(req, res) => {
    try {
        const { shopId, schedule, ownerId } = req.body;
        
        if (!ownerId) {
            return res.status(400).json({ success: false, message: "Owner ID is required" });
        }

        // Get owner's tokens
        const ownerRef = db.collection("owners").doc(ownerId);
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

        // Get next week's dates starting from tomorrow (Sunday to Saturday)
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1); // Tomorrow
        tomorrow.setHours(0, 0, 0, 0);
        
        const currentDay = tomorrow.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const startOfWeek = new Date(tomorrow);
        startOfWeek.setDate(tomorrow.getDate() - currentDay); // Go back to Sunday of next week
        startOfWeek.setHours(0, 0, 0, 0);

        // Get employee details for email addresses
        const employeeEmails = {};
        for (const daySchedule of schedule) {
            for (const timing of daySchedule.timings) {
                if (!employeeEmails[timing.employeeId]) {
                    const empRef = db.collection("employees").doc(timing.employeeId);
                    const empDoc = await empRef.get();
                    if (empDoc.exists) {
                        employeeEmails[timing.employeeId] = empDoc.data().email;
                    }
                }
            }
        }

        // Create calendar events for each day
        const createdEvents = [];
        for (const daySchedule of schedule) {
            const workday = daySchedule.workday; // 0 = Sunday, 1 = Monday, etc.
            const eventDate = new Date(startOfWeek);
            eventDate.setDate(startOfWeek.getDate() + workday);

            for (const timing of daySchedule.timings) {
                const startDateTime = new Date(eventDate);
                const [startHour, startMinute] = timing.start.split(':').map(Number);
                startDateTime.setHours(startHour, startMinute, 0, 0);

                const endDateTime = new Date(eventDate);
                const [endHour, endMinute] = timing.end.split(':').map(Number);
                endDateTime.setHours(endHour, endMinute, 0, 0);

                // Get employee name for event title
                const empRef = db.collection("employees").doc(timing.employeeId);
                const empDoc = await empRef.get();
                const employeeName = empDoc.exists ? empDoc.data().name : `Employee ${timing.employeeId}`;

                const event = {
                    summary: `${employeeName} - Work Shift`,
                    description: timing.incentive ? `Work Shift (${timing.incentive})` : 'Work Shift',
                    start: {
                        dateTime: startDateTime.toISOString(),
                        timeZone: 'Asia/Kolkata',
                    },
                    end: {
                        dateTime: endDateTime.toISOString(),
                        timeZone: 'Asia/Kolkata',
                    },
                    attendees: employeeEmails[timing.employeeId] ? [
                        { email: employeeEmails[timing.employeeId] }
                    ] : [],
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'email', minutes: 24 * 60 },
                            { method: 'popup', minutes: 60 },
                        ],
                    },
                };

                try {
                    const response = await calendar.events.insert({
                        calendarId: 'primary',
                        resource: event,
                    });
                    createdEvents.push({
                        eventId: response.data.id,
                        employeeId: timing.employeeId,
                        start: timing.start,
                        end: timing.end,
                        date: eventDate.toISOString().split('T')[0]
                    });
                } catch (eventError) {
                    console.error(`Error creating event for ${timing.employeeId}:`, eventError);
                }
            }
        }

        // Save schedule to database
        const docRef = db.collection("schedules").doc();
        await docRef.set({
            shopId,
            schedule,
            scheduleId: docRef.id,
            ownerId,
            createdAt: new Date(),
            calendarEvents: createdEvents
        });

        res.json({ 
            success: true, 
            message: "Schedule saved and calendar events created successfully",
            scheduleId: docRef.id,
            eventsCreated: createdEvents.length,
            events: createdEvents
        });

    } catch (err) {
        console.error("Save Schedule Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to save schedule and create calendar events",
            error: err.message 
        });
    }
})

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

httpserver.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});