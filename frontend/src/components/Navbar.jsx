import React from "react";
import { Link, useLocation } from "react-router-dom";
import { UserCircleIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Schedule", path: "/schedule" },
    { name: "Payroll", path: "/payroll" },
    { name: "Training", path: "/training" },
    { name: "Chat", path: "/chat" },
  ];

  return (
    <nav className="fixed z-50 top-0 left-0 w-full backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg">
      {/* Glassmorphism Container */}
      <div className="flex items-center justify-center p-4 px-6 md:px-8">
        
        {/* Content Wrapper */}
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          
          {/* Logo / Title */}
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent tracking-wide hover:from-blue-600 hover:to-indigo-500 transition-all duration-300"
          >
            WorkWise Employee Portal
          </Link>

          {/* Navigation Links */}
          <div className="flex gap-4 md:gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-base md:text-lg font-medium px-3 py-2 rounded-lg transition-all duration-300
                  ${
                    location.pathname === link.path
                      ? "bg-white/20 text-blue-800 font-semibold shadow-sm" 
                      : "text-gray-700 hover:text-blue-600 hover:bg-white/10"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Profile and Chat Icons */}
          <div className="flex items-center gap-2">
            <Link to="/chat" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300" title="Chat with Manager">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600 transition-transform duration-200 hover:scale-110" />
            </Link>
            <Link to="/profile" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300" title="Profile">
              <UserCircleIcon className="h-8 w-8 text-blue-600 transition-transform duration-200 hover:scale-110" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
