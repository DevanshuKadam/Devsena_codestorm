import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import OwnerNavbar from '../../components/OwnerNavbar';

const AuthError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const message = searchParams.get('message') || 'Authentication failed';

  const handleRetry = () => {
    navigate('/admin/auth');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100">
      <OwnerNavbar />
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-red-500 shadow-lg">
              <XCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-red-800 mb-4">Authentication Failed</h1>
          <p className="text-red-600 mb-6">{decodeURIComponent(message)}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 mb-8">
          <h3 className="text-lg font-semibold text-red-800 mb-4">What might have gone wrong:</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <span className="text-red-700">You denied permission to access your Google account</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <span className="text-red-700">Network connection issues</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <span className="text-red-700">Session timeout or expired</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <button
            onClick={handleGoBack}
            className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-red-700 border-2 border-red-300 rounded-xl hover:bg-red-50 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back to Home
          </button>
        </div>

        <p className="text-sm text-red-500 mt-6">
          If the problem persists, please contact support
        </p>
      </div>
    </div>
  );
};

export default AuthError;
