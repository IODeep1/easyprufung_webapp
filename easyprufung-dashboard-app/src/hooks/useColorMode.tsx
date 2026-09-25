import React, { createContext, useContext, useEffect, useState } from 'react';
import useLocalStorage from "./useLocalStorage";

// Create the context
const ThemeContext = createContext();

// Provider component to wrap your app and provide theme data
export const ThemeProvider = ({ children }) => {
  const [colorMode, setColorMode] = useLocalStorage('color-theme', 'light');

  useEffect(() => {
    const className = 'dark';
    const bodyClass = window.document.body.classList;
    let currentTheme = localStorage.getItem('current_theme');

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && currentTheme === null) {
      localStorage.setItem('current_theme', 'dark');
      setColorMode('dark');
    }

    localStorage.setItem('current_theme', colorMode);
    colorMode === 'dark' ? bodyClass.add(className) : bodyClass.remove(className);
  }, [colorMode]);

  return (
      <ThemeContext.Provider value={{ colorMode, setColorMode }}>
        {children}
      </ThemeContext.Provider>
  );
};

// Custom hook to use the ThemeContext
export const useTheme = () => useContext(ThemeContext);