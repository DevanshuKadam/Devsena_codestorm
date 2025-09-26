import React from "react";
import Navbar from "../components/Navbar";
import Particles from '../components/ui/magic/Particles'; 

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

// Magic UI Shimmer Card Component
const ShimmerCard = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden bg-white rounded-2xl border border-gray-200/50 shadow-sm ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    {children}
  </div>
);

export default function Payroll() {
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent">
                    Your Payroll & Earnings
                  </h1>
                  <p className="text-gray-600 mt-1">Track your compensation and payment history</p>
                </div>
              </div>
            </div>
          </ShimmerCard>

          {/* Payroll Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            
            {/* Card 1: Hourly Rate */}
            <ShimmerCard className="backdrop-blur-sm bg-white/80 border-b-4 border-blue-500">
              <div className="p-6">
                <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
                <p className="text-4xl font-extrabold text-blue-700 mt-1">
                  ${employeeInfo.hourlyRate.toFixed(2)}
                </p>
              </div>
            </ShimmerCard>

            {/* Card 2: Next Pay Date */}
            <ShimmerCard className="backdrop-blur-sm bg-white/80 border-b-4 border-indigo-500">
              <div className="p-6">
                <p className="text-sm font-medium text-gray-500">Next Pay Date</p>
                <p className="text-2xl font-extrabold text-indigo-700 mt-2 leading-tight">
                  {employeeInfo.nextPayDate}
                </p>
                <p className="text-xs text-gray-400 mt-1">Bi-weekly cycle</p>
              </div>
            </ShimmerCard>

            {/* Card 3: Year-to-Date Earnings */}
            <ShimmerCard className="backdrop-blur-sm bg-white/80 border-b-4 border-purple-500">
              <div className="p-6">
                <p className="text-sm font-medium text-gray-500">YTD Earnings</p>
                <p className="text-4xl font-extrabold text-purple-700 mt-1">
                  ${employeeInfo.ytdEarnings.toFixed(2)}
                </p>
              </div>
            </ShimmerCard>
          </div>

          {/* Detailed Pay History Table */}
          <ShimmerCard className="backdrop-blur-sm bg-white/80">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Payment History</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-blue-50 text-blue-800 font-semibold text-sm uppercase tracking-wider">
                      <th className="px-4 py-3 text-left rounded-tl-lg">Pay Period</th>
                      <th className="px-4 py-3 text-right">Hours Worked</th>
                      <th className="px-4 py-3 text-right">Gross Pay</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-left rounded-tr-lg">Paid On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payHistory.map((item, index) => (
                      <tr key={index} className="hover:bg-blue-50 transition duration-150">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.period}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-700">
                          {item.hours.toFixed(1)} hrs
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-base text-right font-bold text-blue-800">
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
          </ShimmerCard>
          
          {/* Payroll Note */}
          <ShimmerCard className="mt-8 backdrop-blur-sm bg-white/80">
            <div className="text-center p-4 text-sm text-gray-700">
              <p>For detailed breakdown, deductions, or tax information, please contact the shop owner.</p>
            </div>
          </ShimmerCard>
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
