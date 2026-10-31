import { Link } from "react-router";

function LinkButton({ to, children, className = "" }) {
  return (
    <Link
      to={to}
      style={{ backgroundColor: "var(--color-brand, #1e3a8a)" }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 ${className}`}
    >
      {children}
    </Link>
  );
}

export default LinkButton;