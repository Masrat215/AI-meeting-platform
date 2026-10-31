   import { motion } from "motion/react";

   const VARIANTS = {
     primary: "text-white hover:opacity-90",
     secondary: "border border-line bg-surface text-ink hover:bg-surface-2",
     danger:
       "border border-red-300 bg-surface text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10",
     ghost: "text-muted hover:bg-surface-2 hover:text-ink",
   };

   // The main button gets its colour directly, so it can never turn invisible
   const VARIANT_STYLES = {
     primary: { backgroundColor: "var(--color-brand, #1e3a8a)" },
   };

   function Button({
     variant = "primary",
     className = "",
     style,
     children,
     ...props
   }) {
     return (
       <motion.button
         whileHover={{ y: -1 }}
         whileTap={{ scale: 0.97 }}
         style={{ ...VARIANT_STYLES  dangerSolid: "bg-red-600 text-white hover:bg-red-700",}}
         className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
         {...props}
       >
         {children}
       </motion.button>
     );
   }

   export default Button;