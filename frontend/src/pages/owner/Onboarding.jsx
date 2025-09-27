import React, { useState, useEffect } from 'react';
import { Upload, Plus, X, Clock, MapPin, Phone, Building2, Users, Calendar } from 'lucide-react';
import OwnerNavbar from '../../components/OwnerNavbar';
import { useNavigate, Link } from 'react-router-dom';

const Onboarding = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    googleAddress: '',
    contactNumber: '',
    businessImages: [],
    roles: [],
    businessDescription: '',
    openingTime: '09:00',
    closingTime: '18:00',
    businessDays: []
  });

  const [customRole, setCustomRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authData, setAuthData] = useState(null);
  const [error, setError] = useState('');
  
  const predefinedRoles = ['Cashier', 'Helper', 'Stock Manager', 'Sales Associate', 'Supervisor', 'Cleaner'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      businessImages: [...prev.businessImages, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      businessImages: prev.businessImages.filter((_, i) => i !== index)
    }));
  };

  const addRole = (role) => {
    if (!formData.roles.includes(role)) {
      setFormData(prev => ({
        ...prev,
        roles: [...prev.roles, role]
      }));
    }
  };

  const removeRole = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter(r => r !== role)
    }));
  };

  const addCustomRole = () => {
    if (customRole.trim() && !formData.roles.includes(customRole.trim())) {
      addRole(customRole.trim());
      setCustomRole('');
    }
  };

  const toggleBusinessDay = (day) => {
    setFormData(prev => ({
      ...prev,
      businessDays: prev.businessDays.includes(day) 
        ? prev.businessDays.filter(d => d !== day)
        : [...prev.businessDays, day]
    }));
  };

  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log('Onboarding: Checking authentication...');
        
        // First check if user is already registered
        const storedData = localStorage.getItem('ownerData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.success && parsedData.isRegistered) {
            console.log('Onboarding: User already registered, redirecting to dashboard');
            navigate('/admin/schedule-dashboard', { replace: true });
            return;
          } else if (parsedData.success && !parsedData.isRegistered) {
            console.log('Onboarding: User authenticated but not registered, showing form');
            setAuthData(parsedData);
            return;
          }
        }
  
        // Get OAuth code from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
  
        if (!code) {
          console.log('Onboarding: No OAuth code found and no stored data');
          navigate('/admin', { replace: true });
          return;
        }
  
        console.log('Onboarding: Found OAuth code, calling callback API...');
        setIsAuthLoading(true);
  
        const response = await fetch(`http://localhost:3000/auth/google/callback?code=${code}`);
        const data = await response.json();
  
        console.log('Onboarding: OAuth callback response:', data);
  
        if (data.success) {
          // Save response to localStorage
          localStorage.setItem('ownerData', JSON.stringify(data));
          setAuthData(data);
  
          // If already registered, redirect to dashboard
          if (data.isRegistered) {
            navigate('/admin/schedule-dashboard', { replace: true });
          }
  
          // Remove code from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          console.error('Onboarding: Authentication failed:', data.message);
          setError('Authentication failed. Please try again.');
        }
      } catch (error) {
        console.error('Onboarding: Error during OAuth callback:', error);
        setError('Authentication failed. Please try again.');
      } finally {
        setIsAuthLoading(false);
      }
    };
  
    handleAuth();
  }, [navigate]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!authData) {
        throw new Error('Authentication required');
      }

      // Prepare business hours data
      const businessHours = formData.businessDays.map(day => ({
        weekday: daysOfWeek.indexOf(day),
        start: formData.openingTime,
        end: formData.closingTime,
        isOpen: true
      }));

      // Register the business
      const response = await fetch('http://localhost:3000/owner/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: authData.googleId,
          shopName: formData.businessName,
          businessHours: businessHours,
          ownerPhone: formData.contactNumber,
          mapsUrl: formData.googleAddress,
          roles: formData.roles
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update auth data to mark as registered
        const updatedAuthData = { ...authData, isRegistered: true };
        localStorage.setItem('ownerData', JSON.stringify(updatedAuthData));
        setAuthData(updatedAuthData);
        
        // Registration successful, redirect to dashboard
        navigate('/admin/schedule-dashboard', { replace: true });
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      setError(error.message || 'Failed to register business. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while processing OAuth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-twine-50 to-twine-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-twine-500 rounded-full mb-4 animate-pulse">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-twine-800 mb-2">Processing Authentication...</h2>
          <p className="text-twine-600">Please wait while we verify your Google account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-twine-50 to-twine-100">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-lg">
        {/* Logo Text Gradient Updated */}
        <Link 
          to="/" 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-800 tracking-wide"
        >
          WorkWise AI Onboarding
        </Link>
      </header>
      <div className="p-4">
      <div className="max-w-4xl mx-auto">


        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-twine-200 overflow-hidden">
          <div className="bg-gradient-to-r from-twine-500 to-twine-600 p-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
              <Building2 className="w-6 h-6" />
              Business Setup
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-twine-800 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-twine-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({...prev, businessName: e.target.value}))}
                    className="w-full px-4 py-3 border border-twine-300 rounded-xl focus:ring-2 focus:ring-twine-500 focus:border-twine-500 transition-colors"
                    placeholder="Enter your business name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-twine-700 mb-2">
                    Contact Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-twine-400" />
                    <input
                      type="tel"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData(prev => ({...prev, contactNumber: e.target.value}))}
                      className="w-full pl-12 pr-4 py-3 border border-twine-300 rounded-xl focus:ring-2 focus:ring-twine-500 focus:border-twine-500 transition-colors"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-twine-700 mb-2">
                  Google Maps Address Link
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-twine-400" />
                  <input
                    type="url"
                    value={formData.googleAddress}
                    onChange={(e) => setFormData(prev => ({...prev, googleAddress: e.target.value}))}
                    className="w-full pl-12 pr-4 py-3 border border-twine-300 rounded-xl focus:ring-2 focus:ring-twine-500 focus:border-twine-500 transition-colors"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-twine-700 mb-2">
                  Business Description
                </label>
                <textarea
                  value={formData.businessDescription}
                  onChange={(e) => setFormData(prev => ({...prev, businessDescription: e.target.value}))}
                  className="w-full px-4 py-3 border border-twine-300 rounded-xl focus:ring-2 focus:ring-twine-500 focus:border-twine-500 transition-colors resize-none"
                  rows="4"
                  placeholder="Describe your business, what you sell, and any special services you offer..."
                />
              </div>
            </div>

            {/* Roles */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-twine-800 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Staff Roles
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-twine-700 mb-3">
                  Select from predefined roles:
                </label>
                <div className="flex flex-wrap gap-2">
                  {predefinedRoles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => addRole(role)}
                      disabled={formData.roles.includes(role)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.roles.includes(role)
                          ? 'bg-twine-500 text-white'
                          : 'bg-twine-100 text-twine-700 hover:bg-twine-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-twine-700 mb-2">
                  Add custom role:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="flex-1 px-4 py-3 border border-twine-300 rounded-xl focus:ring-2 focus:ring-twine-500 focus:border-twine-500 transition-colors"
                    placeholder="Enter custom role name"
                  />
                  <button
                    type="button"
                    onClick={addCustomRole}
                    className="px-6 py-3 bg-twine-500 text-white rounded-xl hover:bg-twine-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {formData.roles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-twine-700 mb-3">
                    Selected roles:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.roles.map(role => (
                      <div
                        key={role}
                        className="flex items-center gap-2 px-3 py-2 bg-twine-500 text-white rounded-full"
                      >
                        <span className="text-sm font-medium">{role}</span>
                        <button
                          type="button"
                          onClick={() => removeRole(role)}
                          className="w-4 h-4 text-white hover:text-twine-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Business Hours */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-twine-800 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Business Hours
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-twine-700 mb-2">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={formData.openingTime}
                    onChange={(e) => setFormData(prev => ({...prev, openingTime: e.target.value}))}
                    className="w-full px-4 py-3 border border-twine-300 rounded-xl focus:ring-2 focus:ring-twine-500 focus:border-twine-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-twine-700 mb-2">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={formData.closingTime}
                    onChange={(e) => setFormData(prev => ({...prev, closingTime: e.target.value}))}
                    className="w-full px-4 py-3 border border-twine-300 rounded-xl focus:ring-2 focus:ring-twine-500 focus:border-twine-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-twine-700 mb-3">
                  Business Days
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleBusinessDay(day)}
                      className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                        formData.businessDays.includes(day)
                          ? 'bg-twine-500 text-white'
                          : 'bg-twine-100 text-twine-700 hover:bg-twine-200'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-8 py-4 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-twine-500 to-twine-600 hover:from-twine-600 hover:to-twine-700'
                }`}
              >
                {isLoading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Onboarding;