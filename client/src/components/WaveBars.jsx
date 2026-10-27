import { motion } from "motion/react";

const HEIGHTS = [28, 54, 82, 44, 96, 62, 36, 74, 50, 90, 40, 66, 30];

// A row of bars that gently pulse like a sound wave
function WaveBars({ className = "", barClass = "bg-wave" }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`} aria-hidden="true">
      {HEIGHTS.map((height, index) => (
        <motion.span
          key={index}
          className={`w-2 rounded-full ${barClass}`}
          style={{ height }}
          animate={{ scaleY: [1, 0.35, 1] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
}

export default WaveBars;