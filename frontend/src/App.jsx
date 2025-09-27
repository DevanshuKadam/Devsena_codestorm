import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';



import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeSchedule from './pages/EmployeeSchedule';
import Payroll from './pages/Payroll';
import Profile from './pages/Profile';
import Training from './pages/Training';
import EmployeeLogin from './pages/EmployeeLogin';

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
import EmployeeProtectedRoute from './components/EmployeeProtectedRoute';
import Home from './pages/Home';

function App() {
  return (
    <Router>


      <div className="p-0">

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />
          
          {/* Employee Protected Routes */}
          <Route path="/employee/dashboard" element={<EmployeeProtectedRoute><EmployeeDashboard /></EmployeeProtectedRoute>} />
          <Route path="/employee/schedule" element={<EmployeeProtectedRoute><EmployeeSchedule /></EmployeeProtectedRoute>} />
          <Route path="/employee/payroll" element={<EmployeeProtectedRoute><Payroll /></EmployeeProtectedRoute>} />
          <Route path="/employee/profile" element={<EmployeeProtectedRoute><Profile /></EmployeeProtectedRoute>} />
          <Route path="/employee/training" element={<EmployeeProtectedRoute><Training /></EmployeeProtectedRoute>} />
          
          {/* Legacy employee routes - redirect to new paths */}
          <Route path="/dashboard" element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="/schedule" element={<Navigate to="/employee/schedule" replace />} />
          <Route path="/payroll" element={<Navigate to="/employee/payroll" replace />} />
          <Route path="/profile" element={<Navigate to="/employee/profile" replace />} />
          <Route path="/training" element={<Navigate to="/employee/training" replace />} />

          {/* Owner/Admin routes */}
          <Route path="/admin" element={<Landing />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
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
        
        </Routes>
      </div>

    </Router>
  );
}

export default App;
