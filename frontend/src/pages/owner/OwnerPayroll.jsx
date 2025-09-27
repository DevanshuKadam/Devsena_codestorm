import React, { useState, useEffect } from 'react';
import OwnerNavbar from '../../components/OwnerNavbar';
import { DollarSign, Clock, Users, Calendar, Download, AlertTriangle, LogOut, CalendarDays, FileText, IndianRupee } from 'lucide-react';
import { Button } from '../../components/ui/button';

// Indian employee mock data with rupee rates
const mockDailyTimeData = [
  { id: 1, name: 'Priya Sharma', hours: 7.5, rate: 180.00, status: 'Punched In', timeIn: '09:00 AM', department: 'Cashier', employeeId: 'EMP001' },
  { id: 2, name: 'Rajesh Kumar', hours: 4.0, rate: 220.50, status: 'Punched In', timeIn: '08:00 AM', department: 'Stock Manager', employeeId: 'EMP002' },
  { id: 3, name: 'Ananya Singh', hours: 8.0, rate: 200.00, status: 'Punched Out', timeIn: '10:00 AM', timeOut: '06:00 PM', department: 'Sales Associate', employeeId: 'EMP003' },
  { id: 4, name: 'Vikram Gupta', hours: 6.5, rate: 175.00, status: 'Punched Out', timeIn: '11:00 AM', timeOut: '05:30 PM', department: 'Helper', employeeId: 'EMP004' },
  { id: 5, name: 'Sneha Patel', hours: 0, rate: 165.00, status: 'Punched Out', timeIn: null, timeOut: null, department: 'Cleaner', employeeId: 'EMP005' },
  { id: 6, name: 'Arjun Reddy', hours: 9.0, rate: 250.00, status: 'Punched Out', timeIn: '08:30 AM', timeOut: '05:30 PM', department: 'Supervisor', employeeId: 'EMP006' },
];

const totalPunchedIn = mockDailyTimeData.filter(i => i.status === 'Punched In').length;
const mockDate = "Friday, Dec 27, 2024";
const shopDetails = {
  name: "Sharma General Store",
  address: "123, MG Road, Connaught Place, New Delhi - 110001",
  phone: "+91 98765 43210",
  gst: "07AAAAA0000A1Z5"
};

const SimpleCard = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

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

  const handlePunchOut = (employeeId) => {
    setIsLoading(true);
    setMessage('Processing punch out...');

    // Simulate API delay
    setTimeout(() => {
      const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      setDailyData(prevData =>
        prevData.map(employee =>
          employee.id === employeeId 
            ? { 
                ...employee, 
                status: 'Punched Out', 
                timeOut: currentTime,
                hours: employee.timeIn ? 8.0 : employee.hours // Default 8 hours if punching out
              } 
            : employee
        )
      );

      const employeeName = dailyData.find(emp => emp.id === employeeId)?.name;
      setMessage(`✅ Successfully punched out ${employeeName}`);
      setIsLoading(false);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;
    const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    setCurrentDay(formattedDate);
    
    // Reset data for different dates (simulate past data)
    if (selectedDate !== '2024-12-27') {
      setDailyData(mockDailyTimeData.map(e => ({
        ...e, 
        status: 'Punched Out', 
        timeOut: e.hours > 0 ? '06:00 PM' : null,
        hours: e.hours > 0 ? e.hours : Math.floor(Math.random() * 8) + 1
      })));
    } else {
      setDailyData(mockDailyTimeData);
    }
  };

  const exportTimesheet = () => {
    const totalHours = dailyData.reduce((sum, emp) => sum + emp.hours, 0);
    const totalGrossPay = dailyData.reduce((sum, emp) => sum + (emp.hours * emp.rate), 0);
    
    // Create CSV content
    const csvHeader = [
      'Employee ID',
      'Employee Name',
      'Department',
      'Time In',
      'Time Out',
      'Hours Worked',
      'Hourly Rate (₹)',
      'Gross Pay (₹)',
      'Status'
    ].join(',');

    const csvRows = dailyData.map(emp => [
      emp.employeeId,
      `"${emp.name}"`,
      emp.department,
      emp.timeIn || 'N/A',
      emp.timeOut || 'N/A',
      emp.hours.toFixed(1),
      emp.rate.toFixed(2),
      (emp.hours * emp.rate).toFixed(2),
      emp.status
    ].join(','));

    const csvContent = [
      `"${shopDetails.name} - Daily Timesheet"`,
      `"Date: ${currentDay}"`,
      `"Address: ${shopDetails.address}"`,
      `"Phone: ${shopDetails.phone}"`,
      `"GST: ${shopDetails.gst}"`,
      '',
      csvHeader,
      ...csvRows,
      '',
      `"Total Employees","${dailyData.length}"`,
      `"Total Hours Worked","${totalHours.toFixed(1)}"`,
      `"Total Gross Pay","₹${totalGrossPay.toFixed(2)}"`,
      `"Currently Punched In","${totalPunchedIn}"`,
      `"Report Generated","${new Date().toLocaleString('en-IN')}"`
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `timesheet-${currentDay.replace(/,|\s/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMessage('✅ Timesheet exported successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const exportDetailedPayroll = () => {
    const totalHours = dailyData.reduce((sum, emp) => sum + emp.hours, 0);
    const totalGrossPay = dailyData.reduce((sum, emp) => sum + (emp.hours * emp.rate), 0);
    
    // Create detailed HTML content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${shopDetails.name} - Detailed Payroll Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .company-info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .amount { text-align: right; font-weight: bold; }
        .summary { margin-top: 30px; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; }
        .total-row { background-color: #e8f4fd; font-weight: bold; }
        .status-active { color: #28a745; font-weight: bold; }
        .status-out { color: #dc3545; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${shopDetails.name}</h1>
        <h2>Detailed Payroll Report</h2>
        <p><strong>Date:</strong> ${currentDay}</p>
    </div>
    
    <div class="company-info">
        <p><strong>Address:</strong> ${shopDetails.address}</p>
        <p><strong>Phone:</strong> ${shopDetails.phone}</p>
        <p><strong>GST No:</strong> ${shopDetails.gst}</p>
        <p><strong>Report Generated:</strong> ${new Date().toLocaleString('en-IN')}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Hours</th>
                <th>Rate (₹/hr)</th>
                <th>Gross Pay (₹)</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${dailyData.map(emp => `
                <tr>
                    <td>${emp.employeeId}</td>
                    <td>${emp.name}</td>
                    <td>${emp.department}</td>
                    <td>${emp.timeIn || 'N/A'}</td>
                    <td>${emp.timeOut || 'N/A'}</td>
                    <td class="amount">${emp.hours.toFixed(1)}</td>
                    <td class="amount">₹${emp.rate.toFixed(2)}</td>
                    <td class="amount">₹${(emp.hours * emp.rate).toFixed(2)}</td>
                    <td class="${emp.status === 'Punched In' ? 'status-active' : 'status-out'}">${emp.status}</td>
                </tr>
            `).join('')}
            <tr class="total-row">
                <td colspan="5"><strong>TOTALS</strong></td>
                <td class="amount"><strong>${totalHours.toFixed(1)}</strong></td>
                <td></td>
                <td class="amount"><strong>₹${totalGrossPay.toFixed(2)}</strong></td>
                <td></td>
            </tr>
        </tbody>
    </table>

    <div class="summary">
        <h3>Daily Summary</h3>
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
            <div>
                <p><strong>Total Employees:</strong> ${dailyData.length}</p>
                <p><strong>Currently Punched In:</strong> ${totalPunchedIn}</p>
                <p><strong>Punched Out:</strong> ${dailyData.length - totalPunchedIn}</p>
            </div>
            <div>
                <p><strong>Total Hours Worked:</strong> ${totalHours.toFixed(1)} hours</p>
                <p><strong>Average Hours per Employee:</strong> ${(totalHours / dailyData.length).toFixed(1)} hours</p>
                <p><strong>Total Daily Payroll:</strong> ₹${totalGrossPay.toFixed(2)}</p>
            </div>
        </div>
    </div>

    <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
        <p>This is an automated report generated by ${shopDetails.name} Payroll System</p>
    </div>
</body>
</html>`;

    // Create and download HTML file
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `detailed-payroll-${currentDay.replace(/,|\s/g, '-')}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMessage('✅ Detailed payroll report exported successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  // Calculate totals
  const totalHours = dailyData.reduce((sum, emp) => sum + emp.hours, 0);
  const totalGrossPay = dailyData.reduce((sum, emp) => sum + (emp.hours * emp.rate), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <OwnerNavbar />
      
      <div className="pt-24 p-6 max-w-7xl mx-auto">
        
        {/* Header Card */}
        <SimpleCard className="mb-8 bg-white/90">
          <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 shadow-lg">
                <IndianRupee className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Daily Time Tracking
                </h1>
                <p className="text-gray-600">{shopDetails.name}</p>
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <Button 
                onClick={exportTimesheet}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-green-500 transition-all duration-200 shadow-lg"
              >
                <Download className="w-5 h-5 mr-2" /> Export CSV
              </Button>
              <Button 
                onClick={exportDetailedPayroll}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-500 transition-all duration-200 shadow-lg"
              >
                <FileText className="w-5 h-5 mr-2" /> Detailed Report
              </Button>
            </div>
          </div>
        </SimpleCard>

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
            gradient="from-green-500 to-green-700"
          />
          <AnimatedCounter 
            value={`${dailyData.filter(i => i.hours > 0).length}`} 
            label="Staff Worked Today" 
            icon={Clock} 
            gradient="from-blue-500 to-blue-700"
          />
          <AnimatedCounter 
            value={`${totalHours.toFixed(1)}h`} 
            label="Total Hours Today" 
            icon={Calendar} 
            gradient="from-indigo-500 to-indigo-700"
          />
          <AnimatedCounter 
            value={`₹${totalGrossPay.toLocaleString('en-IN')}`} 
            label="Total Gross Pay" 
            icon={IndianRupee} 
            gradient="from-orange-500 to-red-600"
          />
        </div>

        {/* Daily Timesheet Table */}
        <SimpleCard className="p-6 bg-white/90">
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-blue-200 pb-4'>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 sm:mb-0">Timesheet for {currentDay}</h2>
            
            {/* Date Picker */}
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <input
                type="date"
                value="2024-12-27"
                onChange={handleDateChange}
                className="px-4 py-2 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-200">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 bg-blue-50">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3 text-right">Time In</th>
                  <th className="px-4 py-3 text-right">Time Out</th>
                  <th className="px-4 py-3 text-right">Hours</th>
                  <th className="px-4 py-3 text-right">Rate (₹/hr)</th>
                  <th className="px-4 py-3 text-right">Gross Pay (₹)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {dailyData.map((item) => (
                  <tr key={item.id} className="text-gray-900 hover:bg-blue-50 transition">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.employeeId}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{item.department}</td>
                    <td className="px-4 py-4 text-right text-green-700 font-medium">{item.timeIn || '-'}</td>
                    <td className="px-4 py-4 text-right text-red-700 font-medium">{item.timeOut || '-'}</td>
                    <td className="px-4 py-4 text-right font-bold text-indigo-700">{item.hours.toFixed(1)}h</td>
                    <td className="px-4 py-4 text-right font-medium">₹{item.rate.toFixed(2)}</td>
                    <td className="px-4 py-4 text-right font-bold text-orange-600">₹{(item.hours * item.rate).toFixed(2)}</td>
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
                          disabled={isLoading}
                          className="bg-red-500 hover:bg-red-600 text-white text-sm disabled:opacity-50"
                        >
                          <LogOut className="w-4 h-4 mr-1"/> 
                          {isLoading ? 'Processing...' : 'Punch Out'}
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-blue-50 font-semibold">
                  <td className="px-4 py-4" colSpan="4"><strong>TOTALS</strong></td>
                  <td className="px-4 py-4 text-right"><strong>{totalHours.toFixed(1)}h</strong></td>
                  <td className="px-4 py-4"></td>
                  <td className="px-4 py-4 text-right text-orange-600"><strong>₹{totalGrossPay.toFixed(2)}</strong></td>
                  <td className="px-4 py-4"></td>
                  <td className="px-4 py-4"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </SimpleCard>
      </div>
    </div>
  );
};

export default OwnerPayroll;