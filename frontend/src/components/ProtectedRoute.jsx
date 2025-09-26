import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if we have stored auth data
        const ownerData = localStorage.getItem('ownerData');
        if (!ownerData) {
          console.log('ProtectedRoute: No owner data found, redirecting to admin');
          navigate('/admin', { replace: true });
          return;
        }

        // Parse the stored data
        const authData = JSON.parse(ownerData);
        console.log('ProtectedRoute: Checking auth data:', authData);

        // Check if user is registered (completed onboarding)
        if (authData.success && authData.isRegistered) {
          console.log('ProtectedRoute: User is authenticated and registered');
          setIsAuthenticated(true);
        } else {
          console.log('ProtectedRoute: User not registered, redirecting to onboarding');
          // If user is authenticated but not registered, redirect to onboarding
          if (authData.success && !authData.isRegistered) {
            navigate('/admin/onboarding', { replace: true });
          } else {
            // If no valid auth data, redirect to admin landing
            navigate('/admin', { replace: true });
          }
        }
      } catch (error) {
        console.error('ProtectedRoute: Auth check failed:', error);
        localStorage.removeItem('ownerData');
        navigate('/admin', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return children;
};

export default ProtectedRoute;
