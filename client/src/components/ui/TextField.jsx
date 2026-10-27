import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// A labelled input with an error message and, for passwords, a show/hide button
function TextField({ label, error, id, type = "text", className = "", ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:ring-2 ${
            error
              ? "border-red-400 focus:ring-red-400/30"
              : "border-line focus:border-brand-text focus:ring-brand-text/20"
          } ${isPassword ? "pr-11" : ""}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((current) => !current)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export default TextField;