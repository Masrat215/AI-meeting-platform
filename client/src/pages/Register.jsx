import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 0 = too short, then 1 to 5 as the password gets stronger
const strengthOf = (password) => {
  if (password.length < 8) return 0;
  let score = 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
};

const STRENGTH_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong", "Very strong"];
const STRENGTH_COLORS = [
  "bg-red-500",
  "bg-red-500",
  "bg-amber-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-green-500",
];

function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const errors = {
    name: form.name.trim().length < 2 ? "Please enter your name" : "",
    email: !form.email
      ? "Please enter your email"
      : !EMAIL_PATTERN.test(form.email.trim())
      ? "That does not look like an email address"
      : "",
    password:
      form.password.length < 8
        ? "Use at least 8 characters"
        : form.password.length > 72
        ? "Use at most 72 characters"
        : "",
    confirm:
      form.confirm !== form.password ? "The passwords do not match" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const strength = strengthOf(form.password);

  const update = (field) => (event) =>
    setForm({ ...form, [field]: event.target.value });
  const markTouched = (field) => () => setTouched({ ...touched, [field]: true });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (hasErrors) return;

    try {
      setSubmitting(true);
      setServerError("");
      const user = await register(
        form.name.trim(),
        form.email.trim(),
        form.password
      );
      toast.success(`Welcome to ScribWave, ${user.name.split(" ")[0]}`);
    } catch (error) {
      setServerError(
        error.response?.data?.error ||
          "Could not reach the server. It may be waking up, so please try again in a minute."
      );
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-text hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {serverError && (
          <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {serverError}
          </p>
        )}

        <TextField
          id="name"
          label="Full name"
          autoComplete="name"
          placeholder="Your name"
          value={form.name}
          onChange={update("name")}
          onBlur={markTouched("name")}
          error={touched.name ? errors.name : ""}
        />

        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={update("email")}
          onBlur={markTouched("email")}
          error={touched.email ? errors.email : ""}
        />

        <div>
          <TextField
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={update("password")}
            onBlur={markTouched("password")}
            error={touched.password ? errors.password : ""}
          />

          {form.password && (
            <div className="mt-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <motion.div
                  className={`h-full rounded-full ${STRENGTH_COLORS[strength]}`}
                  animate={{ width: `${Math.max(strength, 0.5) * 20}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
              <p className="mt-1 text-xs text-muted">
                Strength: {STRENGTH_LABELS[strength]}
              </p>
            </div>
          )}
        </div>

        <TextField
          id="confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Type the password again"
          value={form.confirm}
          onChange={update("confirm")}
          onBlur={markTouched("confirm")}
          error={touched.confirm ? errors.confirm : ""}
        />

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Register;