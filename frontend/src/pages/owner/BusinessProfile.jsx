import React, { useState } from 'react';
import { Building2, MapPin, Phone, Clock, Users, Upload, Edit3, Save, X, Plus, Camera, Mail, Calendar, Star, TrendingUp, Award } from 'lucide-react';
import OwnerNavbar from '../../components/OwnerNavbar';
import Particles from '../../components/ui/magic/Particles';

const BusinessProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    businessName: 'Sunrise Cafe & Bakery',
    googleAddress: 'https://maps.google.com/cafe-sunrise-main-st',
    contactNumber: '+1 (555) 123-4567',
    email: 'info@sunrisecafe.com',
    businessImages: [
      '/api/placeholder/300/200',
      '/api/placeholder/300/200',
      '/api/placeholder/300/200',
    ],
    roles: ['Cashier', 'Barista', 'Baker', 'Kitchen Helper', 'Manager'],
    businessDescription: 'A cozy neighborhood cafe and bakery serving fresh coffee, artisan pastries, and light meals. We pride ourselves on creating a warm, welcoming atmosphere for our community.',
    openingTime: '06:30',
    closingTime: '19:00',
    businessDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    foundedYear: '2019',
    totalEmployees: 8,
    avgCustomersPerDay: 150
  });

  const [editData, setEditData] = useState(profileData);
  const [newRole, setNewRole] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
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

  // Magic UI Animated Counter Component
  const AnimatedCounter = ({ value, label, icon: Icon, gradient = "from-blue-500 to-purple-500" }) => (
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
    <div className={`relative overflow-hidden bg-white rounded-2xl border border-gray-200/50 shadow-sm ${className}`}>
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

  // Magic UI Meteors Background
  const Meteors = ({ number = 20 }) => {
    const meteors = Array.from({ length: number }, (_, i) => (
      <span
        key={i}
        className="absolute animate-meteor-effect h-0.5 w-0.5 rounded-full bg-slate-500 shadow-[0_0_0_1px_#ffffff10]"
        style={{
          top: Math.random() * 100 + '%',
          left: Math.random() * 100 + '%',
          animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + 's',
          animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + 's',
        }}
      />
    ));
    return <>{meteors}</>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-twine-50 via-twine-100 to-white relative overflow-hidden">
      <OwnerNavbar />
      {/* Particles Background */}
      <Particles count={70} />
      
      {/* Header Section */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Card with Glassmorphism */}
          <ShimmerCard className="mb-8 backdrop-blur-xl bg-white/70">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-twine-500 to-twine-700 shadow-lg">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-twine-800 to-twine-600 bg-clip-text text-transparent">
                      {profileData.businessName}
                    </h1>
                    <p className="text-gray-600 mt-1">Premium Business Profile</p>
                  </div>
                </div>
                
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-twine-500 to-twine-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5" />
                      Edit Profile
                    </div>
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 rounded-xl bg-white/80 text-gray-700 border border-gray-200 hover:bg-white transition-colors flex items-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-twine-600 to-twine-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
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
            {/* Left Content - full width */}
            <div className="xl:col-span-3 space-y-8">
              
              {/* Basic Information & Business Hours - Bento Grid */}
              <BentoGrid>
                {/* Basic Info */}
                <div className="md:col-span-2">
                  <ShimmerCard className="h-full backdrop-blur-sm bg-white/80">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-twine-500 to-twine-700">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.businessName}
                              onChange={(e) => setEditData({...editData, businessName: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-50/80 rounded-xl text-gray-800">{profileData.businessName}</div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                            {isEditing ? (
                              <input
                                type="tel"
                                value={editData.contactNumber}
                                onChange={(e) => setEditData({...editData, contactNumber: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                              />
                            ) : (
                              <div className="px-4 py-3 bg-gray-50/80 rounded-xl text-gray-800 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-twine-600" />
                                {profileData.contactNumber}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            {isEditing ? (
                              <input
                                type="email"
                                value={editData.email}
                                onChange={(e) => setEditData({...editData, email: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                              />
                            ) : (
                              <div className="px-4 py-3 bg-gray-50/80 rounded-xl text-gray-800 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-twine-600" />
                                {profileData.email}
                              </div>
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
                        <div className="p-2 rounded-lg bg-gradient-to-r from-twine-500 to-twine-700">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Hours</h2>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Opening</label>
                          {isEditing ? (
                            <input
                              type="time"
                              value={editData.openingTime}
                              onChange={(e) => setEditData({...editData, openingTime: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-twine-50/80 rounded-xl text-twine-800 font-mono text-lg font-semibold">{profileData.openingTime}</div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Closing</label>
                          {isEditing ? (
                            <input
                              type="time"
                              value={editData.closingTime}
                              onChange={(e) => setEditData({...editData, closingTime: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-twine-50/80 rounded-xl text-twine-800 font-mono text-lg font-semibold">{profileData.closingTime}</div>
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
                      <div className="p-2 rounded-lg bg-gradient-to-r from-twine-500 to-twine-700">
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
                      <div className="p-2 rounded-lg bg-gradient-to-r from-twine-500 to-twine-700">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Operating Days</h2>
                    </div>
                    
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        {daysOfWeek.map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleBusinessDay(day)}
                            className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                              editData.businessDays.includes(day)
                                ? 'bg-gradient-to-r from-twine-500 to-twine-700 text-white shadow-lg'
                                : 'bg-twine-100 text-twine-700 hover:bg-twine-200'
                            }`}
                          >
                            {day.substring(0, 3)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {profileData.businessDays.map(day => (
                          <div key={day} className="px-4 py-2 bg-gradient-to-r from-twine-500 to-twine-700 text-white rounded-xl text-sm font-medium text-center shadow-sm">
                            {day.substring(0, 3)}
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
                      <div className="p-2 rounded-lg bg-gradient-to-r from-twine-500 to-twine-700">
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
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                            placeholder="Add new role..."
                          />
                          <button
                            onClick={addRole}
                            className="px-6 py-3 bg-gradient-to-r from-twine-500 to-twine-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {editData.roles.map(role => (
                            <div key={role} className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-twine-500 to-twine-700 text-white rounded-full shadow-sm">
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
                          <span key={role} className="px-4 py-2 bg-twine-100 text-twine-700 rounded-full text-sm font-medium shadow-sm">
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
                      <div className="p-2 rounded-lg bg-gradient-to-r from-twine-500 to-twine-700">
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

            {/* Right Sidebar removed per request */}
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