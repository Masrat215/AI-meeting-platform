import { motion } from "motion/react";

// "2 of 5 done" with a bar that fills smoothly
function ProgressBar({ done, total }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const finished = total > 0 && done === total;

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
        <span className={finished ? "text-teal-700 dark:text-teal-300" : "text-muted"}>
          {finished ? "All tasks done" : `${done} of ${total} done`}
        </span>
        <span className={finished ? "text-teal-700 dark:text-teal-300" : "text-muted"}>
          {percent}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg,#0d9488,#22d3ee)" }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
