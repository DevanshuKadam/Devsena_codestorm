import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Calendar, Users } from 'lucide-react';
import OwnerNavbar from '../../components/OwnerNavbar';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if this is a callback from Google OAuth
    const googleId = searchParams.get('googleId');
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const picture = searchParams.get('picture');

    if (googleId && email) {
      // Store user data
      localStorage.setItem('ownerData', JSON.stringify({
        googleId,
        email,
        name: decodeURIComponent(name || ''),
        picture
      }));

      // Check if owner is already registered
      checkOwnerRegistration(googleId);
    }
  }, [searchParams, navigate]);

  const checkOwnerRegistration = async (googleId) => {
    try {
      const response = await fetch(`http://localhost:3000/owner/${googleId}`);
      const data = await response.json();

      if (data.success && data.owner.isRegistered) {
        // Owner is registered, go to dashboard
        navigate('/admin/schedule-dashboard');
      } else {
        // Owner needs to complete registration
        navigate('/admin/onboarding');
      }
    } catch (error) {
      console.error('Error checking owner registration:', error);
      navigate('/admin/onboarding');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Get Google OAuth URL from backend
      const response = await fetch('http://localhost:3000/auth/google');
      const data = await response.json();

      if (data.authUrl) {
        // Open OAuth in a popup window
        const popup = window.open(
          data.authUrl,
          'google-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for the popup to close or receive data
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            
            // The popup has closed, check for auth status in localStorage
            const authStatus = localStorage.getItem('authStatus');
            if (authStatus) {
              const { success, isRegistered, message } = JSON.parse(authStatus);
              localStorage.removeItem('authStatus'); // Clear after use
              
              if (success) {
                // Navigate based on registration status
                if (isRegistered) {
                  navigate('/admin/schedule-dashboard');
                } else {
                  navigate('/admin/onboarding');
                }
              } else {
                alert(message || 'Authentication failed. Please try again.');
              }
            } else {
              alert('Authentication was cancelled or failed.');
            }
          }
        }, 1000);
      } else {
        alert('Failed to get Google OAuth URL');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      alert('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-twine-50 to-twine-100">
      <OwnerNavbar />
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-twine-500 to-twine-700 shadow-lg">
              <Calendar className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-twine-800 mb-4">Sign in to WorkFlow AI</h1>
          <p className="text-twine-600 mb-6">Connect your Google account to access calendar integration and manage your workforce</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-twine-200 p-8 mb-8">
          <h3 className="text-lg font-semibold text-twine-800 mb-4">What you'll get access to:</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-twine-600" />
              <span className="text-twine-700">Google Calendar integration for shift scheduling</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-twine-600" />
              <span className="text-twine-700">AI-powered workforce management</span>
            </div>
            <div className="flex items-center gap-3">
              <LogIn className="w-5 h-5 text-twine-600" />
              <span className="text-twine-700">Secure authentication with your Google account</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-twine-500 to-twine-600 text-white rounded-xl hover:from-twine-600 hover:to-twine-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <LogIn className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="text-sm text-twine-500 mt-6">
          By signing in, you agree to our terms of service and privacy policy
        </p>
      </div>
    </div>
  );
};

export default Auth;


