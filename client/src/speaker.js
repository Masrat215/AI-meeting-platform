// One colour set per speaker, so each voice is easy to follow
export const SPEAKER_COLORS = [
  {
    chip: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200",
    dot: "bg-blue-500",
    bubble: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    chip: "bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-200",
    dot: "bg-teal-500",
    bubble: "bg-teal-50 dark:bg-teal-500/10",
  },
  {
    chip: "bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200",
    dot: "bg-violet-500",
    bubble: "bg-violet-50 dark:bg-violet-500/10",
  },
  {
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
    dot: "bg-amber-500",
    bubble: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    chip: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200",
    dot: "bg-rose-500",
    bubble: "bg-rose-50 dark:bg-rose-500/10",
  },
];

export const speakerColor = (label = "A") => {
  const count = SPEAKER_COLORS.length;
  const index = (String(label).toUpperCase().charCodeAt(0) - 65) % count;
  return SPEAKER_COLORS[(index + count) % count];
};

// "A" -> "Priya" if a name is known, otherwise "Speaker A"
export const speakerDisplayName = (label, speakers = []) => {
  const known = speakers.find((speaker) => speaker.label === label)?.name;
  return known || `Speaker ${label}`;
};