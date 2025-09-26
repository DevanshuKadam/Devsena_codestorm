import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { UserCircleIcon } from "@heroicons/react/24/outline";

const OwnerNavbar = () => {
  return (
    <>
      <nav className="flex items-center justify-between bg-white shadow-md px-6 py-4">
        <Button
          asChild
          variant="link"
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-twine-500 to-twine-700"
        >
          <Link to="/admin">WorkFlow AI Admin</Link>
        </Button>

        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="ghost" className="text-sm md:text-base font-medium hover:text-twine-600">
            <Link to="/admin">Dashboard</Link>
          </Button>
          <Button asChild variant="ghost" className="text-sm md:text-base font-medium hover:text-twine-600">
            <Link to="/admin/staff-management">Staff</Link>
          </Button>
          <Button asChild variant="ghost" className="text-sm md:text-base font-medium hover:text-twine-600">
            <Link to="/admin/schedule-dashboard">Schedule</Link>
          </Button>
          
        </div>

        <div className="flex items-center gap-2">
          <UserCircleIcon className="w-8 h-8 text-gray-600" />
          <Link
            to="/admin/business-profile"
            className="text-gray-600 hover:text-twine-600 text-lg font-medium"
          >
            Business Profile
          </Link>
        </div>
      </nav>
      <div className="border-b-2 border-gray-200 shadow-sm" />
    </>
  );
};

export default OwnerNavbar;


