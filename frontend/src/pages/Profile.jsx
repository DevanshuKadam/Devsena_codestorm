import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { CakeIcon, BriefcaseIcon, MapPinIcon, DevicePhoneMobileIcon, EnvelopeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import Particles from '../components/ui/magic/Particles';

// --- DUMMY DATA FOR EMPLOYEE PROFILE ---
const initialProfile = {
  photoUrl: "https://placehold.co/150x150/d4a770/ffffff?text=JP", // Placeholder for John Peters
  name: "John K. Peters",
  email: "john.peters@localbrew.com",
  phone: "(555) 123-4567",
  employeeId: "TWINE-0042",
  companyName: "The Local Brew & Co.",
  role: "Lead Barista / Cashier",
  age: 28,
  joinDate: "August 15, 2023",
  address: "123 Main St, Anytown, USA",
};

// Magic UI Shimmer Card Component
const ShimmerCard = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden bg-white rounded-2xl border border-gray-200/50 shadow-sm ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    {children}
  </div>
);

// --- PROFILE COMPONENT ---
export default function Profile() {
  const [profileData, setProfileData] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  // Helper function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send profileData to a backend service here
    console.log("Saving Profile Data:", profileData);
    setIsEditing(false);
  };

  // Helper function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Field display component
  const ProfileField = ({ icon: Icon, label, value, name, type = "text", editable = true }) => (
    <div className="flex items-start space-x-4 p-4 border-b border-gray-100 last:border-b-0">
      <Icon className="h-6 w-6 text-blue-600 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {isEditing && editable ? (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            className="w-full p-1 border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900 bg-blue-50 rounded-md transition"
          />
        ) : (
          <p className="text-lg font-semibold text-gray-900 leading-tight mt-0.5">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <Navbar />
      {/* Particles Background */}
      <Particles count={50} />
      
      <div className="relative z-10 pt-24 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Card with Glassmorphism */}
          <ShimmerCard className="mb-8 backdrop-blur-xl bg-white/70">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-700 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent">
                      Employee Profile
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your personal information</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`group relative px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 ${
                    isEditing 
                      ? "bg-red-500 text-white hover:bg-red-600" 
                      : "bg-gradient-to-r from-blue-500 to-indigo-700 text-white"
                  }`}
                >
                  <PencilSquareIcon className="h-5 w-5" />
                  <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
                </button>
              </div>
            </div>
          </ShimmerCard>

          {/* Main Content Card */}
          <ShimmerCard className="backdrop-blur-sm bg-white/80">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Column 1: Profile Summary (Left Side) */}
                <div className="lg:col-span-1 flex flex-col items-center border-b lg:border-r lg:border-b-0 border-gray-200 pb-6 lg:pb-0 lg:pr-6">
                  <div className="relative mb-6">
                    <img
                      src={profileData.photoUrl}
                      alt="Profile"
                      className="w-40 h-40 rounded-full object-cover border-4 border-blue-400 shadow-xl"
                    />
                    {isEditing && (
                      <button type="button" className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full text-white shadow-md hover:bg-blue-600">
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  <h3 className="text-3xl font-extrabold text-gray-900">{profileData.name}</h3>
                  <p className="text-lg text-blue-600 font-semibold mb-4">{profileData.role}</p>
                  
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs font-mono text-blue-700">Employee ID</p>
                    <p className="text-xl font-bold text-blue-800">{profileData.employeeId}</p>
                  </div>
                </div>

                {/* Column 2 & 3: Details and Contact Form Fields (Right Side) */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    
                    {/* Fixed Company/Role Details (Read-Only) */}
                    <ProfileField icon={BriefcaseIcon} label="Company" value={profileData.companyName} name="companyName" editable={false} />
                    <ProfileField icon={BriefcaseIcon} label="Primary Role" value={profileData.role} name="role" editable={false} />
                    <ProfileField icon={CakeIcon} label="Age" value={`${profileData.age} years old`} name="age" editable={false} />
                    <ProfileField icon={CakeIcon} label="Joined Date" value={profileData.joinDate} name="joinDate" editable={false} />

                    {/* Editable Contact Information */}
                    <ProfileField icon={EnvelopeIcon} label="Email Address" value={profileData.email} name="email" type="email" />
                    <ProfileField icon={DevicePhoneMobileIcon} label="Phone Number" value={profileData.phone} name="phone" />
                    <div className="sm:col-span-2">
                        <ProfileField icon={MapPinIcon} label="Address" value={profileData.address} name="address" />
                    </div>
                  </div>

                  {/* Save Button (only visible in editing mode) */}
                  {isEditing && (
                    <div className="pt-6 border-t border-gray-200 flex justify-end">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </ShimmerCard>
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
}
