   import { useState } from "react";
   import { Outlet, useLocation } from "react-router";
   import { motion } from "motion/react";
   import { Menu } from "lucide-react";
   import Sidebar from "./Sidebar";
   import ThemeToggle from "./ThemeToggle";
      import UserMenu from "./UserMenu";
   import Logo from "./Logo";

   function AppLayout() {
     const [menuOpen, setMenuOpen] = useState(false);
     const location = useLocation();

     return (
       <div className="min-h-screen bg-canvas text-ink">
         <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

         <div className="lg:pl-64">
           <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur-sm">
             <button
               type="button"
               onClick={() => setMenuOpen(true)}
               aria-label="Open menu"
               className="rounded-lg p-2 text-muted hover:text-ink lg:hidden"
             >
               <Menu size={22} />
             </button>
             <div className="lg:hidden">
               <Logo size={30} />
             </div>
                <div className="ml-auto flex items-center gap-2">
     <ThemeToggle />
     <UserMenu />
   </div>
               
             
           </header>

           <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
             {/* Each page fades and slides in when the address changes */}
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.25 }}
             >
               <Outlet />
             </motion.div>
           </main>
         </div>
       </div>
     );
   }

   export default AppLayout;