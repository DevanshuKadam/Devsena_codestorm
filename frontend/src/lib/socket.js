import { io } from "socket.io-client";

const socket = io("http://localhost:3000", { autoConnect: false })

// Get Google ID and role from localStorage
const getUserData = () => {
    try {
        const ownerData = localStorage.getItem('ownerData');
        const employeeData = localStorage.getItem('employeeData');
        
        if (ownerData) {
            const parsedOwnerData = JSON.parse(ownerData);
            return {
                id: parsedOwnerData.googleId || parsedOwnerData.id || null,
                role: "owner"
            };
        } else if (employeeData) {
            const parsedEmployeeData = JSON.parse(employeeData);

            return {
                id: parsedEmployeeData.employeeId || parsedEmployeeData.id || null,
                role: "employee"
            };
        }
    } catch (error) {
        console.error('Error parsing localStorage data:', error);
    }
    
    // Fallback to direct keys if structured data doesn't exist
    const googleId = localStorage.getItem('googleId') || localStorage.getItem('ownerId');
    if (googleId) {
        return { id: googleId, role: "owner" };
    }
    
    return { id: null, role: "anonymous" };
};

// Set up socket auth with user data and role
const setupSocketAuth = () => {
    const userData = getUserData();
    if (userData.id) {
        socket.auth = { 
            user_name: userData.id,
            role: userData.role
        };
        console.log('Socket auth set with:', userData);
    } else {
        console.warn('No user data found in localStorage');
        socket.auth = { 
            user_name: "anonymous",
            role: "anonymous"
        };
    }
};

// Initialize socket auth
setupSocketAuth();

// Function to update socket auth (can be called when Google ID changes)
const updateSocketAuth = () => {
    setupSocketAuth();
};

socket.onAny((event, ...args) => {
    console.log(event, args);
});

export { socket, updateSocketAuth }


