import React, { useState, useEffect } from 'react';
import OwnerNavbar from '../../components/OwnerNavbar';
import { DollarSign, Clock, Users, Calendar, Download, AlertTriangle, LogOut, CalendarDays } from 'lucide-react';
import ShimmerCard from '../../components/ui/magic/ShimmerCard';
import Particles from '../../components/ui/magic/Particles';
import { Button } from '../../components/ui/button';
import apiService from '../../services/api';

// --- UPDATED MOCK DATA ---
const mockDailyTimeData = [
  { id: 1, name: 'Sarah Johnson', hours: 7.5, rate: 15.00, status: 'Punched In', timeIn: '09:00 AM' },
  { id: 2, name: 'Mike Chen', hours: 4.0, rate: 18.50, status: 'Punched In', timeIn: '08:00 AM' },
  { id: 3, name: 'Alex Lee', hours: 8.0, rate: 16.00, status: 'Punched Out', timeIn: '10:00 AM', timeOut: '06:00 PM' },
  { id: 4, name: 'Rachel Green', hours: 0, rate: 14.00, status: 'Punched Out', timeIn: null, timeOut: null },
];

const totalPunchedIn = mockDailyTimeData.filter(i => i.status === 'Punched In').length;
// Note: Gross pay is a complex calculation; simplified for daily demo
const mockDate = "Friday, Sep 26, 2025"; 

const AnimatedCounter = ({ value, label, icon: Icon, gradient = "from-blue-500 to-indigo-700" }) => (
  <div className="relative group">
    <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  </div>
);


const OwnerPayroll = () => {
  const [currentDay, setCurrentDay] = useState(mockDate);
  const [dailyData, setDailyData] = useState(mockDailyTimeData);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Mock owner and shop data - in real app, this would come from auth context
  const mockOwnerId = 'mock_owner_123';
  const mockShopId = 'mock_shop_456';

  const handlePunchOut = async (employeeId) => {
    try {
      setIsLoading(true);
      setMessage('Processing punch out...');

      const response = await apiService.ownerPunchOut(employeeId, mockOwnerId, mockShopId);
      
      if (response.success) {
        setDailyData(prevData =>
          prevData.map(employee =>
            employee.id === employeeId 
              ? { 
                  ...employee, 
                  status: 'Punched Out', 
                  timeOut: new Date(response.punchRecord.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                  hours: response.punchRecord.workHours || employee.hours
                } 
              : employee
          )
        );
        setMessage(`✅ Successfully punched out ${response.punchRecord.employeeName}`);
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

  // --- Placeholder for Date Fetching (simulate a date picker change) ---
  const handleDateChange = (newDate) => {
    // In a real app, this would fetch new data for the selected date
    setCurrentDay(newDate); 
    console.log(`Fetching data for ${newDate}`);
    // Simulate fetching past data (resetting punch-in status)
    if (newDate !== mockDate) {
        setDailyData(mockDailyTimeData.map(e => ({...e, status: 'Punched Out', hours: e.hours > 0 ? e.hours : 0})));
    } else {
         setDailyData(mockDailyTimeData);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <Particles count={70} />
      <OwnerNavbar />
      
      <div className="relative z-10 pt-24 p-6 max-w-7xl mx-auto">
        
        {/* Header Card */}
        <ShimmerCard className="mb-8 backdrop-blur-xl bg-white/70">
          <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-700 shadow-lg">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent">
                Daily Time Tracking
              </h1>
            </div>
            
            <div className="flex gap-3">
                <Button 
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-green-500 transition-all duration-200 shadow-lg"
                >
                    <Download className="w-5 h-5 mr-2" /> Export Timesheet
                </Button>
            </div>
          </div>
        </ShimmerCard>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 ${message.includes('✅') ? 'bg-green-50 border-green-400 text-green-700' : 'bg-red-50 border-red-400 text-red-700'}`}>
            <p className="font-medium">{message}</p>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AnimatedCounter 
                value={totalPunchedIn} 
                label="Currently Punched In" 
                icon={Users} 
                gradient="from-blue-500 to-blue-700"
            />
            <AnimatedCounter 
                value={`${dailyData.filter(i => i.hours > 0).length}`} 
                label="Staff Worked Today" 
                icon={Clock} 
                gradient="from-indigo-500 to-indigo-700"
            />
            <AnimatedCounter 
                value={`${dailyData.reduce((sum, item) => sum + item.hours, 0).toFixed(1)}h`} 
                label="Total Hours Today" 
                icon={Calendar} 
                gradient="from-green-500 to-green-700"
            />
             <AnimatedCounter 
                value={dailyData.length - totalPunchedIn} 
                label="Punched Out" 
                icon={LogOut} 
                gradient="from-purple-500 to-purple-700"
            />
        </div>

        {/* Daily Timesheet Table */}
        <ShimmerCard className="p-6 backdrop-blur-sm bg-white/80">
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-blue-200 pb-4'>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3 sm:mb-0">Timesheet for {currentDay}</h2>
                
                {/* Date Picker Placeholder */}
                <div className="flex items-center gap-3">
                     <CalendarDays className="w-5 h-5 text-blue-600" />
                     <input
                        type="date"
                        value={currentDay === mockDate ? '2025-09-26' : '2025-09-25'} // Mocking date value
                        onChange={(e) => handleDateChange(e.target.value === '2025-09-26' ? mockDate : "Wednesday, Sep 25, 2025")}
                        className="px-4 py-2 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/70 text-gray-700"
                      />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-200">
                    <thead>
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 bg-blue-50/70">
                            <th className="px-4 py-3">Employee</th>
                            <th className="px-4 py-3 text-right">Time In</th>
                            <th className="px-4 py-3 text-right">Time Out</th>
                            <th className="px-4 py-3 text-right">Hours Worked</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                        {dailyData.map((item) => (
                            <tr key={item.id} className="text-gray-900 hover:bg-blue-50/50 transition">
                                <td className="px-4 py-4 font-medium">{item.name}</td>
                                <td className="px-4 py-4 text-right text-green-700 font-medium">{item.timeIn || '-'}</td>
                                <td className="px-4 py-4 text-right text-red-700 font-medium">{item.timeOut || '-'}</td>
                                <td className="px-4 py-4 text-right font-bold text-indigo-700">{item.hours.toFixed(1)}h</td>
                                <td className="px-4 py-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                        item.status === 'Punched In' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    {item.status === 'Punched In' ? (
                                        <Button 
                                            onClick={() => handlePunchOut(item.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white text-sm"
                                        >
                                            <LogOut className="w-4 h-4 mr-1"/> Punch Out
                                        </Button>
                                    ) : (
                                        <span className="text-gray-400 text-sm">N/A</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ShimmerCard>
      </div>
    </div>
  );
};

export default OwnerPayroll;