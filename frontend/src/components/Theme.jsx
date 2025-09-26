import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children, role }) => {
  const [isDark, setIsDark] = useState(false);

  const themes = {
    light: {
      background: '#ffffff',
      card: '#f8f9fa',
      text: '#333333',
      primary: role === 'manager' ? '#FF9800' : '#42A5F5',
      secondary: '#6c757d',
      border: '#dee2e6',
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8'
    },
    dark: {
      background: '#1a1a1a',
      card: '#2d2d2d',
      text: '#ffffff',
      primary: role === 'manager' ? '#FFB74D' : '#64B5F6',
      secondary: '#adb5bd',
      border: '#495057',
      success: '#4caf50',
      warning: '#ff9800',
      danger: '#f44336',
      info: '#2196f3'
    }
  };

  const currentTheme = isDark ? themes.dark : themes.light;

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ ...currentTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
