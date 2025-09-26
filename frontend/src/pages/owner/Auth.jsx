import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import OwnerNavbar from '../../components/OwnerNavbar';

const Auth = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    // Mock Google sign-in
    localStorage.setItem('authToken', 'mock-google-token');
    // Decide where to go: onboarding or schedule
    const isOnboarded = localStorage.getItem('ownerOnboarded') === 'true';
    navigate(isOnboarded ? '/admin/schedule-dashboard' : '/admin/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-twine-50 to-twine-100">
      <OwnerNavbar />
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-twine-800 mb-4">Sign in to WorkFlow AI</h1>
        <p className="text-twine-600 mb-10">Use your Google account to continue to your owner portal</p>
        <button
          onClick={handleGoogleSignIn}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-twine-500 to-twine-600 text-white rounded-xl hover:from-twine-600 hover:to-twine-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <LogIn className="w-5 h-5" />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Auth;


