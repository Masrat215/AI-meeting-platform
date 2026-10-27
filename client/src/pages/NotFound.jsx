import { Link } from "react-router";
import Logo from "../components/Logo";

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center text-ink">
      <Logo size={48} />
      <h1 className="mt-8 text-6xl">404</h1>
      <p className="mt-2 text-muted">We could not find that page.</p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Go to the home page
      </Link>
    </div>
  );
}

export default NotFound;