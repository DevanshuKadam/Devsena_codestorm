import React from 'react';
import { Navigate } from 'react-router-dom';

const EmployeeProtectedRoute = ({ children }) => {
  // Check if employee data exists in localStorage
  const employeeData = localStorage.getItem('employeeData');
  
  if (!employeeData) {
    // No employee data found, redirect to employee login
    console.log('EmployeeProtectedRoute: No employee data found, redirecting to login');
    return <Navigate to="/employee-login" replace />;
  }

  try {
    const parsedEmployeeData = JSON.parse(employeeData);
    
    // Check if the employee data has required fields
    if (!parsedEmployeeData.employeeId || !parsedEmployeeData.email) {
      console.log('EmployeeProtectedRoute: Invalid employee data structure, redirecting to login');
      localStorage.removeItem('employeeData');
      return <Navigate to="/employee-login" replace />;
    }

    console.log('EmployeeProtectedRoute: Employee authenticated, allowing access');
    return children;
  } catch (error) {
    console.error('EmployeeProtectedRoute: Error parsing employee data:', error);
    localStorage.removeItem('employeeData');
    return <Navigate to="/employee-login" replace />;
  }
};

export default EmployeeProtectedRoute;
