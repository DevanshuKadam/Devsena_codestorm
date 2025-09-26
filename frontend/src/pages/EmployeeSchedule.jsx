import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Particles from '../components/ui/magic/Particles'; 

// --- DUMMY DATA & CONSTANTS ---
const currentAvailability = [
  { day: "Monday", currentWeek: "Oct 27", slots: [{ start: "9:00 AM", end: "1:00 PM" }], totalHours: 4 },
  { day: "Tuesday", currentWeek: "Oct 28", slots: [{ start: "1:00 PM", end: "5:00 PM" }], totalHours: 4 },
  { day: "Wednesday", currentWeek: "Oct 29", slots: [], totalHours: 0 },
  { day: "Thursday", currentWeek: "Oct 30", slots: [{ start: "2:00 PM", end: "6:00 PM" }], totalHours: 4 },
  { day: "Friday", currentWeek: "Oct 31", slots: [{ start: "10:00 AM", end: "2:00 PM" }], totalHours: 4 },
  { day: "Saturday", currentWeek: "Nov 1", slots: [{ start: "10:00 AM", end: "3:00 PM" }], totalHours: 5 },
  { day: "Sunday", currentWeek: "Nov 2", slots: [], totalHours: 0 },
];

const nextWeekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Magic UI Shimmer Card Component
const ShimmerCard = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden bg-white rounded-2xl border border-gray-200/50 shadow-sm ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    {children}
  </div>
);

// Utility to generate initial state for next week's availability form
const initialNextWeekAvailability = nextWeekDays.reduce((acc, day) => {
  acc[day] = { start: '', end: '', isAvailable: true };
  return acc;
}, {});

// --- SCHEDULE VIEW COMPONENT ---
const ScheduleView = ({ setView }) => {
    const totalWeeklyHours = currentAvailability.reduce((sum, day) => sum + day.totalHours, 0);

    // Calculate the start date of the current week (example: assuming the first entry is the start)
    const weekStartDate = currentAvailability[0].currentWeek;
    
    return (
        <>
            {/* Header Card with Glassmorphism */}
            <ShimmerCard className="mb-8 backdrop-blur-xl bg-white/70">
                <div className="p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-700 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent">
                          Current Availability (Week of {weekStartDate})
                        </h2>
                        <p className="text-gray-600 mt-1">Manage your weekly schedule</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setView('set')}
                      className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Set Next Week's Availability
                    </button>
                  </div>
                </div>
              </ShimmerCard>
            
            {/* Summary Card */}
            <ShimmerCard className="backdrop-blur-sm bg-white/80 mb-8">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-700">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Weekly Summary</h3>
                </div>
                <p className="text-xl font-semibold text-gray-800">
                  Total Available Hours this Week: <span className="text-blue-600 font-extrabold ml-1">{totalWeeklyHours}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">This is the schedule you submitted last week, which the shop owner will use for rostering.</p>
              </div>
            </ShimmerCard>

            {/* Availability Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                {currentAvailability.map((day, index) => (
                    <ShimmerCard key={index} className={`backdrop-blur-sm bg-white/80 ${day.slots.length > 0 ? "border-t-4 border-blue-400" : "border-t-4 border-gray-300"}`}>
                        <div className="p-5">
                          <h3 className="text-xl font-bold text-gray-900 flex justify-between items-center">
                            {day.day}
                            {day.slots.length > 0 ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            )}
                          </h3>
                          
                          <p className="text-sm text-gray-500 mb-4">{day.currentWeek}</p>
                          
                          <div className="space-y-3">
                            {day.slots.length > 0 ? (
                              day.slots.map((slot, slotIndex) => (
                                <div key={slotIndex} className="bg-blue-50 rounded-lg p-3 text-sm border border-blue-200">
                                  <p className="text-blue-800 font-semibold">Available</p>
                                  <p className="text-blue-600 font-mono">{slot.start} - {slot.end}</p>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-gray-500 p-4 rounded-lg bg-gray-50">
                                <p className="text-xl mb-1">🚫</p>
                                <p className="text-sm font-medium">Not Available</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </ShimmerCard>
                ))}
            </div>
        </>
    );
};

// --- SET AVAILABILITY FORM COMPONENT ---
const SetAvailabilityForm = ({ nextWeekData, setNextWeekData, setView }) => {
    
    const handleChange = (day, field, value) => {
        setNextWeekData(prevData => ({
            ...prevData,
            [day]: {
                ...prevData[day],
                [field]: value
            }
        }));
    };

    const handleCheckboxChange = (day) => {
        setNextWeekData(prevData => ({
            ...prevData,
            [day]: {
                ...prevData[day],
                isAvailable: !prevData[day].isAvailable,
                // Clear times if marking as unavailable
                start: prevData[day].isAvailable ? '' : prevData[day].start,
                end: prevData[day].isAvailable ? '' : prevData[day].end,
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real application, you would send nextWeekData to the AI scheduling service here.
        console.log("Submitting Next Week Availability:", nextWeekData);
        
        // After successful submission, switch back to the main view
        setView('view'); 
        alert("Availability submitted! The AI scheduler will now draft your shifts.");
    };

    return (
        <ShimmerCard className="max-w-4xl mx-auto backdrop-blur-sm bg-white/80">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-700 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent">
                    Set Availability for Next Week
                  </h2>
                  <p className="text-gray-600 mt-1">Configure your weekly schedule</p>
                </div>
              </div>
              <p className="text-gray-600 mb-8">
                Enter the time range you are available to work for each day. If you cannot work, mark the day as "Not Available."
              </p>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {nextWeekDays.map((day) => (
                    <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
                      <label className="text-xl font-semibold text-gray-800 w-32 shrink-0 mb-2 sm:mb-0">{day}</label>
                      
                      <div className="flex items-center space-x-4 w-full">
                        {/* Not Available Checkbox */}
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`not-available-${day}`}
                            checked={!nextWeekData[day].isAvailable}
                            onChange={() => handleCheckboxChange(day)}
                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`not-available-${day}`} className="text-sm text-gray-700">Not Available</label>
                        </div>
                        
                        {/* Time Inputs */}
                        <div className={`flex space-x-3 transition-opacity duration-300 ${!nextWeekData[day].isAvailable ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                          <input
                            type="time"
                            value={nextWeekData[day].start}
                            onChange={(e) => handleChange(day, 'start', e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                            required={nextWeekData[day].isAvailable}
                            disabled={!nextWeekData[day].isAvailable}
                          />
                          <span className="text-gray-700 self-center">-</span>
                          <input
                            type="time"
                            value={nextWeekData[day].end}
                            onChange={(e) => handleChange(day, 'end', e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                            required={nextWeekData[day].isAvailable}
                            disabled={!nextWeekData[day].isAvailable}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setView('view')}
                    className="px-6 py-2 bg-gray-300 text-gray-800 font-bold rounded-full hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Submit Availability
                  </button>
                </div>
              </form>
            </div>
          </ShimmerCard>
    );
};


// --- MAIN SCHEDULE COMPONENT ---
export default function EmployeeSchedule() {
    const [currentView, setView] = useState('view'); // 'view' or 'set'
    const [nextWeekData, setNextWeekData] = useState(initialNextWeekAvailability);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
            <Navbar />
            {/* Particles Background */}
            <Particles count={50} />
            
            <div className="relative z-10 pt-20 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Dynamic Content based on View State */}
                    {currentView === 'view' ? (
                        <ScheduleView setView={setView} />
                    ) : (
                        <SetAvailabilityForm 
                            nextWeekData={nextWeekData} 
                            setNextWeekData={setNextWeekData} 
                            setView={setView} 
                        />
                    )}
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
