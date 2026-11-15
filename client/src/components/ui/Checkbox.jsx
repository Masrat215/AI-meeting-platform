import { motion } from "motion/react";
import { Check } from "lucide-react";

// A round tick box. The tick pops in with a small spring when checked.
function Checkbox({ checked, onChange, label }) {
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      whileTap={{ scale: 0.82 }}
      style={
        checked
          ? { backgroundColor: "#0d9488", borderColor: "#0d9488" }
          : undefined
      }
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        checked
          ? "text-white"
          : "border-line bg-surface hover:border-teal-500"
      }`}
    >
      {checked && (
        <motion.span
          className="flex"
          initial={{ scale: 0, rotate: -40 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 16 }}
        >
          <Check size={14} strokeWidth={3.5} color="#ffffff" />
        </motion.span>
      )}
    </motion.button>
  );
}

export default Checkbox;
