// src/App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import nalawadeSocket from "./lib/nalawadeSocket";

import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import ChatPage from './pages/ChatPage';

import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeSchedule from './pages/EmployeeSchedule';
import Payroll from './pages/Payroll';
import Profile from './pages/Profile';
import Training from './pages/Training';

// Owner pages
import Onboarding from './pages/owner/Onboarding';
import StaffManagement from './pages/owner/StaffManagement';
import ScheduleDashboard from './pages/owner/ScheduleDashboard';
import BusinessProfile from './pages/owner/BusinessProfile';
import Landing from './pages/owner/Landing';
import Dashboard from './pages/owner/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/landing" element={<Landing />} />

        {/* Employee routes */}
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/schedule" element={<EmployeeSchedule />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/training" element={<Training />} />
        <Route path="/chat" element={<ChatPage role="employee" />} />

        {/* Owner/Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/chat"
          element={
            <ProtectedRoute>
              <ChatPage role="manager" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
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

        {/* Components (if you want direct routes for testing, optional) */}
        <Route path="/chat-list" element={<ChatList users={[]} onSelect={() => {}} selected={null} />} />
        <Route path="/chat-window" element={<ChatWindow me="test" other="other" socket={nalawadeSocket} />} />
      </Routes>
    </Router>
  );
}

export default App;
