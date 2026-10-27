   import { NavLink } from "react-router";
   import { AnimatePresence, motion } from "motion/react";
   import { LayoutDashboard, Palette, Upload, X } from "lucide-react";
   import Logo from "./Logo";

   const LINKS = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/meetings/new", label: "New meeting", icon: Upload },
  { to: "/app/design", label: "Design preview", icon: Palette },
];

   function NavItems({ onNavigate }) {
     return (
       <nav className="flex flex-col gap-1 px-3">
         {LINKS.map(({ to, label, icon: Icon, end }) => (
           <NavLink
             key={to}
             to={to}
             end={end}
             onClick={onNavigate}
             className={({ isActive }) =>
               `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                 isActive
                   ? "bg-brand text-white"
                   : "text-muted hover:bg-surface-2 hover:text-ink"
               }`
             }
           >
             <Icon size={18} />
             {label}
           </NavLink>
         ))}
       </nav>
     );
   }

   function Sidebar({ open, onClose }) {
     return (
       <>
         {/* Fixed menu on computers */}
         <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
           <div className="flex h-16 items-center px-5">
             <Logo size={32} />
           </div>
           <NavItems />
           <p className="mt-auto px-5 pb-5 text-xs text-muted">ScribWave · version 2</p>
         </aside>

         {/* Sliding menu on phones */}
         <AnimatePresence>
           {open && (
             <motion.div
               key="overlay"
               className="fixed inset-0 z-40 bg-black/50 lg:hidden"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={onClose}
             />
           )}
           {open && (
             <motion.aside
               key="drawer"
               className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface lg:hidden"
               initial={{ x: "-100%" }}
               animate={{ x: 0 }}
               exit={{ x: "-100%" }}
               transition={{ duration: 0.22 }}
             >
               <div className="flex h-16 items-center justify-between px-5">
                 <Logo size={32} />
                 <button
                   type="button"
                   onClick={onClose}
                   aria-label="Close menu"
                   className="rounded-lg p-2 text-muted hover:text-ink"
                 >
                   <X size={20} />
                 </button>
               </div>
               <NavItems onNavigate={onClose} />
             </motion.aside>
           )}
         </AnimatePresence>
       </>
     );
   }

   export default Sidebar;