import React, { useState, useEffect } from "react";
import { Building2, Users, ArrowRight, Mic, Globe, Cpu, Video, Calendar } from "lucide-react";

// Hero component embedded within Home
const Hero = () => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    // Scroll to the owner section
    const ownerSection = document.getElementById('owner-section');
    if (ownerSection) {
      ownerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLearnMore = () => {
    // Scroll to the features section
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating geometric shapes */}
        <div className={`absolute top-20 left-10 w-32 h-32 bg-blue-300/20 rounded-full blur-xl transition-transform duration-3000 ${animationPhase === 0 ? 'translate-x-0 translate-y-0' : animationPhase === 1 ? 'translate-x-16 translate-y-8' : 'translate-x-8 -translate-y-4'}`}></div>
        <div className={`absolute top-40 right-20 w-24 h-24 bg-indigo-300/20 rounded-lg blur-xl transition-transform duration-3000 rotate-45 ${animationPhase === 0 ? 'translate-x-0 translate-y-0' : animationPhase === 1 ? '-translate-x-12 translate-y-12' : 'translate-x-6 translate-y-6'}`}></div>
        <div className={`absolute bottom-32 left-1/4 w-40 h-40 bg-purple-300/20 rounded-full blur-xl transition-transform duration-3000 ${animationPhase === 0 ? 'translate-x-0 translate-y-0' : animationPhase === 1 ? 'translate-x-20 -translate-y-8' : '-translate-x-10 translate-y-4'}`}></div>
        <div className={`absolute bottom-20 right-1/3 w-28 h-28 bg-blue-400/20 rounded-lg blur-xl transition-transform duration-3000 rotate-12 ${animationPhase === 0 ? 'translate-x-0 translate-y-0' : animationPhase === 1 ? 'translate-x-8 translate-y-16' : '-translate-x-12 -translate-y-8'}`}></div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-6">
        <div className="text-center max-w-4xl">
          {/* Main heading with gradient text */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              WorkWise AI
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-blue-100 text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Streamline schedules, manage your team, and boost productivity with AI-powered solutions.
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-blue-200 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
              <span>AI-Powered Scheduling</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
              <span>Team Management</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
              <span>Voice Assistant</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-2xl shadow-2xl hover:shadow-white/25 hover:bg-blue-50 transition duration-300 transform hover:scale-105"
            >
              Get Started
            </button>
            <button
              onClick={handleLearnMore}
              className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl bg-white/10 hover:bg-white/20 transition duration-300 transform hover:scale-105"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div 
        className="absolute bottom-0 left-0 w-full h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(59,130,246,0) 0%, rgba(191,219,254,1) 100%)",
        }}
      />
    </div>
  );
};

// Simple Navbar component
const Navbar = () => {
  const handleNavigation = (path) => {
    // In a real React Router setup, you would use navigate(path)
    console.log(`Navigate to: ${path}`);
    alert(`Navigation to ${path} - This would work with React Router`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">WorkWise AI</div>
        <div className="hidden md:flex space-x-6">
          <button 
            onClick={() => handleNavigation('/')} 
            className="text-blue-100 hover:text-white transition duration-200"
          >
            Home
          </button>
          <button 
            onClick={() => handleNavigation('/about')} 
            className="text-blue-100 hover:text-white transition duration-200"
          >
            About
          </button>
          <button 
            onClick={() => handleNavigation('/contact')} 
            className="text-blue-100 hover:text-white transition duration-200"
          >
            Contact
          </button>
        </div>
      </div>
    </nav>
  );
};

const Home = () => {
  const handleNavigation = (path) => {
    // In a real React Router setup, you would use navigate(path)
    console.log(`Navigate to: ${path}`);
    alert(`Navigation to ${path} - This would work with React Router in a real app`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Streamline Schedules with AI
        </h1>
        <p className="text-gray-700 text-lg md:text-xl mb-16">
          For businesses and employees — onboard your store, manage staff, and generate smart schedules with AI-driven efficiency.
        </p>

        {/* Card Layout */}
        <div id="owner-section" className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
          {/* Owner Card */}
          <div className="bg-blue-100/30 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-8 transition duration-500 hover:shadow-2xl">
            <Building2 className="w-10 h-10 text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">I'm an Owner</h2>
            <p className="text-gray-700 mb-6">
              Register your business, manage your team, and generate AI-optimized schedules effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleNavigation('/admin/onboarding')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-blue-500 transition duration-200 inline-flex items-center justify-center gap-2"
              >
                Register Business <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleNavigation('/admin')}
                className="px-6 py-3 border border-white/30 text-blue-700 font-semibold rounded-xl bg-white/20 hover:bg-white/30 transition duration-200 flex items-center justify-center"
              >
                Owner Portal
              </button>
            </div>
          </div>

          {/* Employee Card */}
          <div className="bg-blue-50/30 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 p-8 transition duration-500 hover:shadow-2xl">
            <Users className="w-10 h-10 text-indigo-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">I'm an Employee</h2>
            <p className="text-gray-700 mb-6">
              Log in with credentials sent by your employer and access your AI-optimized schedule.
            </p>
            <div className="flex">
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-500 transition duration-200 inline-flex items-center justify-center gap-2"
              >
                Employee Login <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features-section" className="mt-24 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-10">Our Features</h2>
          <p className="text-gray-700 text-lg mb-16">
            Everything you need to manage your workforce efficiently and elevate your business experience.
          </p>

          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
              {/* Feature Cards */}
              <div className="bg-white/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg transition hover:shadow-2xl hover:scale-105 duration-300">
                <Mic className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Voice Assistant</h3>
                <p className="text-gray-700 text-sm">Manage schedules and queries hands-free with our AI-powered voice assistant.</p>
              </div>

              <div className="bg-white/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg transition hover:shadow-2xl hover:scale-105 duration-300">
                <Globe className="w-10 h-10 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Multilingual Support</h3>
                <p className="text-gray-700 text-sm">Access your schedule and portal in multiple languages for global accessibility.</p>
              </div>

              <div className="bg-white/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg transition hover:shadow-2xl hover:scale-105 duration-300">
                <Cpu className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Schedule Generator</h3>
                <p className="text-gray-700 text-sm">Automatically generate optimal employee schedules using advanced AI algorithms.</p>
              </div>

              <div className="bg-white/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg transition hover:shadow-2xl hover:scale-105 duration-300">
                <Video className="w-10 h-10 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AR Training</h3>
                <p className="text-gray-700 text-sm">Immersive AR lectures and modules help employees learn faster and smarter.</p>
              </div>

              <div className="bg-white/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg transition hover:shadow-2xl hover:scale-105 duration-300">
                <Calendar className="w-10 h-10 text-red-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">PWA Ready</h3>
                <p className="text-gray-700 text-sm">Offline access to schedules and tools via our Progressive Web App with full functionality.</p>
              </div>

              <div className="bg-white/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg transition hover:shadow-2xl hover:scale-105 duration-300">
                <ArrowRight className="w-10 h-10 text-yellow-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Seamless Integration</h3>
                <p className="text-gray-700 text-sm">Easily integrate with existing systems like payroll, attendance, and HR tools.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;