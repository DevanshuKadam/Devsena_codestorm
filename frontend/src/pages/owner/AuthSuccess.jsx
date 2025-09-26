import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, Users } from 'lucide-react';
import OwnerNavbar from '../../components/OwnerNavbar';

const AuthSuccess = () => {
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

      // Check if owner is already registered and redirect accordingly
      checkOwnerRegistration(googleId);
    } else {
      // No valid callback data, redirect to auth
      navigate('/admin/auth');
    }
  }, [searchParams, navigate]);

  const checkOwnerRegistration = async (googleId) => {
    try {
      const response = await fetch(`http://localhost:3000/owner/${googleId}`);
      const data = await response.json();

      if (data.success && data.owner.isRegistered) {
        // Owner is registered, go to dashboard
        setTimeout(() => {
          navigate('/admin/schedule-dashboard');
        }, 2000);
      } else {
        // Owner needs to complete registration
        setTimeout(() => {
          navigate('/admin/onboarding');
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking owner registration:', error);
      setTimeout(() => {
        navigate('/admin/onboarding');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <OwnerNavbar />
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-green-500 shadow-lg animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-green-800 mb-4">Authentication Successful!</h1>
          <p className="text-green-600 mb-6">Your Google account has been connected successfully</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-8 mb-8">
          <h3 className="text-lg font-semibold text-green-800 mb-4">You now have access to:</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-green-600" />
              <span className="text-green-700">Google Calendar integration</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-green-700">AI-powered scheduling</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700">Secure workforce management</span>
            </div>
          </div>
        </div>

        <div className="text-green-600">
          <p className="text-lg font-medium">Redirecting you to your dashboard...</p>
          <div className="mt-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;
