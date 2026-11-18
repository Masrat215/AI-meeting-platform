import { motion } from "motion/react";
import { speakerColor, speakerDisplayName } from "../speakers";
import { formatDuration } from "../utils";

// How long each speaker talked, worked out from the transcript
function TalkTime({ segments, speakers }) {
  const totals = {};
  for (const segment of segments) {
    const length = (segment.end || 0) - (segment.start || 0);
    if (length > 0) totals[segment.speaker] = (totals[segment.speaker] || 0) + length;
  }

  const rows = Object.entries(totals)
    .map(([label, ms]) => ({ label, ms }))
    .sort((a, b) => b.ms - a.ms);
  const all = rows.reduce((sum, row) => sum + row.ms, 0);

  if (rows.length === 0) {
    return <p className="text-sm text-muted">There is no timing information for this meeting.</p>;
  }

  return (
    <ul className="space-y-4">
      {rows.map(({ label, ms }, index) => {
        const percent = Math.round((ms / all) * 100);
        return (
          <li key={label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 font-semibold">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${speakerColor(label).dot}`} />
                <span className="truncate">{speakerDisplayName(label, speakers)}</span>
              </span>
              <span className="shrink-0 text-muted">
                {formatDuration(ms)} · {percent}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className={`h-full rounded-full ${speakerColor(label).dot}`}
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.7, delay: index * 0.08, ease: "easeOut" }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default TalkTime;
