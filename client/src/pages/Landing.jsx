import { Link } from "react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  AudioLines,
  ListChecks,
  Moon,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Upload,
} from "lucide-react";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import WaveBars from "../components/WaveBars";
import { useAuth } from "../context/AuthContext";

const primaryLink =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90";
const secondaryLink =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:bg-surface-2";

const STEPS = [
  {
    icon: Upload,
    title: "1. Upload",
    text: "Drop in a recording of your meeting, in mp3, wav or m4a.",
  },
  {
    icon: AudioLines,
    title: "2. Transcribe",
    text: "ScribWave writes every word and labels who was speaking.",
  },
  {
    icon: ListChecks,
    title: "3. Get results",
    text: "Read the summary and the action items, with owners and deadlines.",
  },
];

const FEATURES = [
  {
    icon: AudioLines,
    title: "Speaker-labelled transcripts",
    text: "See who said what, with a timestamp on every line.",
  },
  {
    icon: Sparkles,
    title: "Clear summaries",
    text: "A short summary of the discussion in about a minute.",
  },
  {
    icon: ListChecks,
    title: "Action items with owners",
    text: "Every task, who is responsible and when it is due.",
  },
  {
    icon: ShieldCheck,
    title: "Private to your account",
    text: "Your meetings are visible only after you log in.",
  },
  {
    icon: Moon,
    title: "Light and dark mode",
    text: "Comfortable to read, day or night.",
  },
  {
    icon: Smartphone,
    title: "Works on any device",
    text: "Use it on your phone, tablet or computer.",
  },
];

// Fade and slide up when the section scrolls into view
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo size={34} />
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {user ? (
              <Link to="/app" className={primaryLink}>
                Open dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition hover:text-ink sm:inline-flex"
                >
                  Log in
                </Link>
                <Link to="/register" className={primaryLink}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-brand-text">
            <Sparkles size={14} /> AI meeting intelligence
          </span>
          <h1 className="mt-5 text-4xl leading-tight sm:text-5xl">
            Turn every meeting into clear notes and tasks.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Upload a recording. ScribWave writes the transcript, labels who
            spoke, summarises the discussion and lists the action items.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <Link to="/app" className={primaryLink}>
                Open dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/register" className={primaryLink}>
                  Get started free <ArrowRight size={16} />
                </Link>
                <Link to="/login" className={secondaryLink}>
                  I have an account
                </Link>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-3xl border border-line bg-surface p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 text-sm font-semibold text-muted">
            <AudioLines size={18} /> Team-meeting.m4a
          </div>
          <WaveBars className="my-6 h-24 justify-center" />
          <div className="space-y-2.5">
            <div className="h-3 w-full rounded-full bg-surface-2" />
            <div className="h-3 w-11/12 rounded-full bg-surface-2" />
            <div className="h-3 w-2/3 rounded-full bg-surface-2" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-surface-2 px-3 py-1">Speaker A</span>
            <span className="rounded-full bg-surface-2 px-3 py-1">Speaker B</span>
            <span className="rounded-full bg-surface-2 px-3 py-1 text-brand-text">
              3 action items
            </span>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-3xl">How it works</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                {...reveal}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className="rounded-2xl border border-line bg-canvas p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl">Everything you need after a meeting</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, index) => (
            <motion.div
              key={title}
              {...reveal}
              transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-line bg-surface p-6 shadow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-brand-text">
                <Icon size={20} />
              </div>
              <h3 className="text-base">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl bg-[#0b1f4b] bg-[radial-gradient(circle_at_top_right,#1d4ed8,transparent_65%)] px-6 py-14 text-center text-white">
          <h2 className="text-3xl">Ready to stop taking notes by hand?</h2>
          <p className="mx-auto mt-3 max-w-xl text-blue-100/80">
            Create a free account and upload your first recording.
          </p>
          <Link
            to={user ? "/app" : "/register"}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0b1f4b] transition hover:opacity-90"
          >
            {user ? "Open dashboard" : "Get started free"} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-sm text-muted">
        ScribWave · AI Meeting Intelligence · MCA project
      </footer>
    </div>
  );
}

export default Landing;