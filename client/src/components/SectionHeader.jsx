const TONES = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-200",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200",
};

function SectionHeader({ icon: Icon, title, subtitle, tone = "blue", count }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="m-0 text-xl leading-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {subtitle}
          </p>
        )}
      </div>
      {count !== undefined && (
        <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-bold">
          {count}
        </span>
      )}
    </div>
  );
}

export default SectionHeader;