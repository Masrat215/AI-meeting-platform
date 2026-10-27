import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close the menu when you click anywhere outside it
  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    toast.success("You have been logged out");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white transition hover:opacity-90"
      >
        {initialsOf(user.name)}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-line bg-surface p-2 shadow-lg"
          >
            <div className="border-b border-line px-3 pb-3 pt-2">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <LogOut size={16} /> Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserMenu;