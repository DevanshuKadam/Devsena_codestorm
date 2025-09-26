import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallbackSimple = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallbackSimple: Starting auth callback process...');
        
        // Wait a bit for the backend to process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get auth data from backend
        const response = await fetch('http://localhost:3000/auth/status');
        const authData = await response.json();
        
        console.log('AuthCallbackSimple: Received auth data:', authData);
        
        if (authData.success && authData.googleId) {
          console.log('AuthCallbackSimple: Authentication successful, storing user data...');
          
          // Store user data in localStorage for persistence
          const userData = {
            googleId: authData.googleId,
            email: authData.email,
            name: authData.name,
            picture: authData.picture
          };
          
          localStorage.setItem('ownerData', JSON.stringify(userData));
          console.log('AuthCallbackSimple: User data stored in localStorage:', userData);
          
          // Verify the data was stored
          const storedData = localStorage.getItem('ownerData');
          console.log('AuthCallbackSimple: Verification - stored data:', storedData);
          
          console.log('AuthCallbackSimple: User data stored, checking registration status...');
          console.log('AuthCallbackSimple: isRegistered:', authData.isRegistered);
          
          // Redirect based on registration status
          if (authData.isRegistered) {
            console.log('AuthCallbackSimple: User is registered, redirecting to dashboard...');
            navigate('/admin/schedule-dashboard', { replace: true });
          } else {
            console.log('AuthCallbackSimple: User not registered, redirecting to onboarding...');
            navigate('/admin/onboarding', { replace: true });
          }
        } else {
          // Authentication failed, redirect to landing with error
          console.error('AuthCallbackSimple: Authentication failed:', authData.message);
          navigate('/admin?error=auth_failed', { replace: true });
        }
      } catch (error) {
        console.error('AuthCallbackSimple: Error handling auth callback:', error);
        navigate('/admin?error=auth_error', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Processing authentication...</p>
        <p className="text-sm text-gray-500 mt-2">AuthCallbackSimple component loaded</p>
      </div>
    </div>
  );
};

export default AuthCallbackSimple;
