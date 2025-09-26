import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeSchedule from './pages/EmployeeSchedule';
import Payroll from './pages/Payroll';
import Profile from './pages/Profile';
import Training from './pages/Training';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default landing page → Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/schedule" element={<EmployeeSchedule />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/training" element={<Training />} />
      </Routes>
    </Router>
  );
}

export default App;
