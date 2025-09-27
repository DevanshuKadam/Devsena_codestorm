import React from 'react';
import OwnerNavbar from '../../components/OwnerNavbar';
// FIX: Replaced Lucide icons with their Heroicons V2 equivalent names.
import { UsersIcon, CalendarDaysIcon, CheckCircleIcon, DocumentTextIcon, BuildingOffice2Icon, AcademicCapIcon } from '@heroicons/react/24/outline'; 
import { Button } from '../../components/ui/button';
import ShimmerCard from '../../components/ui/magic/ShimmerCard';
import Particles from '../../components/ui/magic/Particles';

// --- Magic UI Animated Counter Component (Simplified for this file) ---
const AnimatedCounter = ({ value, label, icon: Icon, gradient = "from-orange-500 to-amber-500" }) => (
  <div className="relative group">
    <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  </div>
);
// ---------------------------------------------------------------------

const mockMetrics = {
    totalEmployees: 8,
    openPositions: 2,
    nextWeekShifts: 42,
    pendingApprovals: 3,
};


const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
      <Particles count={100} />
      <OwnerNavbar />

      <div className="relative z-10 pt-24 p-6 max-w-7xl mx-auto">
        
        {/* Header Card with Glassmorphism (Icon changed to Heroicon equivalent) */}
        <ShimmerCard className="mb-8 backdrop-blur-xl bg-white/70">
          <div className="p-8 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg">
                <BuildingOffice2Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-800 to-amber-700 bg-clip-text text-transparent">
                  Owner Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Overview of your business, staff, and schedules</p>
              </div>
            </div>
          </div>
        </ShimmerCard>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatedCounter 
            value={mockMetrics.totalEmployees} 
            label="Total Employees" 
            icon={UsersIcon} // Updated icon name
            gradient="from-orange-500 to-orange-700"
          />
          <AnimatedCounter 
            value={mockMetrics.openPositions} 
            label="Open Positions" 
            icon={DocumentTextIcon} // Updated icon name (used DocumentTextIcon for FileText)
            gradient="from-amber-500 to-amber-700" 
          />
          <AnimatedCounter 
            value={mockMetrics.nextWeekShifts} 
            label="Next Week Shifts" 
            icon={CalendarDaysIcon} // Updated icon name
            gradient="from-amber-500 to-amber-700" 
          />
          <AnimatedCounter 
            value={mockMetrics.pendingApprovals} 
            label="Pending Approvals" 
            icon={CheckCircleIcon} 
            gradient="from-yellow-500 to-yellow-700" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Upcoming Shifts Card */}
          <ShimmerCard className="p-6 lg:col-span-2 backdrop-blur-sm bg-white/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-orange-600" /> {/* Updated icon name */}
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Shifts</h2>
              </div>
              <Button asChild className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-full shadow-md hover:from-amber-600 hover:to-orange-500 transition-all">
                <a href="/admin/schedule-dashboard">View Scheduler</a>
              </Button>
            </div>
            <div className="space-y-3">
              {["Mon 9-5 Cashier", "Tue 10-6 Stock", "Sat 8-4 Barista"]?.map((s, i) => (
                <div 
                  key={i} 
                  className="p-4 bg-orange-50/70 rounded-lg border border-orange-200 shadow-sm flex justify-between items-center hover:bg-orange-100 transition cursor-pointer text-gray-800 font-medium"
                >
                  {s}
                </div>
              ))}
            </div>
          </ShimmerCard>

          {/* Quick Actions Card */}
          <ShimmerCard className="p-6 backdrop-blur-sm bg-white/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-amber-600" /> {/* Updated icon name */}
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </div>
            </div>
            <div className="space-y-3">
              <Button asChild className="w-full justify-start text-gray-700 bg-white/60 border border-orange-200 hover:bg-orange-100/70 transition-all shadow-sm">
                <a href="/admin/staff-management" className="inline-flex items-center gap-2"><UsersIcon className="w-4 h-4 text-orange-600" /> Manage Staff</a>
              </Button>
              <Button asChild className="w-full justify-start text-gray-700 bg-white/60 border border-orange-200 hover:bg-orange-100/70 transition-all shadow-sm">
                {/* FIX APPLIED HERE: Replaced Brain with AcademicCapIcon */}
                <a href="/admin/schedule-dashboard" className="inline-flex items-center gap-2"><AcademicCapIcon className="w-4 h-4 text-amber-600" /> Generate AI Schedule</a>
              </Button>
              <Button asChild className="w-full justify-start text-gray-700 bg-white/60 border border-orange-200 hover:bg-orange-100/70 transition-all shadow-sm">
                <a href="/admin/business-profile" className="inline-flex items-center gap-2"><DocumentTextIcon className="w-4 h-4 text-yellow-600" /> Edit Business Profile</a>
              </Button>
            </div>
          </ShimmerCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;