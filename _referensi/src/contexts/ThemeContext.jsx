import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Prevent flash of unstyled content by immediately applying the theme
    const applyInitialTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      let isDarkMode = false;

      if (savedTheme) {
        isDarkMode = savedTheme === 'dark';
      } else {
        isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      setIsDark(isDarkMode);
    };

    applyInitialTheme();
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      // Apply theme to document with smooth transition
      document.documentElement.style.setProperty('--theme-transition', '0.3s ease');

      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, [isDark, isLoaded]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const setTheme = (theme) => {
    setIsDark(theme === 'dark');
  };

  const value = {
    isDark,
    theme: isDark ? 'dark' : 'light',
    toggleTheme,
    setTheme,
    isLoaded
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};