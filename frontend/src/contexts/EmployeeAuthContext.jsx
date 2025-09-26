import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const EmployeeAuthContext = createContext();

export const useEmployeeAuth = () => {
  const context = useContext(EmployeeAuthContext);
  if (!context) {
    throw new Error('useEmployeeAuth must be used within an EmployeeAuthProvider');
  }
  return context;
};

export const EmployeeAuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      const savedEmployee = localStorage.getItem('employee');
      if (savedEmployee) {
        try {
          const employeeData = JSON.parse(savedEmployee);
          setEmployee(employeeData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing saved employee data:', error);
          localStorage.removeItem('employee');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (employeeId, password) => {
    try {
      setIsLoading(true);
      
      const response = await apiService.authenticateEmployee(employeeId, password);
      
      if (response.success) {
        setEmployee(response.employee);
        setIsAuthenticated(true);
        localStorage.setItem('employee', JSON.stringify(response.employee));
        return { success: true };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Login failed. Please check your credentials.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setEmployee(null);
    setIsAuthenticated(false);
    localStorage.removeItem('employee');
  };

  const value = {
    employee,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <EmployeeAuthContext.Provider value={value}>
      {children}
    </EmployeeAuthContext.Provider>
  );
};
