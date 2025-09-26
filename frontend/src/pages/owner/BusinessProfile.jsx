import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Clock, Users, Upload, Edit3, Save, X, Plus, Camera, Mail, Calendar, TrendingUp, Award } from 'lucide-react';
import OwnerNavbar from '../../components/OwnerNavbar';
import Particles from '../../components/ui/magic/Particles';

const BusinessProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [authData, setAuthData] = useState(null);
  const [profileData, setProfileData] = useState({
    businessName: '',
    googleAddress: '',
    contactNumber: '',
    email: '',
    businessImages: [],
    roles: [],
    businessDescription: '',
    openingTime: '09:00',
    closingTime: '18:00',
    businessDays: [],
    foundedYear: '',
    totalEmployees: 0,
    avgCustomersPerDay: 0
  });

  const [editData, setEditData] = useState(profileData);
  const [newRole, setNewRole] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch owner and shop data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Get auth data from localStorage
        const storedAuthData = localStorage.getItem('ownerData');
        if (!storedAuthData) {
          throw new Error('No authentication data found');
        }

        const auth = JSON.parse(storedAuthData);
        setAuthData(auth);

        if (!auth.googleId) {
          throw new Error('No Google ID found in auth data');
        }

        console.log('BusinessProfile: Fetching business profile data for Google ID:', auth.googleId);

        // Fetch complete business profile data (owner + shop)
        const response = await fetch(`http://localhost:3000/owner/${auth.googleId}/business-profile`);
        
        if (!response.ok) {
          console.error('BusinessProfile: API response not ok:', response.status, response.statusText);
          throw new Error(`Failed to fetch business profile: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('BusinessProfile: Business profile data received:', result);

        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch business profile data');
        }

        const { businessProfile } = result;
        const ownerData = businessProfile.owner;
        const shopData = businessProfile.shop;
        
        if (!businessProfile.hasShop) {
          console.warn('BusinessProfile: No shop data found, using owner data only');
        }

        // Convert business hours to business days
        const businessDays = shopData.businessHours ? 
          shopData.businessHours
            .filter(hour => hour.isOpen)
            .map(hour => daysOfWeek[hour.weekday]) : [];

        // Set profile data
        const combinedData = {
          businessName: shopData.shopName || ownerData.name || 'Your Business',
          googleAddress: shopData.mapsUrl || ownerData.mapsUrl || '',
          contactNumber: ownerData.phone || '',
          email: ownerData.email || '',
          businessImages: [], // TODO: Implement image storage
          roles: shopData.roles || [],
          businessDescription: shopData.businessDescription || 'Complete your business profile to add a description.',
          openingTime: shopData.businessHours && shopData.businessHours.length > 0 ? 
            shopData.businessHours[0].start : '09:00',
          closingTime: shopData.businessHours && shopData.businessHours.length > 0 ? 
            shopData.businessHours[0].end : '18:00',
          businessDays: businessDays,
          foundedYear: shopData.foundedYear || '',
          totalEmployees: shopData.totalEmployees || 0,
          avgCustomersPerDay: shopData.avgCustomersPerDay || 0
        };

        setProfileData(combinedData);
        setEditData(combinedData);

      } catch (error) {
        console.error('BusinessProfile: Error fetching data:', error);
        setError(error.message || 'Failed to load business profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      if (!authData?.googleId) {
        throw new Error('No authentication data available');
      }

      // Prepare business hours data
      const businessHours = editData.businessDays.map(day => ({
        weekday: daysOfWeek.indexOf(day),
        start: editData.openingTime,
        end: editData.closingTime,
        isOpen: true
      }));

      // Update business hours via API
      console.log('BusinessProfile: Fetching shop data for update, ownerId:', authData.googleId);
      const shopResponse = await fetch(`http://localhost:3000/owner/${authData.googleId}/shop`);
      
      if (!shopResponse.ok) {
        throw new Error(`Failed to fetch shop data: ${shopResponse.status} ${shopResponse.statusText}`);
      }
      
      const shopResult = await shopResponse.json();
      
      if (shopResult.success) {
        const shopId = shopResult.shop.id;
        
        // Update business hours
        const hoursResponse = await fetch(`http://localhost:3000/shop/${shopId}/business-hours`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ businessHours })
        });

        if (!hoursResponse.ok) {
          throw new Error('Failed to update business hours');
        }
      }

      // Update profile data
      setProfileData(editData);
      setIsEditing(false);
      
      console.log('BusinessProfile: Changes saved successfully');
    } catch (error) {
      console.error('BusinessProfile: Error saving changes:', error);
      setError(error.message || 'Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const addRole = () => {
    if (newRole.trim() && !editData.roles.includes(newRole.trim())) {
      setEditData({
        ...editData,
        roles: [...editData.roles, newRole.trim()]
      });
      setNewRole('');
    }
  };

  const removeRole = (role) => {
    setEditData({
      ...editData,
      roles: editData.roles.filter(r => r !== role)
    });
  };

  const toggleBusinessDay = (day) => {
    setEditData({
      ...editData,
      businessDays: editData.businessDays.includes(day)
        ? editData.businessDays.filter(d => d !== day)
        : [...editData.businessDays, day]
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImageUrls = files.map(() => '/api/placeholder/300/200');
    setEditData({
      ...editData,
      businessImages: [...editData.businessImages, ...newImageUrls]
    });
  };

  const removeImage = (index) => {
    setEditData({
      ...editData,
      businessImages: editData.businessImages.filter((_, i) => i !== index)
    });
  };

  // Magic UI Animated Counter Component (Updated Gradients)
  const AnimatedCounter = ({ value, label, icon: Icon, gradient = "from-blue-500 to-indigo-700" }) => (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </div>
  );

  // Magic UI Shimmer Card Component
  const ShimmerCard = ({ children, className = "" }) => (
    <div className={`relative overflow-hidden bg-white rounded-2xl border border-blue-200/50 shadow-sm ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      {children}
    </div>
  );

  // Magic UI Bento Grid Component
  const BentoGrid = ({ children, className = "" }) => (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {children}
    </div>
  );
  
  // Meteors component retained but Tailwind styles are used below
  const Meteors = () => null; 

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-4 animate-pulse">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-blue-800 mb-2">Loading Business Profile...</h2>
          <p className="text-blue-600">Please wait while we fetch your business information.</p>
        </div>
      </div>
    );
  }

  // Show error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-red-800 mb-2">Error Loading Profile</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    // Background updated to blue/indigo gradient
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <OwnerNavbar />
      <Particles count={70} />
      
      {/* Header Section */}
      <div className="relative z-10 pt-24 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Card with Glassmorphism */}
          <ShimmerCard className="mb-8 backdrop-blur-xl bg-white/70">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  {/* Icon Gradient Updated */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-700 shadow-lg">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    {/* Header Text Gradient Updated */}
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent">
                      {profileData.businessName}
                    </h1>
                    <p className="text-gray-600 mt-1">Premium Business Profile</p>
                  </div>
                </div>
                
                {!isEditing ? (
                  // Edit Button Gradient Updated
                  <button
                    onClick={() => setIsEditing(true)}
                    className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5" />
                      Edit Profile
                    </div>
                  </button>
                ) : (
                  <div className="flex gap-3">
                    {/* Cancel Button Updated */}
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 rounded-xl bg-white/80 text-gray-700 border border-blue-200 hover:bg-white transition-colors flex items-center gap-2 shadow-md"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                    {/* Save Button Gradient Updated */}
                    <button
                      onClick={handleSave}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </ShimmerCard>

          {/* Main Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-3 space-y-8">
              
              {/* Basic Information & Business Hours - Bento Grid */}
              <BentoGrid>
                {/* Basic Info */}
                <div className="md:col-span-2">
                  <ShimmerCard className="h-full backdrop-blur-sm bg-white/80">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        {/* Icon Gradient Updated */}
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-700">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                          {!isEditing ? (
                            // Read-only background updated
                            <div className="px-4 py-3 bg-blue-50/80 rounded-xl text-gray-800">{profileData.businessName}</div>
                          ) : (
                             // Input focus ring already blue
                            <input
                              type="text"
                              value={editData.businessName}
                              onChange={(e) => setEditData({...editData, businessName: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                            />
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                            {!isEditing ? (
                              // Icon color updated
                              <div className="px-4 py-3 bg-blue-50/80 rounded-xl text-gray-800 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-blue-600" />
                                {profileData.contactNumber}
                              </div>
                            ) : (
                               <input
                                type="tel"
                                value={editData.contactNumber}
                                onChange={(e) => setEditData({...editData, contactNumber: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                              />
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            {!isEditing ? (
                              // Icon color updated
                              <div className="px-4 py-3 bg-blue-50/80 rounded-xl text-gray-800 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-600" />
                                {profileData.email}
                              </div>
                            ) : (
                               <input
                                type="email"
                                value={editData.email}
                                onChange={(e) => setEditData({...editData, email: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ShimmerCard>
                </div>

                {/* Business Hours */}
                <div>
                  <ShimmerCard className="h-full backdrop-blur-sm bg-white/80">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        {/* Icon Gradient Updated */}
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-700">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Hours</h2>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Opening</label>
                          {!isEditing ? (
                            // Read-only background/text updated
                            <div className="px-4 py-3 bg-blue-50/80 rounded-xl text-blue-800 font-mono text-lg font-semibold">{profileData.openingTime}</div>
                          ) : (
                            <input
                              type="time"
                              value={editData.openingTime}
                              onChange={(e) => setEditData({...editData, openingTime: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                            />
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Closing</label>
                          {!isEditing ? (
                            // Read-only background/text updated
                            <div className="px-4 py-3 bg-blue-50/80 rounded-xl text-blue-800 font-mono text-lg font-semibold">{profileData.closingTime}</div>
                          ) : (
                             <input
                              type="time"
                              value={editData.closingTime}
                              onChange={(e) => setEditData({...editData, closingTime: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </ShimmerCard>
                </div>
              </BentoGrid>

              {/* Description & Operating Days */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ShimmerCard className="backdrop-blur-sm bg-white/80">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      {/* Icon Gradient Updated */}
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-700">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Description</h2>
                    </div>
                    
                    {isEditing ? (
                      <textarea
                        value={editData.businessDescription}
                        onChange={(e) => setEditData({...editData, businessDescription: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white/50"
                        rows="6"
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{profileData.businessDescription}</p>
                    )}
                  </div>
                </ShimmerCard>

                <ShimmerCard className="backdrop-blur-sm bg-white/80">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      {/* Icon Gradient Updated */}
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-700">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Operating Days</h2>
                    </div>
                    
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        {daysOfWeek.map(day => (
                          // Edit Button Styling Updated
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleBusinessDay(day)}
                            className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                              editData.businessDays.includes(day)
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-700 text-white shadow-lg'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200' // Base color updated
                            }`}
                          >
                            {day.substring(0, 3)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profileData.businessDays.map(day => (
                          // Read-only Styling Updated
                          <div key={day} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-700 text-white rounded-xl text-sm font-medium text-center shadow-sm">
                            {day}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ShimmerCard>
              </div>

              {/* Staff Roles & Images */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ShimmerCard className="backdrop-blur-sm bg-white/80">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      {/* Icon Gradient Updated */}
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-700">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Staff Roles</h2>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            // Input focus ring already blue
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                            placeholder="Add new role..."
                          />
                          {/* Add Role Button Gradient Updated */}
                          <button
                            onClick={addRole}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {editData.roles.map(role => (
                            // Edit Tag Styling Updated
                            <div key={role} className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-700 text-white rounded-full shadow-sm">
                              <span className="text-sm font-medium">{role}</span>
                              <button
                                onClick={() => removeRole(role)}
                                className="w-4 h-4 text-white/80 hover:text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profileData.roles.map(role => (
                          // Read-only Tag Styling Updated
                          <span key={role} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium shadow-sm">
                            {role}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </ShimmerCard>

                <ShimmerCard className="backdrop-blur-sm bg-white/80">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      {/* Icon Gradient Updated */}
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-700">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Gallery</h2>
                    </div>

                    {isEditing && (
                      <div className="mb-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-gray-50/50">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="imageUpload"
                          />
                          <label htmlFor="imageUpload" className="cursor-pointer">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Upload Images</p>
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      {(isEditing ? editData.businessImages : profileData.businessImages).slice(0, 4).map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Business ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl border border-gray-200 shadow-sm"
                          />
                          {isEditing && (
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </ShimmerCard>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default BusinessProfile;