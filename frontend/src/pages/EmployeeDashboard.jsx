import Navbar from "../components/Navbar";
import React from 'react';
import { ClockIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon, ChartBarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

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

// Helper component for the simulated graph
const WorkingHoursChart = ({ hours }) => {
    const maxHour = Math.max(...hours) || 1;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="p-6">
            <h4 className="text-lg font-bold text-twine-900 mb-4 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2 text-twine-600"/> Weekly Hours Trend
            </h4>
            <div className="flex justify-between items-end h-32 space-x-2">
                {hours.map((hour, index) => (
                    <div key={index} className="flex flex-col items-center h-full justify-end w-1/7">
                        {/* Bar */}
                        <div 
                            className="w-full rounded-t-lg transition-all duration-300 hover:scale-y-[1.05] origin-bottom"
                            style={{ 
                                height: `${(hour / maxHour) * 100}%`, 
                                // Cohesive twine colors for the chart bars
                                backgroundColor: hour > 0 ? '#b7753b' : '#f1e4d0' // twine-500 / twine-100
                            }}
                        ></div>
                        {/* Hour Label */}
                        <span className="text-xs text-twine-700 mt-1 font-mono">{hour}h</span>
                        {/* Day Label */}
                        <span className="text-xs text-twine-600 mt-1">{days[index]}</span>
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
    <div className="min-h-screen flex flex-col bg-twine-50 font-['Inter']">
      <Navbar />
      
      {/* FIX: Added pt-24 (padding top) to push content down below the fixed Navbar.
        The max-w-full class ensures the content spreads to the edges of the window 
        (minus the padding), rather than being centered via mx-auto. 
      */}
      <div className="relative z-10 flex-1 pt-24 pb-10 px-6 lg:px-12 w-full">
        
        {/* Main Header - Now takes up the full width */}
        <h2 className="text-4xl font-extrabold text-twine-900 tracking-tight mb-8 max-w-7xl mx-auto">
            Dashboard
        </h2>

        {/* --- MAIN GRID LAYOUT --- */}
        {/* FIX: The content is placed inside a fixed max-width container (max-w-7xl mx-auto)
          to prevent excessive stretching on ultra-wide screens, but the outer
          padding ensures it feels spread out. 
        */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* LEFT COLUMN (Welcome/CTA) */}
          <div className={`p-6 md:p-8 ${cardStyle} lg:col-span-1 flex flex-col justify-between`}>
            <div>
                <h3 className="text-4xl font-extrabold text-twine-800 tracking-tight mb-4">
                    Hi, Rahul!
                </h3>
                <p className="text-lg text-gray-700">
                    You have <span className="font-bold text-twine-600">{totalShifts} shifts</span> to complete this week. Let's make it a productive one!
                </p>
            </div>

            {/* Weekly Goal Card (Styled to match image) */}
            <div className="mt-8 p-4 bg-twine-100 rounded-lg border border-twine-200">
                <p className="text-md font-semibold text-twine-700 mb-2">Weekly Goal Progress</p>
                <div className="w-full bg-twine-200 rounded-full h-2">
                    {/* Assuming 75% progress for a visual */}
                    <div className="bg-twine-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-sm text-twine-600 mt-2">75% Acknowledged</p>
            </div>

            {/* CTA Button */}
            <button className="mt-8 w-full px-8 py-3 bg-twine-500 text-white font-extrabold text-lg rounded-full shadow-md shadow-twine-500/50 hover:bg-twine-600 active:scale-[0.98] transition">
                View Full Schedule
            </button>
          </div>

          
          {/* CENTER COLUMN (Metrics and Chart) */}
          <div className="flex flex-col gap-8 lg:col-span-1">
            
            {/* Top Metrics Grid (4 Cards) */}
            <div className="grid grid-cols-2 gap-4">
                
                {/* Metric 1: Total Hours */}
                <div className={`${metricStyle}`}>
                    <ClockIcon className="w-8 h-8 text-twine-600 mb-1" />
                    <p className="text-3xl font-black text-twine-800">{totalHours.toFixed(0)}h</p>
                    <p className="text-sm uppercase text-gray-500 mt-1">Total Hours</p>
                </div>

                {/* Metric 2: Scheduled Shifts */}
                <div className={`${metricStyle}`}>
                    <CalendarDaysIcon className="w-8 h-8 text-twine-600 mb-1" />
                    <p className="text-3xl font-black text-twine-800">{totalShifts}</p>
                    <p className="text-sm uppercase text-gray-500 mt-1">Total Shifts</p>
                </div>
                
                {/* Metric 3: Acknowledged Shifts */}
                <div className={`${metricStyle}`}>
                    <CheckCircleIcon className="w-8 h-8 text-twine-600 mb-1" />
                    <p className="text-3xl font-black text-twine-800">{Math.round(totalShifts * 0.75)}</p>
                    <p className="text-sm uppercase text-gray-500 mt-1">Acknowledged</p>
                </div>
                
                {/* Metric 4: Days Off */}
                <div className={`${metricStyle}`}>
                    <XCircleIcon className="w-8 h-8 text-twine-600 mb-1" />
                    <p className="text-3xl font-black text-twine-800">{weeklySchedule.filter(d => d.shifts.length === 0).length}</p>
                    <p className="text-sm uppercase text-gray-500 mt-1">Days Off</p>
                </div>
            </div>

            {/* Working Hours Chart */}
            <div className={`h-64 ${cardStyle}`}>
                <WorkingHoursChart hours={mockDailyHours} />
            </div>
          </div>
          
          {/* RIGHT COLUMN (Upcoming Shifts List) */}
          <div className={`p-6 md:p-8 ${cardStyle} lg:col-span-1 flex flex-col`}>
            <h4 className="text-2xl font-bold text-twine-800 mb-6 flex justify-between items-center">
                Upcoming Shifts
                <span className="text-sm text-twine-500 cursor-pointer hover:underline flex items-center">
                    View All <ArrowRightIcon className="w-4 h-4 ml-1"/>
                </span>
            </h4>
            
            <div className="space-y-4 flex-1">
                {upcomingShifts.map((shift, index) => (
                    <div 
                        key={index} 
                        className="p-4 bg-twine-50/70 rounded-lg border border-twine-200 shadow-sm flex justify-between items-center hover:bg-twine-100 transition cursor-pointer"
                    >
                        <div>
                            <p className="text-lg font-semibold text-twine-800">{shift.role}</p>
                            <p className="text-sm text-gray-600">{shift.day}, {shift.date}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-md font-bold text-twine-700">{shift.start} - {shift.end}</p>
                        </div>
                    </div>
                ))}

                {totalShifts === 0 && (
                    <div className="text-center p-8 text-gray-500 bg-twine-50 rounded-lg">
                        <p className="text-3xl mb-2">😴</p>
                        <p>No shifts scheduled this week.</p>
                    </div>
                )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}