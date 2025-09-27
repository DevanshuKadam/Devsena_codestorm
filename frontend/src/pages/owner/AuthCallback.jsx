import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import OwnerNavbar from '../../components/OwnerNavbar';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = () => {
      try {
        const encodedData = searchParams.get('data');
        
        if (!encodedData) {
          setStatus('error');
          setMessage('No authentication data received');
          return;
        }

        // Decode the base64 data
        const decodedData = atob(encodedData);
        const authData = JSON.parse(decodedData);

        if (authData.success) {
          // Store user data
          localStorage.removeItem('employeeData');
          localStorage.setItem('ownerData', JSON.stringify({
            googleId: authData.googleId,
            email: authData.email,
            name: authData.name,
            picture: authData.picture
          }));


          setStatus('success');
          setMessage('Authentication successful!');

          // Navigate based on registration status
          setTimeout(() => {
            if (authData.isRegistered) {
              navigate('/admin/schedule-dashboard');
            } else {
              navigate('/admin/onboarding');
            }
          }, 2000);
        } else {
          setStatus('error');
          setMessage(authData.message || 'Authentication failed');
        }
      } catch (error) {
        console.error('Error processing auth callback:', error);
        setStatus('error');
        setMessage('Failed to process authentication data');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-600" />;
      default:
        return <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'from-blue-50 to-blue-100';
      case 'success':
        return 'from-green-50 to-green-100';
      case 'error':
        return 'from-red-50 to-red-100';
      default:
        return 'from-blue-50 to-blue-100';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'loading':
        return 'Processing authentication...';
      case 'success':
        return 'Authentication successful!';
      case 'error':
        return 'Authentication failed';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getStatusColor()} relative overflow-hidden`}>
      <OwnerNavbar />
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-white shadow-lg">
              {getStatusIcon()}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {getStatusText()}
          </h1>
          {message && (
            <p className="text-gray-600 mb-6">{message}</p>
          )}
        </div>

        {status === 'loading' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <p className="text-gray-700">
              Please wait while we complete your authentication...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-8 mb-8">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Welcome to WorkFlow AI!</h3>
            <p className="text-green-700">
              Your Google account has been successfully connected. You'll be redirected to your dashboard shortly.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 mb-8">
            <h3 className="text-lg font-semibold text-red-800 mb-4">Authentication Failed</h3>
            <p className="text-red-700 mb-4">
              {message}
            </p>
            <button
              onClick={() => navigate('/admin/auth')}
              className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {status === 'loading' && (
          <div className="text-gray-600">
            <p className="text-lg font-medium">Redirecting you to your dashboard...</p>
            <div className="mt-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
