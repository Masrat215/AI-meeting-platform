import { Link } from "react-router";
import { motion } from "motion/react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import WaveBars from "./WaveBars";

// Dark blue brand panel on the left (computers only), form on the right
function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-canvas text-ink lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0b1f4b] bg-[radial-gradient(circle_at_top_left,#1d4ed8,transparent_60%)] p-10 text-white lg:flex">
        <Link to="/">
          <Logo size={40} light />
        </Link>

        <div>
          <WaveBars barClass="bg-cyan-300" className="mb-8 h-24" />
          <h2 className="font-display text-3xl font-extrabold leading-tight">
            Turn every meeting into notes and tasks.
          </h2>
          <p className="mt-3 max-w-md text-blue-100/80">
            Upload a recording and ScribWave writes the transcript, the summary
            and the action items for you.
          </p>
        </div>

        <p className="text-sm text-blue-100/60">AI Meeting Intelligence</p>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 lg:justify-end">
          <Link to="/" className="lg:hidden">
            <Logo size={32} />
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <h1 className="text-2xl">{title}</h1>
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
            <div className="mt-6">{children}</div>
            <div className="mt-6 text-center text-sm text-muted">{footer}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;