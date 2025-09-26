import './App.css'
import { Button } from './components/ui/button';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// import pages
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeSchedule from './pages/EmployeeSchedule';
import Payroll from './pages/Payroll';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="p-6">
        <h1 className="underline">helloooo</h1>
        <Button variant="destructive">click</Button>

        <Routes>
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/schedule" element={<EmployeeSchedule />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
