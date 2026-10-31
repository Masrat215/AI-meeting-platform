const STYLES = {
  uploaded: {
    label: "Uploaded",
    classes: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
    pulse: false,
  },
  transcribing: {
    label: "Transcribing",
    classes: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
    pulse: true,
  },
  transcribed: {
    label: "Transcribed",
    classes: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200",
    pulse: true,
  },
  summarizing: {
    label: "Summarizing",
    classes: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
    pulse: true,
  },
  done: {
    label: "Done",
    classes: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200",
    pulse: false,
  },
  failed: {
    label: "Failed",
    classes: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200",
    pulse: false,
  },
};

function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.uploaded;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${style.classes}`}
    >
      <span className="relative flex h-2 w-2">
        {style.pulse && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
      </span>
      {style.label}
    </span>
  );
}

export default StatusBadge;