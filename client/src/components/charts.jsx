import { motion } from "motion/react";

const BAR_GRADIENT = "linear-gradient(180deg,#22d3ee,#1d4ed8)";
const DONE_COLOR = "#0d9488";
const OPEN_COLOR = "#f59e0b";
const BAR_AREA = 120; // height in pixels of the tallest bar

// "2026-11-09" -> "9 Nov"
const weekLabel = (weekStart) =>
  new Date(`${weekStart}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

// "2026-11-09" -> "9" and "Nov", shown one above the other so they fit on a phone
const weekDay = (weekStart) => String(Number(weekStart.slice(8, 10)));
const weekMonth = (weekStart) =>
  new Date(`${weekStart}T00:00:00Z`).toLocaleDateString("en-IN", {
    month: "short",
    timeZone: "UTC",
  });

// Meetings per week: one column per week
export function WeeklyBars({ weeks }) {
  const max = Math.max(1, ...weeks.map((week) => week.count));

  return (
    <div className="flex items-end gap-2 sm:gap-3">
      {weeks.map((week, index) => {
        const height = week.count === 0 ? 4 : Math.max(10, (week.count / max) * BAR_AREA);

        return (
          <div
            key={week.weekStart}
            className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
          >
            <span className="text-xs font-bold">{week.count}</span>
            <motion.div
              className="w-full max-w-10 rounded-t-lg"
              style={{ background: week.count === 0 ? "var(--color-line)" : BAR_GRADIENT }}
              initial={{ height: 0 }}
              animate={{ height }}
              transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
              title={`${week.count} meeting${week.count === 1 ? "" : "s"}, week of ${weekLabel(week.weekStart)}`}
            />
            <span className="flex flex-col items-center text-[11px] leading-tight text-muted">
              <span className="font-semibold">{weekDay(week.weekStart)}</span>
              <span>{weekMonth(week.weekStart)}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Ring chart: how much of the work is done
export function Donut({ done, open }) {
  const total = done + open;
  const size = 132;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const share = total === 0 ? 0 : done / total;

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
          aria-label={`${done} tasks done, ${open} still open`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            stroke={total === 0 ? "var(--color-line)" : OPEN_COLOR}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            stroke={DONE_COLOR}
            strokeLinecap="butt"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${circumference * share} ${circumference}` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-extrabold leading-none">
            {Math.round(share * 100)}%
          </span>
          <span className="mt-1 text-[11px] text-muted">done</span>
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: DONE_COLOR }} />
          <span className="font-semibold">{done}</span>
          <span className="text-muted">done</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: OPEN_COLOR }} />
          <span className="font-semibold">{open}</span>
          <span className="text-muted">still open</span>
        </li>
      </ul>
    </div>
  );
}

// Tasks per person: one row each, done and open side by side
export function PersonBars({ people }) {
  const max = Math.max(1, ...people.map((person) => person.done + person.open));

  return (
    <ul className="space-y-4">
      {people.map((person, index) => (
        <li key={person.name} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-sm font-medium" title={person.name}>
            {person.name}
          </span>
          <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              style={{ background: DONE_COLOR }}
              initial={{ width: 0 }}
              animate={{ width: `${(person.done / max) * 100}%` }}
              transition={{ duration: 0.6, delay: index * 0.06 }}
            />
            <motion.div
              style={{ background: OPEN_COLOR }}
              initial={{ width: 0 }}
              animate={{ width: `${(person.open / max) * 100}%` }}
              transition={{ duration: 0.6, delay: index * 0.06 }}
            />
          </div>
          <span className="w-16 shrink-0 text-right text-xs text-muted">
            {person.done}/{person.done + person.open}
          </span>
        </li>
      ))}
      <li className="flex gap-4 pt-1 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: DONE_COLOR }} /> done
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: OPEN_COLOR }} /> open
        </span>
      </li>
    </ul>
  );
}
