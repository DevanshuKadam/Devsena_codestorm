import Navbar from "../components/Navbar";
import React from 'react';
import { ClockIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon, ChartBarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Particles from '../components/ui/magic/Particles';

// This is a dummy data array to simulate fetching an employee's weekly schedule.
const weeklySchedule = [
  { day: "Monday", date: "Oct 27", shifts: [] },
  { day: "Tuesday", date: "Oct 28", shifts: [{ role: "Barista", start: "10:00 AM", end: "2:00 PM" }] },
  { day: "Wednesday", date: "Oct 29", shifts: [{ role: "Cashier", start: "11:00 AM", end: "3:00 PM" }] },
  { day: "Thursday", date: "Oct 30", shifts: [{ role: "Barista", start: "1:00 PM", end: "5:00 PM" }] },
  { day: "Friday", date: "Oct 31", shifts: [] },
  { day: "Saturday", date: "Nov 1", shifts: [{ role: "Barista", start: "9:00 AM", end: "1:00 PM" }, { role: "Cashier", start: "2:00 PM", end: "6:00 PM" }] },
  { day: "Sunday", date: "Nov 2", shifts: [] },
];

const mockDailyHours = [2, 4, 3, 5, 0, 8, 0]; // Simulated hours for the chart
const totalShifts = weeklySchedule.reduce((count, day) => count + day.shifts.length, 0);

// Magic UI Shimmer Card Component
const ShimmerCard = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden bg-white rounded-2xl border border-gray-200/50 shadow-sm ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    {children}
  </div>
);

// Magic UI Animated Counter Component
const AnimatedCounter = ({ value, label, icon: Icon, gradient = "from-blue-500 to-indigo-500" }) => (
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

// Helper component for the simulated graph
const WorkingHoursChart = ({ hours }) => {
    const maxHour = Math.max(...hours) || 1;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600"/> Weekly Hours Trend
            </h4>
            <div className="flex justify-between items-end h-32 space-x-2">
                {hours.map((hour, index) => (
                    <div key={index} className="flex flex-col items-center h-full justify-end w-1/7">
                        {/* Bar */}
                        <div 
                            className="w-full rounded-t-lg transition-all duration-300 hover:scale-y-[1.05] origin-bottom"
                            style={{ 
                                height: `${(hour / maxHour) * 100}%`, 
                                backgroundColor: hour > 0 ? '#3b82f6' : '#dbeafe' // blue-500 / blue-100
                            }}
                        ></div>
                        {/* Hour Label */}
                        <span className="text-xs text-blue-700 mt-1 font-mono">{hour}h</span>
                        {/* Day Label */}
                        <span className="text-xs text-blue-600 mt-1">{days[index]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default function EmployeeDashboard() {
  // Calculate total hours for the week
  const totalHours = weeklySchedule.reduce((total, day) => {
    const dayHours = day.shifts.reduce((sum, shift) => {
      const parseTime = (time) => {
          let [timePart, modifier] = time.split(" ");
          let [hour, minute = 0] = timePart.split(":");
          hour = parseInt(hour);

          if (modifier === 'PM' && hour !== 12) hour += 12;
          if (modifier === 'AM' && hour === 12) hour = 0;
          
          return hour + minute / 60; 
      };
      
      const startDecimal = parseTime(shift.start);
      const endDecimal = parseTime(shift.end);

      return sum + (endDecimal - startDecimal);
    }, 0);
    return total + dayHours;
  }, 0);

  // General Card Styling for the Bright Background
  const cardStyle = "bg-white rounded-xl shadow-lg transition duration-300 hover:shadow-xl border border-twine-100";
  const metricStyle = "bg-white p-4 rounded-xl shadow-md border border-twine-100 flex flex-col justify-center items-center h-28";
  
  // Get upcoming shifts, filtered to show the next 5
  const upcomingShifts = weeklySchedule
    .flatMap(day => day.shifts.map(shift => ({ ...shift, day: day.day, date: day.date })))
    .filter((_, i) => i < 5);


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
              <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-700 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent">
                    Employee Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">Welcome back, Rahul! Here's your weekly overview</p>
                </div>
              </div>
            </div>
          </ShimmerCard>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
            {/* LEFT COLUMN (Welcome/CTA) */}
            <ShimmerCard className="lg:col-span-1 backdrop-blur-sm bg-white/80">
              <div className="p-6 md:p-8 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                    Hi, Rahul!
                  </h3>
                  <p className="text-lg text-gray-700">
                    You have <span className="font-bold text-blue-600">{totalShifts} shifts</span> to complete this week. Let's make it a productive one!
                  </p>
                </div>

                {/* Weekly Goal Card */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-md font-semibold text-blue-700 mb-2">Weekly Goal Progress</p>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">75% Acknowledged</p>
                </div>

                {/* CTA Button */}
                <button className="mt-8 w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-extrabold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                  View Full Schedule
                </button>
              </div>
            </ShimmerCard>

          
            {/* CENTER COLUMN (Metrics and Chart) */}
            <div className="flex flex-col gap-8 lg:col-span-1">
              
              {/* Top Metrics Grid (4 Cards) */}
              <div className="grid grid-cols-2 gap-4">
                <AnimatedCounter 
                  value={`${totalHours.toFixed(0)}h`} 
                  label="Total Hours" 
                  icon={ClockIcon} 
                  gradient="from-blue-500 to-blue-700" 
                />
                <AnimatedCounter 
                  value={totalShifts} 
                  label="Total Shifts" 
                  icon={CalendarDaysIcon} 
                  gradient="from-indigo-500 to-indigo-700" 
                />
                <AnimatedCounter 
                  value={Math.round(totalShifts * 0.75)} 
                  label="Acknowledged" 
                  icon={CheckCircleIcon} 
                  gradient="from-green-500 to-green-700" 
                />
                <AnimatedCounter 
                  value={weeklySchedule.filter(d => d.shifts.length === 0).length} 
                  label="Days Off" 
                  icon={XCircleIcon} 
                  gradient="from-purple-500 to-purple-700" 
                />
              </div>

              {/* Working Hours Chart */}
              <ShimmerCard className="h-64 backdrop-blur-sm bg-white/80">
                <WorkingHoursChart hours={mockDailyHours} />
              </ShimmerCard>
            </div>
          
            {/* RIGHT COLUMN (Upcoming Shifts List) */}
            <ShimmerCard className="lg:col-span-1 backdrop-blur-sm bg-white/80">
              <div className="p-6 md:p-8 flex flex-col h-full">
                <h4 className="text-2xl font-bold text-gray-900 mb-6 flex justify-between items-center">
                  Upcoming Shifts
                  <span className="text-sm text-blue-500 cursor-pointer hover:underline flex items-center">
                    View All <ArrowRightIcon className="w-4 h-4 ml-1"/>
                  </span>
                </h4>
                
                <div className="space-y-4 flex-1">
                  {upcomingShifts.map((shift, index) => (
                    <div 
                      key={index} 
                      className="p-4 bg-blue-50/70 rounded-lg border border-blue-200 shadow-sm flex justify-between items-center hover:bg-blue-100 transition cursor-pointer"
                    >
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{shift.role}</p>
                        <p className="text-sm text-gray-600">{shift.day}, {shift.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-md font-bold text-blue-700">{shift.start} - {shift.end}</p>
                      </div>
                    </div>
                  ))}

                  {totalShifts === 0 && (
                    <div className="text-center p-8 text-gray-500 bg-blue-50 rounded-lg">
                      <p className="text-3xl mb-2">😴</p>
                      <p>No shifts scheduled this week.</p>
                    </div>
                  )}
                </div>
              </div>
            </ShimmerCard>

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
}