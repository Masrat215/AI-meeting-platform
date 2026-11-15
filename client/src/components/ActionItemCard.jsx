import { Link } from "react-router";
import { motion } from "motion/react";
import { CalendarClock, FileAudio, User } from "lucide-react";
import Checkbox from "./ui/Checkbox";

// One action item with a tick box.
// Pass `meeting` ({ id, title }) to show which meeting it came from.
function ActionItemCard({ item, index = 0, onToggle, meeting }) {
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { delay: Math.min(index, 8) * 0.05 },
      }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
      className={`flex flex-col gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
        item.completed
          ? "border-teal-500/30 bg-teal-500/10"
          : "border-line bg-canvas"
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <Checkbox
          checked={item.completed}
          onChange={onToggle}
          label={item.completed ? "Mark as not done" : "Mark as done"}
        />
        <div className="min-w-0">
          <p
            className={`font-medium leading-snug transition-colors ${
              item.completed ? "text-muted line-through" : ""
            }`}
          >
            {item.task}
          </p>
          {meeting && (
            <Link
              to={`/app/meetings/${meeting.id}`}
              className="mt-1 inline-flex max-w-full items-center gap-1 text-xs font-medium text-brand-text hover:underline"
            >
              <FileAudio size={12} className="shrink-0" />
              <span className="truncate">{meeting.title}</span>
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            item.assignee === "Unassigned"
              ? "bg-surface-2 text-muted"
              : "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200"
          }`}
        >
          <User size={13} /> {item.assignee}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            item.deadline === "Not specified"
              ? "bg-surface-2 text-muted"
              : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
          }`}
        >
          <CalendarClock size={13} /> {item.deadline}
        </span>
      </div>
    </motion.li>
  );
}

export default ActionItemCard;