import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Particles from '../components/ui/magic/Particles';
import QRScanner from '../components/QRScanner';
import apiService from '../services/api';
import { Camera, DollarSign, Clock, Calendar, AlertTriangle, LogOut, LogIn, CheckCircle, XCircle } from 'lucide-react';

// --- DUMMY DATA ---
const employeeInfo = {
  hourlyRate: 18.50,
  ytdEarnings: 6895.75,
  nextPayDate: "November 1, 2024",
};

// --- STATE MOCKUP ---
const mockInitialTimeStatus = {
  isPunchedIn: false,
  punchInTime: null,
  currentShiftHours: 0.0,
};

// Helper function to render status pill
const getStatusClasses = (status) => {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'Pending':
      // Updated Pending status to blue/indigo for consistency
      return 'bg-indigo-100 text-indigo-700 border-indigo-300 animate-pulse'; 
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

// Magic UI Shimmer Card Component (Using updated consistent styling)
const ShimmerCard = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden bg-white rounded-2xl border border-blue-200/50 shadow-sm ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    {children}
  </div>
);

export default function TimeClockAndEarnings() {
  const [employee, setEmployee] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeStatus, setTimeStatus] = useState(mockInitialTimeStatus);
  const [showScanner, setShowScanner] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [punchRecords, setPunchRecords] = useState([]);

  // Check authentication and load employee data
  useEffect(() => {
    const employeeData = localStorage.getItem('employeeData');
    if (employeeData) {
      try {
        const parsedEmployeeData = JSON.parse(employeeData);
        setEmployee(parsedEmployeeData);
        setIsAuthenticated(true);
        checkTodayPunchStatus(parsedEmployeeData);
        loadPunchRecords(parsedEmployeeData);
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

  const loadPunchRecords = async (employeeData = employee) => {
    if (!employeeData) return;
    
    try {
      const response = await apiService.getEmployeePunchRecords(employeeData.employeeId, null, null, 20);
      if (response.success) {
        setPunchRecords(response.punchRecords);
      }
    } catch (error) {
      console.error('Error loading punch records:', error);
    }
  };

  // --- FUNCTIONALITY FOR PUNCH IN/OUT ---

  const handleQRScan = async (qrToken) => {
    if (!isAuthenticated || !employee) {
      setMessage('❌ Please log in first');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('Processing QR code...');

      // Note: In a real app, you'd need to securely store and pass the password
      // For now, we'll use a mock password since we don't store it in the context
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
        loadPunchRecords(); // Refresh punch records
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
        loadPunchRecords(); // Refresh punch records
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <Navbar />
      <Particles count={50} />
      
      <div className="relative z-10 pt-24 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Card with Time Clock Action */}
          <ShimmerCard className="mb-8 backdrop-blur-xl bg-white/70">
            <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-700 shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent">
                    Time Clock & Earnings
                  </h1>
                  <p className="text-gray-600 mt-1">Punch in/out and view your current status</p>
                </div>
              </div>

              {/* PUNCH IN / PUNCH OUT BUTTON */}
              <button
                onClick={handleAction}
                disabled={isLoading || showScanner}
                className={`group px-8 py-3 rounded-full text-white font-extrabold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait 
                  ${timeStatus.isPunchedIn 
                    ? 'bg-gradient-to-r from-red-500 to-red-700' 
                    : 'bg-gradient-to-r from-green-500 to-green-700'
                  }`}
              >
                <div className="flex items-center gap-2">
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
                </div>
              </button>
            </div>
            
            {/* Status Message Display */}
            {message && (
              <div className={`mt-4 p-3 rounded-xl border-l-4 ${timeStatus.isPunchedIn ? 'bg-green-50 border-green-400 text-green-700' : 'bg-blue-50 border-blue-400 text-blue-700'}`}>
                <p className="font-medium">{message}</p>
              </div>
            )}
            
          </ShimmerCard>

          {/* Payroll Summary Cards - Reconfigured for Time Clock Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            
            {/* Card 1: Current Status */}
            <ShimmerCard className="backdrop-blur-sm bg-white/80 border-b-4 border-indigo-500 md:col-span-2">
              <div className="p-6">
                <p className="text-sm font-medium text-gray-500">Current Status</p>
                <div className="flex items-center justify-between">
                  <p className={`text-4xl font-extrabold mt-1 ${timeStatus.isPunchedIn ? 'text-green-600' : 'text-red-600'}`}>
                    {timeStatus.isPunchedIn ? 'PUNCHED IN' : 'PUNCHED OUT'}
                  </p>
                  <div className={`p-2 rounded-full ${timeStatus.isPunchedIn ? 'bg-green-200' : 'bg-red-200'}`}>
                    {timeStatus.isPunchedIn 
                      ? <LogIn className="w-6 h-6 text-green-700" /> 
                      : <LogOut className="w-6 h-6 text-red-700" />}
                  </div>
                </div>
                {timeStatus.isPunchedIn && (
                  <p className="text-sm text-gray-600 mt-2">Since: <span className="font-mono font-semibold text-gray-800">{timeStatus.punchInTime}</span></p>
                )}
                {!timeStatus.isPunchedIn && timeStatus.punchInTime && (
                  <p className="text-sm text-gray-600 mt-2">Last Punched In: <span className="font-mono font-semibold text-gray-800">{timeStatus.punchInTime}</span></p>
                )}
              </div>
            </ShimmerCard>

            {/* Card 2: Hourly Rate */}
            <ShimmerCard className="backdrop-blur-sm bg-white/80 border-b-4 border-blue-500">
              <div className="p-6">
                <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
                <p className="text-3xl font-extrabold text-blue-700 mt-1">
                  ${employeeInfo.hourlyRate.toFixed(2)}
                </p>
              </div>
            </ShimmerCard>

            {/* Card 3: Next Pay Date */}
            <ShimmerCard className="backdrop-blur-sm bg-white/80 border-b-4 border-purple-500">
              <div className="p-6">
                <p className="text-sm font-medium text-gray-500">Next Pay Date</p>
                <p className="text-2xl font-extrabold text-purple-700 mt-2 leading-tight">
                  {employeeInfo.nextPayDate}
                </p>
              </div>
            </ShimmerCard>
            
          </div>

          {/* Detailed Earnings Summary */}
          <ShimmerCard className="backdrop-blur-xl bg-white/70">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Year-to-Date Earnings Summary</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                
                {/* YTD Earnings */}
                <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200">
                    <p className="text-sm font-medium text-gray-600">YTD Gross Earnings</p>
                    <p className="text-3xl font-extrabold text-blue-800 mt-1">
                        ${employeeInfo.ytdEarnings.toFixed(2)}
                    </p>
                </div>

                {/* Current Shift Hours */}
                <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200">
                    <p className="text-sm font-medium text-gray-600">Current Shift Hours</p>
                    <p className="text-3xl font-extrabold text-indigo-800 mt-1">
                        {timeStatus.isPunchedIn ? '...' : timeStatus.currentShiftHours} hrs
                    </p>
                </div>
                
                {/* Estimated Weekly Pay */}
                <div className="p-4 bg-green-50/70 rounded-xl border border-green-200">
                    <p className="text-sm font-medium text-gray-600">Estimated Pay Period Hours</p>
                    <p className="text-3xl font-extrabold text-green-800 mt-1">
                        {/* Placeholder estimate */}
                        ~80 hrs
                    </p>
                </div>
              </div>
            </div>
          </ShimmerCard>

          {/* Punch Records History */}
          {punchRecords.length > 0 && (
            <ShimmerCard className="backdrop-blur-xl bg-white/70">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Punch Records
                </h3>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {punchRecords.slice(0, 10).map((record, index) => (
                    <div 
                      key={record.id || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        {record.punchType === 'punchin' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {record.punchType === 'punchin' ? 'Punched In' : 'Punched Out'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(record.timestamp).toLocaleDateString()} at {new Date(record.timestamp).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{record.location}</p>
                        {record.workHours && (
                          <p className="text-sm font-semibold text-blue-600">
                            {record.workHours}h worked
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ShimmerCard>
          )}
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