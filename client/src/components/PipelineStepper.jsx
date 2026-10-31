import { motion } from "motion/react";
import { AudioLines, Check, Sparkles, Upload } from "lucide-react";

const STEPS = [
  { label: "Uploaded", icon: Upload },
  { label: "Transcribing", icon: AudioLines },
  { label: "Summarizing", icon: Sparkles },
  { label: "Done", icon: Check },
];

const STEP_INDEX = {
  uploaded: 0,
  transcribing: 1,
  transcribed: 2,
  summarizing: 2,
  done: 3,
};

function PipelineStepper({ status }) {
  const current = STEP_INDEX[status] ?? 0;
  const percent = (current / (STEPS.length - 1)) * 100;

  return (
    <div className="relative px-1 pb-1 pt-1">
      {/* grey track with an animated blue fill */}
      <div className="absolute left-10 right-10 top-5 h-1 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full bg-brand"
          initial={{ width: "0%" }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>

      <div className="relative flex justify-between">
        {STEPS.map(({ label, icon: Icon }, index) => {
          const done = index < current || status === "done";
          const active = index === current && status !== "done";

          return (
            <div key={label} className="flex w-20 flex-col items-center gap-2">
              <div className="relative">
                {active && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-brand/40" />
                )}
                <div
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors ${
                    done
                      ? "border-brand bg-brand text-white"
                      : active
                      ? "border-brand bg-surface text-brand-text"
                      : "border-line bg-surface text-muted"
                  }`}
                >
                  <Icon size={18} />
                </div>
              </div>
              <span
                className={`text-xs font-semibold ${
                  done || active ? "text-ink" : "text-muted"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PipelineStepper;