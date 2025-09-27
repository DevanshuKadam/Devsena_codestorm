// src/App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Employee pages
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeSchedule from './pages/EmployeeSchedule';
import Payroll from './pages/Payroll';
import Profile from './pages/Profile';
import Training from './pages/Training';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeChat from './pages/EmployeeChat';

// Owner/Admin pages
import Onboarding from './pages/owner/Onboarding';
import StaffManagement from './pages/owner/StaffManagement';
import ScheduleDashboard from './pages/owner/ScheduleDashboard';
import BusinessProfile from './pages/owner/BusinessProfile';
import Landing from './pages/owner/Landing';
import Dashboard from './pages/owner/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ManagerChat from './pages/ManagerChat';

// Auth-related pages
import Auth from './pages/owner/Auth';
import AuthCallback from './pages/owner/AuthCallback';
import AuthCallbackSimple from './pages/owner/AuthCallbackSimple';
import AuthSuccess from './pages/owner/AuthSuccess';
import AuthError from './pages/owner/AuthError';

function App() {
  return (
    <Router>
      <div className="p-0">
        <Routes>
          {/* General */}
          <Route path="/" element={<Home />} />

          {/* Employee routes */}
          <Route path="/employee-login" element={<EmployeeLogin />} />
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/schedule" element={<EmployeeSchedule />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/training" element={<Training />} />
          <Route path="/chat" element={<EmployeeChat />} />

          {/* Owner/Admin routes */}
          <Route path="/admin" element={<Landing />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/auth" element={<Auth />} />
          <Route path="/admin/chat" element={<ManagerChat />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/callback-simple" element={<AuthCallbackSimple />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/auth/error" element={<AuthError />} />
          <Route path="/admin/onboarding" element={<Onboarding />} />
          <Route path="/test-onboarding" element={<Onboarding />} />
          <Route
            path="/admin/staff-management"
            element={
              <ProtectedRoute>
                <StaffManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schedule-dashboard"
            element={
              <ProtectedRoute>
                <ScheduleDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/business-profile"
            element={
              <ProtectedRoute>
                <BusinessProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
