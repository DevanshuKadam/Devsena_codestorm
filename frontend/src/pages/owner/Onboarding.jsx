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
  
  // Form validation errors
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const predefinedRoles = ['Cashier', 'Helper', 'Stock Manager', 'Sales Associate', 'Supervisor', 'Cleaner'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Validation functions
  const validateBusinessName = (name) => {
    if (!name.trim()) return 'Business name is required';
    if (name.trim().length < 2) return 'Business name must be at least 2 characters';
    if (name.trim().length > 100) return 'Business name must be less than 100 characters';
    return '';
  };

  const validateContactNumber = (phone) => {
    if (!phone.trim()) return 'Contact number is required';
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return '';
  };

  const validateGoogleAddress = (address) => {
    if (address && !address.startsWith('https://')) {
      return 'Please enter a valid HTTPS URL';
    }
    return '';
  };

  const validateBusinessDescription = (description) => {
    if (description && description.length > 500) {
      return 'Description must be less than 500 characters';
    }
    return '';
  };

  const validateBusinessHours = () => {
    if (!formData.openingTime || !formData.closingTime) {
      return 'Both opening and closing times are required';
    }
    if (formData.openingTime >= formData.closingTime) {
      return 'Closing time must be after opening time';
    }
    return '';
  };

  const validateBusinessDays = () => {
    if (formData.businessDays.length === 0) {
      return 'Please select at least one business day';
    }
    return '';
  };

  const validateRoles = () => {
    if (formData.roles.length === 0) {
      return 'Please add at least one staff role';
    }
    return '';
  };

  const validateCustomRole = (role) => {
    if (!role.trim()) return 'Role name cannot be empty';
    if (role.trim().length < 2) return 'Role name must be at least 2 characters';
    if (role.trim().length > 50) return 'Role name must be less than 50 characters';
    if (formData.roles.includes(role.trim())) return 'This role already exists';
    return '';
  };

  // Update validation errors when form data changes
  useEffect(() => {
    const errors = {};
    
    if (touched.businessName) {
      errors.businessName = validateBusinessName(formData.businessName);
    }
    if (touched.contactNumber) {
      errors.contactNumber = validateContactNumber(formData.contactNumber);
    }
    if (touched.googleAddress) {
      errors.googleAddress = validateGoogleAddress(formData.googleAddress);
    }
    if (touched.businessDescription) {
      errors.businessDescription = validateBusinessDescription(formData.businessDescription);
    }
    if (touched.businessHours) {
      errors.businessHours = validateBusinessHours();
    }
    if (touched.businessDays) {
      errors.businessDays = validateBusinessDays();
    }
    if (touched.roles) {
      errors.roles = validateRoles();
    }

    setValidationErrors(errors);
  }, [formData, touched]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

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
      setTouched(prev => ({ ...prev, roles: true }));
    }
  };

  const removeRole = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter(r => r !== role)
    }));
    setTouched(prev => ({ ...prev, roles: true }));
  };

  const addCustomRole = () => {
    const roleError = validateCustomRole(customRole);
    if (!roleError) {
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
    setTouched(prev => ({ ...prev, businessDays: true }));
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
        }
      } catch (error) {
        console.error('Onboarding: Error during OAuth callback:', error);
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

    // Mark all fields as touched to show validation errors
    setTouched({
      businessName: true,
      contactNumber: true,
      googleAddress: true,
      businessDescription: true,
      businessHours: true,
      businessDays: true,
      roles: true
    });

    // Validate all fields
    const errors = {
      businessName: validateBusinessName(formData.businessName),
      contactNumber: validateContactNumber(formData.contactNumber),
      googleAddress: validateGoogleAddress(formData.googleAddress),
      businessDescription: validateBusinessDescription(formData.businessDescription),
      businessHours: validateBusinessHours(),
      businessDays: validateBusinessDays(),
      roles: validateRoles()
    };

    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      setValidationErrors(errors);
      setIsLoading(false);
      setError('Please fix the validation errors above');
      return;
    }

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 animate-pulse">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent mb-2">Processing Authentication...</h2>
          <p className="text-gray-600">Please wait while we verify your Google account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <Link 
          to="/" 
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent tracking-wide"
        >
          WorkWise AI Onboarding
        </Link>
      </header>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Main Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
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
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData(prev => ({...prev, businessName: e.target.value}))}
                      onBlur={() => handleBlur('businessName')}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
                        validationErrors.businessName 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="Enter your business name"
                    />
                    {validationErrors.businessName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.businessName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData(prev => ({...prev, contactNumber: e.target.value}))}
                        onBlur={() => handleBlur('contactNumber')}
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
                          validationErrors.contactNumber 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    {validationErrors.contactNumber && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.contactNumber}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Maps Address Link
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.googleAddress}
                      onChange={(e) => setFormData(prev => ({...prev, googleAddress: e.target.value}))}
                      onBlur={() => handleBlur('googleAddress')}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
                        validationErrors.googleAddress 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                  {validationErrors.googleAddress && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.googleAddress}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description
                  </label>
                  <textarea
                    value={formData.businessDescription}
                    onChange={(e) => setFormData(prev => ({...prev, businessDescription: e.target.value}))}
                    onBlur={() => handleBlur('businessDescription')}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                      validationErrors.businessDescription 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    rows="4"
                    placeholder="Describe your business, what you sell, and any special services you offer..."
                  />
                  <p className="mt-1 text-sm text-gray-500">{formData.businessDescription.length}/500 characters</p>
                  {validationErrors.businessDescription && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.businessDescription}</p>
                  )}
                </div>
              </div>

              {/* Roles */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Staff Roles *
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
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
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add custom role:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter custom role name"
                    />
                    <button
                      type="button"
                      onClick={addCustomRole}
                      disabled={validateCustomRole(customRole) !== ''}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  {customRole && validateCustomRole(customRole) && (
                    <p className="mt-1 text-sm text-red-600">{validateCustomRole(customRole)}</p>
                  )}
                </div>

                {formData.roles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Selected roles:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.roles.map(role => (
                        <div
                          key={role}
                          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full"
                        >
                          <span className="text-sm font-medium">{role}</span>
                          <button
                            type="button"
                            onClick={() => removeRole(role)}
                            className="w-4 h-4 text-white hover:text-blue-200 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {validationErrors.roles && (
                  <p className="text-sm text-red-600">{validationErrors.roles}</p>
                )}
              </div>

              {/* Business Hours */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Business Hours *
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opening Time *
                    </label>
                    <input
                      type="time"
                      value={formData.openingTime}
                      onChange={(e) => {
                        setFormData(prev => ({...prev, openingTime: e.target.value}));
                        setTouched(prev => ({ ...prev, businessHours: true }));
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
                        validationErrors.businessHours 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Closing Time *
                    </label>
                    <input
                      type="time"
                      value={formData.closingTime}
                      onChange={(e) => {
                        setFormData(prev => ({...prev, closingTime: e.target.value}));
                        setTouched(prev => ({ ...prev, businessHours: true }));
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
                        validationErrors.businessHours 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>
                
                {validationErrors.businessHours && (
                  <p className="text-sm text-red-600">{validationErrors.businessHours}</p>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Business Days *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleBusinessDay(day)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          formData.businessDays.includes(day)
                            ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                  {validationErrors.businessDays && (
                    <p className="mt-2 text-sm text-red-600">{validationErrors.businessDays}</p>
                  )}
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
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500'
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