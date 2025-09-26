import React, { useState } from "react";
// Assuming Navbar component is available via this path and is named Navbar
// NOTE: I corrected the 'SideBar' import name to 'Navbar' to match the component file name/export.
import Navbar from "../components/Navbar"; 

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <h2 className="text-3xl font-extrabold text-twine-900">
                    Current Availability (Week of {weekStartDate})
                </h2>
                <button 
                    onClick={() => setView('set')}
                    className="mt-4 sm:mt-0 px-6 py-3 bg-twine-600 text-white font-bold rounded-full shadow-lg shadow-twine-500/50 hover:bg-twine-700 active:scale-95 transition transform duration-300 ease-in-out"
                >
                    Set Next Week's Availability
                </button>
            </div>
            
            {/* Summary Card */}
            <div className="bg-twine-200 p-5 rounded-xl shadow-inner mb-8 border-l-4 border-twine-600">
                <p className="text-xl font-semibold text-twine-800">
                    Total Available Hours this Week: <span className="text-twine-950 font-extrabold ml-1">{totalWeeklyHours}</span>
                </p>
                <p className="text-sm text-twine-700 mt-1">This is the schedule you submitted last week, which the shop owner will use for rostering.</p>
            </div>

            {/* Availability Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                {currentAvailability.map((day, index) => (
                    <div
                        key={index}
                        className={`bg-white rounded-xl p-5 shadow-md border-t-4 ${day.slots.length > 0 ? "border-twine-400" : "border-gray-300"}`}
                    >
                        <h3 className="text-xl font-bold text-twine-900 flex justify-between items-center">
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
                                    <div key={slotIndex} className="bg-twine-50 rounded-lg p-3 text-sm border border-twine-200">
                                        <p className="text-twine-800 font-semibold">Available</p>
                                        <p className="text-twine-600 font-mono">{slot.start} - {slot.end}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-twine-500 p-4 rounded-lg bg-twine-50">
                                    <p className="text-xl mb-1">🚫</p>
                                    <p className="text-sm font-medium">Not Available</p>
                                </div>
                            )}
                        </div>
                    </div>
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
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-twine-200">
            <h2 className="text-3xl font-extrabold text-twine-900 mb-6 border-b pb-4">
                Set Availability for Next Week
            </h2>
            <p className="text-gray-600 mb-8">
                Enter the time range you are available to work for each day. If you cannot work, mark the day as "Not Available."
            </p>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {nextWeekDays.map((day) => (
                        <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-twine-50 rounded-xl border border-twine-200 shadow-sm">
                            <label className="text-xl font-semibold text-twine-800 w-32 shrink-0 mb-2 sm:mb-0">{day}</label>
                            
                            <div className="flex items-center space-x-4 w-full">
                                {/* Not Available Checkbox */}
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`not-available-${day}`}
                                        checked={!nextWeekData[day].isAvailable}
                                        onChange={() => handleCheckboxChange(day)}
                                        className="h-5 w-5 text-twine-600 border-gray-300 rounded focus:ring-twine-500"
                                    />
                                    <label htmlFor={`not-available-${day}`} className="text-sm text-twine-700">Not Available</label>
                                </div>
                                
                                {/* Time Inputs */}
                                <div className={`flex space-x-3 transition-opacity duration-300 ${!nextWeekData[day].isAvailable ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                    <input
                                        type="time"
                                        value={nextWeekData[day].start}
                                        onChange={(e) => handleChange(day, 'start', e.target.value)}
                                        className="p-2 border border-twine-300 rounded-lg text-twine-900 focus:ring-twine-500 focus:border-twine-500 w-full sm:w-auto"
                                        required={nextWeekData[day].isAvailable}
                                        disabled={!nextWeekData[day].isAvailable}
                                    />
                                    <span className="text-twine-700 self-center">-</span>
                                    <input
                                        type="time"
                                        value={nextWeekData[day].end}
                                        onChange={(e) => handleChange(day, 'end', e.target.value)}
                                        className="p-2 border border-twine-300 rounded-lg text-twine-900 focus:ring-twine-500 focus:border-twine-500 w-full sm:w-auto"
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
                        className="px-6 py-2 bg-twine-600 text-white font-bold rounded-full shadow-lg hover:bg-twine-700 transition"
                    >
                        Submit Availability
                    </button>
                </div>
            </form>
        </div>
    );
};


// --- MAIN SCHEDULE COMPONENT ---
export default function EmployeeSchedule() {
    const [currentView, setView] = useState('view'); // 'view' or 'set'
    const [nextWeekData, setNextWeekData] = useState(initialNextWeekAvailability);

    return (
        <div className="min-h-screen flex flex-col bg-twine-100 font-['Inter']">
            <Navbar />
            
            <div className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
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
    );
}
