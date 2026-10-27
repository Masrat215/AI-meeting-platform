import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Live checks, shown only after a field has been visited
  const errors = {
    email: !form.email
      ? "Please enter your email"
      : !EMAIL_PATTERN.test(form.email.trim())
      ? "That does not look like an email address"
      : "",
    password: !form.password ? "Please enter your password" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const update = (field) => (event) =>
    setForm({ ...form, [field]: event.target.value });
  const markTouched = (field) => () => setTouched({ ...touched, [field]: true });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ email: true, password: true });
    if (hasErrors) return;

    try {
      setSubmitting(true);
      setServerError("");
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      // The page then redirects automatically (see PublicOnlyRoute)
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
      title="Welcome back"
      subtitle="Log in to see your meetings."
      footer={
        <>
          New to ScribWave?{" "}
          <Link to="/register" className="font-semibold text-brand-text hover:underline">
            Create an account
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

        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={form.password}
          onChange={update("password")}
          onBlur={markTouched("password")}
          error={touched.password ? errors.password : ""}
        />

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Login;