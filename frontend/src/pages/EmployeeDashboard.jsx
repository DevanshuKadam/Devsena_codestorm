import Navbar from "../components/Navbar";
import { useState, useEffect } from 'react';
import { ClockIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon, ChartBarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Particles from '../components/ui/magic/Particles';
import QRScanner from '../components/QRScanner';
import apiService from '../services/api';
import { Camera, LogOut } from 'lucide-react';

// Dynamic data will be fetched from API

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
  const [employee, setEmployee] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeStatus, setTimeStatus] = useState({
    isPunchedIn: false,
    punchInTime: null,
    currentShiftHours: 0.0,
  });
  const [showScanner, setShowScanner] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    weeklySchedule: [],
    totalShifts: 0,
    totalHours: '0',
    dailyHours: [0, 0, 0, 0, 0, 0, 0],
    upcomingShifts: [],
    metrics: {
      totalShifts: 0,
      totalHours: '0',
      acknowledgedShifts: 0,
      daysOff: 0
    }
  });
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async (employeeData) => {
    if (!employeeData?.employeeId) return;
    
    try {
      setIsLoadingDashboard(true);
      const response = await apiService.getEmployeeDashboard(employeeData.employeeId);
      
      if (response.success) {
        setDashboardData(response.dashboard);
        // Update time status from dashboard data
        setTimeStatus(response.dashboard.currentStatus);
      } else {
        console.error('Failed to fetch dashboard data:', response.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  // Check authentication and load employee data
  useEffect(() => {
    const employeeData = localStorage.getItem('employeeData');
    if (employeeData) {
      try {
        const parsedEmployeeData = JSON.parse(employeeData);
        setEmployee(parsedEmployeeData);
        setIsAuthenticated(true);
        checkTodayPunchStatus(parsedEmployeeData);
        fetchDashboardData(parsedEmployeeData);
      } catch (error) {
        console.error('Error parsing employee data:', error);
        localStorage.removeItem('employeeData');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('employeeData');
    setEmployee(null);
    setIsAuthenticated(false);
    window.location.href = '/employee-login';
  };

  const checkTodayPunchStatus = async (employeeData = employee) => {
    if (!employeeData) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiService.getEmployeePunchRecords(employeeData.employeeId, today, today, 10);
      
      if (response.success) {
        const todayRecords = response.punchRecords;
        const punchInRecord = todayRecords.find(record => record.punchType === 'punchin');
        const punchOutRecord = todayRecords.find(record => record.punchType === 'punchout');
        
        if (punchInRecord && !punchOutRecord) {
          setTimeStatus({
            isPunchedIn: true,
            punchInTime: new Date(punchInRecord.timestamp).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            currentShiftHours: 0.0,
          });
        } else if (punchInRecord && punchOutRecord) {
          setTimeStatus({
            isPunchedIn: false,
            punchInTime: new Date(punchInRecord.timestamp).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            currentShiftHours: parseFloat(punchOutRecord.workHours || 0),
          });
        }
      }
    } catch (error) {
      console.error('Error checking punch status:', error);
    }
  };

  const handleQRScan = async (qrToken) => {
    if (!isAuthenticated || !employee) {
      setMessage('❌ Please log in first');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('Processing QR code...');

      // Note: In a real app, you'd need to securely store and pass the password
      const mockPassword = 'czczpn74bpq'; // This should be handled properly in production
      const response = await apiService.punchInScan(employee.employeeId, mockPassword, qrToken);
      
      if (response.success) {
        setTimeStatus({
          isPunchedIn: true,
          punchInTime: new Date(response.punchRecord.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          currentShiftHours: 0.0,
        });
        setMessage(`✅ Successfully PUNCHED IN at ${new Date(response.punchRecord.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`);
        // Refresh dashboard data
        fetchDashboardData(employee);
      } else {
        setMessage(`❌ Punch in failed: ${response.message}`);
      }
    } catch (error) {
      console.error('Punch in error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePunchOut = async () => {
    if (!isAuthenticated || !employee) {
      setMessage('❌ Please log in first');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('Processing punch out...');

      // Note: In a real app, you'd need to securely store and pass the password
      const mockPassword = 'temp_password'; // This should be handled properly in production
      const response = await apiService.punchOut(employee.employeeId, mockPassword);
      
      if (response.success) {
        setTimeStatus({
          ...timeStatus,
          isPunchedIn: false,
          currentShiftHours: parseFloat(response.punchRecord.workHours || 0),
        });
        setMessage(`👋 Successfully PUNCHED OUT. Shift length: ${response.punchRecord.workHours} hours.`);
        // Refresh dashboard data
        fetchDashboardData(employee);
      } else {
        setMessage(`❌ Punch out failed: ${response.message}`);
      }
    } catch (error) {
      console.error('Punch out error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = () => {
    if (timeStatus.isPunchedIn) {
      handlePunchOut();
    } else {
      setShowScanner(true);
    }
  };

  // Use dynamic data from API
  const { weeklySchedule, totalShifts, totalHours, dailyHours, upcomingShifts, metrics } = dashboardData;

  // General Card Styling for the Bright Background
  const cardStyle = "bg-white rounded-xl shadow-lg transition duration-300 hover:shadow-xl border border-twine-100";
  const metricStyle = "bg-white p-4 rounded-xl shadow-md border border-twine-100 flex flex-col justify-center items-center h-28";


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
              <div className="flex items-center justify-between">
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
                    <p className="text-gray-600 mt-1">
                      Welcome back, {employee?.name || 'Employee'}! Here's your weekly overview
                    </p>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
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
                    Hi, {employee?.name || 'Employee'}!
                  </h3>
                  <p className="text-lg text-gray-700">
                    {isLoadingDashboard ? (
                      <span className="animate-pulse">Loading your schedule...</span>
                    ) : (
                      <>You have <span className="font-bold text-blue-600">{totalShifts} shifts</span> to complete this week. Let's make it a productive one!</>
                    )}
                  </p>
                </div>


                {/* Punch In/Out Button */}
                <button
                  onClick={handleAction}
                  disabled={isLoading || showScanner}
                  className={`mt-8 w-full px-8 py-3 text-white font-extrabold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2
                    ${timeStatus.isPunchedIn 
                      ? 'bg-gradient-to-r from-red-500 to-red-700' 
                      : 'bg-gradient-to-r from-green-500 to-green-700'
                    }`}
                >
                  {timeStatus.isPunchedIn ? (
                    <LogOut className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
                  ) : (
                    <Camera className={`w-5 h-5 ${showScanner ? 'animate-pulse' : ''}`} />
                  )}
                  {isLoading 
                    ? 'Processing...' 
                    : showScanner 
                      ? 'Scanning QR...' 
                      : timeStatus.isPunchedIn 
                        ? 'Punch Out' 
                        : 'Punch In'}
                </button>

                {/* Status Message */}
                {message && (
                  <div className={`mt-4 p-3 rounded-xl border-l-4 ${timeStatus.isPunchedIn ? 'bg-green-50 border-green-400 text-green-700' : 'bg-blue-50 border-blue-400 text-blue-700'}`}>
                    <p className="font-medium text-sm">{message}</p>
                  </div>
                )}

                {/* Current Status Display */}
                {timeStatus.isPunchedIn && (
                  <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm text-green-700">
                      <strong>Punched In:</strong> {timeStatus.punchInTime}
                    </p>
                  </div>
                )}
              </div>
            </ShimmerCard>

          
            {/* CENTER COLUMN (Metrics and Chart) */}
            <div className="flex flex-col gap-8 lg:col-span-1">
              
              {/* Top Metrics Grid (4 Cards) */}
              <div className="grid grid-cols-2 gap-4">
                <AnimatedCounter 
                  value={isLoadingDashboard ? "..." : `${totalHours}h`} 
                  label="Total Hours" 
                  icon={ClockIcon} 
                  gradient="from-blue-500 to-blue-700" 
                />
                <AnimatedCounter 
                  value={isLoadingDashboard ? "..." : totalShifts} 
                  label="Total Shifts" 
                  icon={CalendarDaysIcon} 
                  gradient="from-indigo-500 to-indigo-700" 
                />
                <AnimatedCounter 
                  value={isLoadingDashboard ? "..." : metrics.acknowledgedShifts} 
                  label="Acknowledged" 
                  icon={CheckCircleIcon} 
                  gradient="from-green-500 to-green-700" 
                />
                <AnimatedCounter 
                  value={isLoadingDashboard ? "..." : metrics.daysOff} 
                  label="Days Off" 
                  icon={XCircleIcon} 
                  gradient="from-purple-500 to-purple-700" 
                />
              </div>

              {/* Working Hours Chart */}
              <ShimmerCard className="h-64 backdrop-blur-sm bg-white/80">
                <WorkingHoursChart hours={isLoadingDashboard ? [0, 0, 0, 0, 0, 0, 0] : dailyHours} />
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
                  {isLoadingDashboard ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse">
                          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </ShimmerCard>

          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showScanner}
        onScan={handleQRScan}
        onClose={() => setShowScanner(false)}
      />

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}