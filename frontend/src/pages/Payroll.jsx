import React from "react";
// Corrected import name from SideBar to Navbar for consistency
import Navbar from "../components/Navbar"; 

// --- DUMMY DATA FOR PAYROLL ---
const employeeInfo = {
  hourlyRate: 18.50, // Example hourly rate
  ytdEarnings: 6895.75, // Year-to-Date Earnings
  nextPayDate: "November 1, 2024",
};

const payHistory = [
  { period: "Oct 16 - Oct 31, 2024", hours: 52.5, rate: 18.50, grossPay: 971.25, status: "Pending", datePaid: "Nov 1" },
  { period: "Oct 1 - Oct 15, 2024", hours: 45, rate: 18.50, grossPay: 832.50, status: "Paid", datePaid: "Oct 16" },
  { period: "Sep 16 - Sep 30, 2024", hours: 48.5, rate: 18.50, grossPay: 897.25, status: "Paid", datePaid: "Oct 1" },
  { period: "Sep 1 - Sep 15, 2024", hours: 39, rate: 18.50, grossPay: 721.50, status: "Paid", datePaid: "Sep 16" },
];

// Helper function to render status pill
const getStatusClasses = (status) => {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'Pending':
      return 'bg-twine-100 text-twine-700 border-twine-300 animate-pulse';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

export default function Payroll() {
  return (
    // Use twine-100 background for consistency
    <div className="min-h-screen flex flex-col bg-twine-100 font-['Inter']">
      <Navbar />
      <div className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
        <h2 className="text-3xl font-extrabold text-twine-900 mb-8 pt-4">Your Payroll & Earnings</h2>

        {/* Payroll Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Card 1: Hourly Rate */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-twine-500">
            <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
            <p className="text-4xl font-extrabold text-twine-700 mt-1">
              ${employeeInfo.hourlyRate.toFixed(2)}
            </p>
          </div>

          {/* Card 2: Next Pay Date */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-twine-500">
            <p className="text-sm font-medium text-gray-500">Next Pay Date</p>
            <p className="text-2xl font-extrabold text-twine-700 mt-2 leading-tight">
              {employeeInfo.nextPayDate}
            </p>
            <p className="text-xs text-gray-400 mt-1">Bi-weekly cycle</p>
          </div>

          {/* Card 3: Year-to-Date Earnings */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-twine-500">
            <p className="text-sm font-medium text-gray-500">YTD Earnings</p>
            <p className="text-4xl font-extrabold text-twine-700 mt-1">
              ${employeeInfo.ytdEarnings.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Detailed Pay History Table */}
        <div className="bg-white p-6 rounded-xl shadow-2xl border border-twine-200">
            <h3 className="text-xl font-bold text-twine-800 mb-4 pb-2 border-b border-twine-200">Payment History</h3>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-twine-200">
                    <thead>
                        <tr className="bg-twine-50 text-twine-800 font-semibold text-sm uppercase tracking-wider">
                            <th className="px-4 py-3 text-left rounded-tl-lg">Pay Period</th>
                            <th className="px-4 py-3 text-right">Hours Worked</th>
                            <th className="px-4 py-3 text-right">Gross Pay</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-left rounded-tr-lg">Paid On</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-twine-100">
                        {payHistory.map((item, index) => (
                            <tr key={index} className="hover:bg-twine-50 transition duration-150">
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-twine-900">
                                    {item.period}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-700">
                                    {item.hours.toFixed(1)} hrs
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-base text-right font-bold text-twine-800">
                                    ${item.grossPay.toFixed(2)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStatusClasses(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.status === 'Paid' ? item.datePaid : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        
        {/* Payroll Note */}
        <div className="mt-8 text-center p-4 text-sm text-twine-700 bg-twine-50 rounded-xl border border-twine-300 shadow-inner">
            <p>For detailed breakdown, deductions, or tax information, please contact the shop owner.</p>
        </div>
      </div>
    </div>
  );
}
