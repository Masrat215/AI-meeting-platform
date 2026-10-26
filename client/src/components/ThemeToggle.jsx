   import { Moon, Sun } from "lucide-react";
   import { motion } from "motion/react";
   import { useTheme } from "../context/ThemeContext";

   function ThemeToggle() {
     const { theme, toggleTheme } = useTheme();
     const isDark = theme === "dark";

     return (
       <motion.button
         type="button"
         onClick={toggleTheme}
         whileTap={{ scale: 0.9 }}
         aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
         className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors hover:text-ink"
       >
         <motion.span
           key={theme}
           initial={{ rotate: -90, opacity: 0 }}
           animate={{ rotate: 0, opacity: 1 }}
           transition={{ duration: 0.25 }}
         >
           {isDark ? <Sun size={18} /> : <Moon size={18} />}
         </motion.span>
       </motion.button>
     );
   }

   export default ThemeToggle;