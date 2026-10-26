   import { createContext, useContext, useEffect, useState } from "react";

   const ThemeContext = createContext(null);
   const STORAGE_KEY = "scribwave-theme";

   const getInitialTheme = () => {
     try {
       const saved = localStorage.getItem(STORAGE_KEY);
       if (saved === "light" || saved === "dark") return saved;
     } catch {
       // storage not available: fall through
     }
     return window.matchMedia("(prefers-color-scheme: dark)").matches
       ? "dark"
       : "light";
   };

   export function ThemeProvider({ children }) {
     const [theme, setTheme] = useState(getInitialTheme);

     // Add or remove the "dark" class on <html> and remember the choice
     useEffect(() => {
       document.documentElement.classList.toggle("dark", theme === "dark");
       try {
         localStorage.setItem(STORAGE_KEY, theme);
       } catch {
         // ignore
       }
     }, [theme]);

     const toggleTheme = () =>
       setTheme((current) => (current === "dark" ? "light" : "dark"));

     return (
       <ThemeContext.Provider value={{ theme, toggleTheme }}>
         {children}
       </ThemeContext.Provider>
     );
   }

   export const useTheme = () => useContext(ThemeContext);