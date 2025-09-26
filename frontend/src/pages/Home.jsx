import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    // 1. Background updated to blue/indigo gradient
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
      {/* Header (Styling made cleaner, kept white background for contrast) */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-lg">
        {/* Logo Text Gradient Updated */}
        <Link 
          to="/" 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-800 tracking-wide"
        >
          WorkWise AI
        </Link>
        <nav className="flex items-center gap-3">
          {/* Nav Link Colors Updated */}
          <Link to="/admin" className="px-4 py-2 text-blue-700 hover:text-indigo-800 font-medium transition-colors">Owner Portal</Link>
          <Link to="/dashboard" className="px-4 py-2 text-blue-700 hover:text-indigo-800 font-medium transition-colors">Employee Portal</Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20 text-center">
        {/* Header Text Colors Updated */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Streamline Schedules with AI</h1>
        <p className="text-gray-600 text-lg mb-12">For businesses and employees — onboard your store, manage staff, and generate smart schedules.</p>
        
        {/* Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Owner Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-blue-200/50 p-8 transition duration-300 hover:shadow-2xl">
            {/* Icon Color Updated */}
            <Building2 className="w-10 h-10 text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">I’m an Owner</h2>
            <p className="text-gray-600 mb-6">Register your business or log in to manage your team and schedules.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Register Button Gradient Updated */}
              <Link 
                to="/admin/onboarding" 
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-blue-500 transition duration-200 inline-flex items-center justify-center gap-2"
              >
                Register Business <ArrowRight className="w-4 h-4" />
              </Link>
              {/* Portal Button Styling Updated for Soft UI Look */}
              <Link 
                to="/admin" 
                className="px-6 py-3 border border-blue-300 text-blue-700 font-semibold rounded-xl bg-blue-50/50 hover:bg-blue-100 transition duration-200 flex items-center justify-center"
              >
                Owner Portal
              </Link>
            </div>
          </div>
          
          {/* Employee Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-blue-200/50 p-8 transition duration-300 hover:shadow-2xl">
            {/* Icon Color Updated */}
            <Users className="w-10 h-10 text-indigo-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">I’m an Employee</h2>
            <p className="text-gray-600 mb-6">Log in with the credentials sent by your employer after onboarding.</p>
            <div className="flex">
              {/* Login Button Gradient Updated */}
              <Link 
                to="/dashboard" 
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-purple-600 hover:to-indigo-500 transition duration-200 inline-flex items-center justify-center gap-2"
              >
                Employee Login <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;