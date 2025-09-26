import React from "react";
import { Link, useLocation } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Schedule", path: "/schedule" },
    { name: "Payroll", path: "/payroll" },
    // ADDED: The Training link
    { name: "Training", path: "/training" },
  ];

  return (
    // FIX: Changed 'relative' to 'fixed' and added 'top-0' and 'left-0' for screen fixation.
    // NOTE: The 'w-full' ensures it spans the entire width.
    <nav className="fixed z-50 top-0 left-0 w-full bg-twine-950">
      {/* Frosted Glass Container - Full width glass effect is applied here */}
      <div className="flex items-center justify-center p-4 px-6 md:px-8 
                     backdrop-filter backdrop-blur-xl bg-twine-700 bg-opacity-70 
                     border-b border-twine-600 border-opacity-50 shadow-2xl">
        
        {/* Content Wrapper - Centered and max-width restricted for optimal readability on all screens */}
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          
          {/* Logo / Title */}
          <Link
            to="/"
            className="text-2xl font-extrabold text-white tracking-wide hover:text-twine-200 transition"
          >
            WorkWise
          </Link>

          {/* Navigation Links */}
          <div className="flex gap-4 md:gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-base md:text-lg font-medium px-2 py-1 md:px-4 md:py-2 transition-colors duration-300
                  before:content-[''] before:absolute before:left-0 before:bottom-0 before:w-full before:h-1
                  before:rounded-full before:transition-all before:duration-300 before:ease-in-out
                  ${
                    location.pathname === link.path
                      ? "text-twine-200 before:bg-twine-400 font-bold" // Active link color is lighter twine
                      : "text-gray-300 hover:text-twine-100 before:bg-transparent hover:before:bg-twine-700"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Profile Icon */}
          <div className="flex items-center gap-2">
            <Link to="/profile">
              <UserCircleIcon className="h-9 w-9 text-twine-300 transition-transform duration-200 hover:scale-110 hover:text-white" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
