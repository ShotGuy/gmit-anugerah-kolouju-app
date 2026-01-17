import React from 'react';
import { Sun, Moon } from 'lucide-react';

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme, isLoaded } = useTheme();

  if (!isLoaded) {
    return (
      <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse ${className}`} />
    );
  }

  return (
    <button
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative inline-flex items-center justify-center w-10 h-10
        rounded-lg transition-all duration-300 ease-in-out
        bg-gray-100 hover:bg-gray-200 active:scale-95
        dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-600 dark:text-gray-300
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
        shadow-sm hover:shadow-md
        ${className}
      `}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-500 ease-in-out
            ${isDark ? 'scale-0 rotate-180 opacity-0' : 'scale-100 rotate-0 opacity-100'}
          `}
        />
        <Moon
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-500 ease-in-out
            ${isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-180 opacity-0'}
          `}
        />
      </div>
    </button>
  );
}