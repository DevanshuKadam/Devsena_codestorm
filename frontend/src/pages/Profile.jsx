import React, { useState } from "react";
// Corrected import name from SideBar to Navbar for consistency
import Navbar from "../components/Navbar";
import { CakeIcon, BriefcaseIcon, MapPinIcon, DevicePhoneMobileIcon, EnvelopeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

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
    <div className="flex items-start space-x-4 p-4 border-b border-twine-100 last:border-b-0">
      <Icon className="h-6 w-6 text-twine-600 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {isEditing && editable ? (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            className="w-full p-1 border-b border-twine-300 focus:border-twine-500 outline-none text-twine-900 bg-twine-50 rounded-md transition"
          />
        ) : (
          <p className="text-lg font-semibold text-twine-900 leading-tight mt-0.5">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    // Use twine-100 background for consistency
    <div className="min-h-screen flex flex-col bg-twine-100 font-['Inter']">
      <Navbar />
      <div className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
        
        {/* Header and Edit Button */}
        <div className="flex justify-between items-center mb-8 pt-4">
          <h2 className="text-3xl font-extrabold text-twine-900">Employee Profile</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-2 px-4 py-2 font-bold rounded-full transition-colors ${
              isEditing ? "bg-red-500 text-white hover:bg-red-600" : "bg-twine-600 text-white hover:bg-twine-700"
            } shadow-md`}
          >
            <PencilSquareIcon className="h-5 w-5" />
            <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-twine-200 p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Column 1: Profile Summary (Left Side) */}
            <div className="lg:col-span-1 flex flex-col items-center border-b lg:border-r lg:border-b-0 border-twine-200 pb-6 lg:pb-0 lg:pr-6">
              <div className="relative mb-6">
                <img
                  src={profileData.photoUrl}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-twine-400 shadow-xl"
                />
                {isEditing && (
                  <button type="button" className="absolute bottom-0 right-0 p-2 bg-twine-500 rounded-full text-white shadow-md hover:bg-twine-600">
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              <h3 className="text-3xl font-extrabold text-twine-900">{profileData.name}</h3>
              <p className="text-lg text-twine-600 font-semibold mb-4">{profileData.role}</p>
              
              <div className="bg-twine-50 p-3 rounded-lg border border-twine-200">
                <p className="text-xs font-mono text-twine-700">Employee ID</p>
                <p className="text-xl font-bold text-twine-800">{profileData.employeeId}</p>
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
                <div className="pt-6 border-t border-twine-200 flex justify-end">
                  <button
                    type="submit"
                    className="bg-twine-600 text-white px-8 py-3 font-bold rounded-full shadow-lg hover:bg-twine-700 transition transform active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
