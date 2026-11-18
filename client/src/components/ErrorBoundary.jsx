import { Component } from "react";
import { Info } from "lucide-react";

// If a page crashes, show this friendly screen instead of a blank white page.
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ScribWave screen error:", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        role="alert"
        className="mx-auto my-10 max-w-lg rounded-2xl border border-line bg-surface p-8 text-center shadow-sm"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-600 dark:text-red-300">
          <Info size={26} />
        </div>
        <h2 className="text-xl">Something went wrong on this page</h2>
        <p className="mt-2 text-sm text-muted">
          The rest of ScribWave is fine. Reload this page, or go back to your dashboard.
        </p>

        <details className="mt-4 rounded-xl bg-surface-2 px-4 py-3 text-left text-xs text-muted">
          <summary className="cursor-pointer font-semibold">Technical details</summary>
          <p className="mt-2 break-words font-mono">
            {String(this.state.error?.message || this.state.error)}
          </p>
        </details>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ backgroundColor: "var(--color-brand, #1e3a8a)" }}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Reload page
          </button>
          <a
            href="/app"
            className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-2"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
