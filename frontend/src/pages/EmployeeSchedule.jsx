import React, { useState, useEffect } from "react";
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
    const [scheduleData, setScheduleData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEmployeeSchedule();
    }, []);

    const fetchEmployeeSchedule = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get employee data from localStorage
            const employeeData = localStorage.getItem('employeeData');
            if (!employeeData) {
                throw new Error('Employee data not found. Please log in again.');
            }

            const parsedEmployeeData = JSON.parse(employeeData);
            const employeeId = parsedEmployeeData.employeeId || parsedEmployeeData.id;
            const shopId = parsedEmployeeData.shopId;

            if (!employeeId || !shopId) {
                throw new Error('Employee ID or Shop ID not found. Please log in again.');
            }

            // Fetch schedule from API
            const response = await fetch(
                `http://localhost:3000/employee/schedule?shopId=${shopId}&employeeId=${employeeId}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch schedule');
            }

            const data = await response.json();
            setScheduleData(data);
        } catch (err) {
            console.error('Error fetching schedule:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Convert API schedule data to display format
    const convertScheduleToDisplayFormat = (schedule) => {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const displayData = [];

        // Initialize all days
        for (let i = 0; i < 7; i++) {
            displayData.push({
                day: dayNames[i],
                currentWeek: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                slots: [],
                totalHours: 0
            });
        }

        // Fill in actual schedule data
        if (schedule && Array.isArray(schedule)) {
            schedule.forEach(shift => {
                const dayIndex = shift.workday;
                if (dayIndex >= 0 && dayIndex < 7) {
                    const startTime = formatTime(shift.start);
                    const endTime = formatTime(shift.end);
                    const hours = calculateHours(shift.start, shift.end);
                    
                    displayData[dayIndex].slots.push({
                        start: startTime,
                        end: endTime,
                        incentive: shift.incentive
                    });
                    displayData[dayIndex].totalHours += hours;
                }
            });
        }

        return displayData;
    };

    const formatTime = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const calculateHours = (start, end) => {
        if (!start || !end) return 0;
        const startTime = new Date(`2000-01-01T${start}:00`);
        const endTime = new Date(`2000-01-01T${end}:00`);
        return (endTime - startTime) / (1000 * 60 * 60);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
                <Navbar />
                <Particles count={50} />
                <div className="relative z-10 pt-20 p-6">
                    <div className="max-w-7xl mx-auto">
                        <ShimmerCard className="backdrop-blur-sm bg-white/80">
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading your schedule...</p>
                            </div>
                        </ShimmerCard>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
                <Navbar />
                <Particles count={50} />
                <div className="relative z-10 pt-20 p-6">
                    <div className="max-w-7xl mx-auto">
                        <ShimmerCard className="backdrop-blur-sm bg-white/80">
                            <div className="p-8 text-center">
                                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Schedule</h3>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <button
                                    onClick={fetchEmployeeSchedule}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                                >
                                    Try Again
                                </button>
                            </div>
                        </ShimmerCard>
                    </div>
                </div>
            </div>
        );
    }

    const displaySchedule = scheduleData ? convertScheduleToDisplayFormat(scheduleData.schedule) : [];
    const totalWeeklyHours = scheduleData ? scheduleData.totalHours : 0;
    const hasScheduleData = scheduleData && scheduleData.schedule && scheduleData.schedule.length > 0;
    
    // Calculate week start date (Sunday)
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay); // Go back to Sunday
    const weekStartDate = startOfWeek.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
    
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
                          Current Schedule (Week of {weekStartDate})
                        </h2>
                        <p className="text-gray-600 mt-1">View your assigned shifts and manage availability</p>
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
                {hasScheduleData ? (
                  <>
                    <p className="text-xl font-semibold text-gray-800">
                      Total Scheduled Hours this Week: <span className="text-blue-600 font-extrabold ml-1">{totalWeeklyHours}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">This is your current work schedule assigned by the shop owner.</p>
                  </>
                ) : (
                  <>
                <p className="text-xl font-semibold text-gray-800">
                      No schedule data available
                </p>
                    <p className="text-sm text-gray-600 mt-1">You haven't been assigned any shifts yet. Please set your availability below.</p>
                  </>
                )}
              </div>
            </ShimmerCard>

            {/* Schedule Grid */}
            {hasScheduleData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                {displaySchedule.map((day, index) => (
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
                                  <p className="text-blue-800 font-semibold">Scheduled Shift</p>
                                  <p className="text-blue-600 font-mono">{slot.start} - {slot.end}</p>
                                  {slot.incentive && (
                                    <p className="text-green-600 text-xs mt-1 font-medium">
                                      💰 {slot.incentive}
                                    </p>
                                  )}
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
            ) : (
              <ShimmerCard className="backdrop-blur-sm bg-white/80">
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Schedule Assigned</h3>
                  <p className="text-gray-600 mb-4">You haven't been assigned any shifts yet. Set your availability below to help the shop owner create your schedule.</p>
                </div>
              </ShimmerCard>
            )}
        </>
    );
};

// --- SET AVAILABILITY FORM COMPONENT ---
const SetAvailabilityForm = ({ nextWeekData, setNextWeekData, setView }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Get employee ID from localStorage
            const employeeData = localStorage.getItem('employeeData');
            if (!employeeData) {
                alert("Employee data not found. Please log in again.");
                setIsSubmitting(false);
                return;
            }
            
            const parsedEmployeeData = JSON.parse(employeeData);
            const employeeId = parsedEmployeeData.employeeId || parsedEmployeeData.id;
            
            if (!employeeId) {
                alert("Employee ID not found. Please log in again.");
                setIsSubmitting(false);
                return;
            }

            // Map form data to the required structure
            const availabilities = [];
            const dayMapping = {
                "Monday": 1,
                "Tuesday": 2, 
                "Wednesday": 3,
                "Thursday": 4,
                "Friday": 5,
                "Saturday": 6,
                "Sunday": 0
            };

            // Calculate next week's dates (starting from next Monday)
            const today = new Date();
            const nextMonday = new Date(today);
            nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7); // Next Monday
            
            // Process each day in the form
            nextWeekDays.forEach(day => {
                const dayData = nextWeekData[day];
                const weekday = dayMapping[day];
                
                // Calculate the date for this weekday
                const dayDate = new Date(nextMonday);
                dayDate.setDate(nextMonday.getDate() + (weekday === 0 ? 6 : weekday - 1)); // Adjust for Sunday = 0
                
                const availability = {
                    weekday: weekday,
                    start: dayData.isAvailable ? dayData.start : "00:00",
                    end: dayData.isAvailable ? dayData.end : "00:00", 
                    isDayOff: !dayData.isAvailable,
                    date: dayDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
                };
                
                availabilities.push(availability);
            });

            // Add Sunday (day 0) if not in nextWeekDays
            if (!nextWeekDays.includes("Sunday")) {
                const sundayDate = new Date(nextMonday);
                sundayDate.setDate(nextMonday.getDate() + 6); // Sunday is 6 days after Monday
                
                availabilities.push({
                    weekday: 0,
                    start: "00:00",
                    end: "00:00",
                    isDayOff: true,
                    date: sundayDate.toISOString().split('T')[0]
                });
            }

            // Sort by weekday
            availabilities.sort((a, b) => a.weekday - b.weekday);

            console.log("Mapped availability data:", availabilities);

            // Send POST request to the backend
            const response = await fetch(`http://localhost:3000/employee/${employeeId}/availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ availabilities })
            });

            if (response.ok) {
                const result = await response.json();
        setView('view'); 
            } else {
                const error = await response.json();
                console.error("Error submitting availability:", error);
                alert("Failed to submit availability. Please try again.");
            }

        } catch (error) {
            console.error("Error submitting availability:", error);
            alert("An error occurred while submitting availability. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
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
                    disabled={isSubmitting}
                    className={`px-6 py-2 font-bold rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Availability'
                    )}
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
