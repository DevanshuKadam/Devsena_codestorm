import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EmployeeAuthProvider } from './contexts/EmployeeAuthContext';

import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeSchedule from './pages/EmployeeSchedule';
import EmployeeLogin from './pages/EmployeeLogin';
import Payroll from './pages/Payroll';
import Profile from './pages/Profile';
import Training from './pages/Training';
import OwnerPayroll from './pages/owner/OwnerPayroll';

// Owner pages
import Onboarding from './pages/owner/Onboarding';
import StaffManagement from './pages/owner/StaffManagement';
import ScheduleDashboard from './pages/owner/ScheduleDashboard';
import BusinessProfile from './pages/owner/BusinessProfile';
import Landing from './pages/owner/Landing';
import Dashboard from './pages/owner/Dashboard';
import Auth from './pages/owner/Auth';
import AuthCallback from './pages/owner/AuthCallback';
import AuthCallbackSimple from './pages/owner/AuthCallbackSimple';
import AuthSuccess from './pages/owner/AuthSuccess';
import AuthError from './pages/owner/AuthError';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';

function App() {
  return (
    <EmployeeAuthProvider>
      <Router>
        <div className="p-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/employee-login" element={<EmployeeLogin />} />
            <Route path="/dashboard" element={<EmployeeDashboard />} />
            <Route path="/schedule" element={<EmployeeSchedule />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/training" element={<Training />} />

          {/* Owner/Admin routes */}
          <Route path="/admin" element={<Landing />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/callback-simple" element={<AuthCallbackSimple />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/auth/error" element={<AuthError />} />
          <Route path="/admin/onboarding" element={<Onboarding />} />
          <Route path="/test-onboarding" element={<Onboarding />} />
          <Route path="/admin/staff-management" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
          <Route path="/admin/schedule-dashboard" element={<ProtectedRoute><ScheduleDashboard /></ProtectedRoute>} />
          <Route path="/admin/business-profile" element={<ProtectedRoute><BusinessProfile /></ProtectedRoute>} />
          <Route path="/admin/payroll" element={<ProtectedRoute><OwnerPayroll /></ProtectedRoute>} />
        
          </Routes>
        </div>
      </Router>
    </EmployeeAuthProvider>
  );
}

export default App;
