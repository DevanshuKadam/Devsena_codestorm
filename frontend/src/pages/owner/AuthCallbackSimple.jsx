import React, { useEffect } from 'react';

const AuthCallbackSimple = () => {
  useEffect(() => {
    // This page will get the auth data from the backend
    // and close the popup so the main app can pick up the data
    
    const handleAuthCallback = async () => {
      try {
        // Get auth data from backend
        const response = await fetch('http://localhost:3000/auth/status');
        const authData = await response.json();
        
        if (authData.success && authData.googleId) {
          // Store user data in localStorage
          localStorage.setItem('ownerData', JSON.stringify({
            googleId: authData.googleId,
            email: authData.email,
            name: authData.name,
            picture: authData.picture
          }));
          
          // Store registration status for the main app to use
          localStorage.setItem('authStatus', JSON.stringify({
            isRegistered: authData.isRegistered,
            success: true
          }));
        } else {
          // Store error status
          localStorage.setItem('authStatus', JSON.stringify({
            success: false,
            message: authData.message || 'Authentication failed'
          }));
        }
        
        // Close the popup
        window.close();
      } catch (error) {
        console.error('Error handling auth callback:', error);
        localStorage.setItem('authStatus', JSON.stringify({
          success: false,
          message: 'Authentication failed'
        }));
        window.close();
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallbackSimple;
