import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { speakerColor, speakerDisplayName } from "../speakers";

function SpeakerChips({ labels, speakers, canEdit, onSave }) {
  const [editing, setEditing] = useState(null);
  const [value, setValue] = useState("");

  const startEdit = (label) => {
    const known = speakers.find((speaker) => speaker.label === label)?.name || "";
    setValue(known);
    setEditing(label);
  };

  const submit = async (label) => {
    await onSave(label, value.trim());
    setEditing(null);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => {
        const color = speakerColor(label);

        if (editing === label) {
          return (
            <form
              key={label}
              onSubmit={(event) => {
                event.preventDefault();
                submit(label);
              }}
              className="flex items-center gap-1 rounded-full border border-line bg-surface py-1 pl-3 pr-1"
            >
              <input
                autoFocus
                value={value}
                maxLength={40}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => event.key === "Escape" && setEditing(null)}
                placeholder={`Name for Speaker ${label}`}
                className="w-36 bg-transparent text-sm outline-none"
              />
              <button
                type="submit"
                aria-label="Save name"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white"
              >
                <Check size={14} />
              </button>
              <button
                type="button"
                aria-label="Cancel"
                onClick={() => setEditing(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:text-ink"
              >
                <X size={14} />
              </button>
            </form>
          );
        }

        return (
          <span
            key={label}
            className={`inline-flex items-center gap-2 rounded-full py-1.5 pl-3 pr-2 text-sm font-semibold ${color.chip}`}
          >
            <span className={`h-2 w-2 rounded-full ${color.dot}`} />
            {speakerDisplayName(label, speakers)}
            {canEdit && (
              <button
                type="button"
                onClick={() => startEdit(label)}
                aria-label={`Rename speaker ${label}`}
                className="flex h-6 w-6 items-center justify-center rounded-full opacity-70 transition hover:opacity-100"
              >
                <Pencil size={13} />
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default SpeakerChips;