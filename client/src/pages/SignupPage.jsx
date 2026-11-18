import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormField from "../components/FormField.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../services/api.js";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    if (!name) {
      setError("Enter your name to create an account.");
      return;
    }
    if (form.password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }
    if (new TextEncoder().encode(form.password).length > 72) {
      setError("Your password must be 72 UTF-8 bytes or fewer.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Your passwords don’t match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        name,
        email: form.email.trim(),
        password: form.password,
      });
      const redirectPath = location.state?.from?.pathname;
      navigate(redirectPath?.startsWith("/") ? redirectPath : "/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "We couldn’t create your account. Try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      description="Set up your FlowForge account and get ready to bring your work together."
    >
      <div className="mb-6 lg:hidden">
        <p className="text-sm leading-6 text-slate-500">
          Set up your account and get ready to bring your work together.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField
          id="name"
          label="Full name"
          icon={UserRound}
          type="text"
          name="name"
          value={form.name}
          onChange={updateField("name")}
          placeholder="Your name"
          autoComplete="name"
          maxLength={100}
          required
        />

        <FormField
          id="email"
          label="Email address"
          icon={Mail}
          type="email"
          name="email"
          value={form.email}
          onChange={updateField("email")}
          placeholder="you@company.com"
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          required
        />

        <FormField
          id="password"
          label="Password"
          icon={LockKeyhole}
          type={isPasswordVisible ? "text" : "password"}
          name="password"
          value={form.password}
          onChange={updateField("password")}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          trailing={
            <button
              type="button"
              onClick={() => setIsPasswordVisible((visible) => !visible)}
              className="rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <FormField
          id="confirm-password"
          label="Confirm password"
          icon={LockKeyhole}
          type={isConfirmVisible ? "text" : "password"}
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={updateField("confirmPassword")}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
          trailing={
            <button
              type="button"
              onClick={() => setIsConfirmVisible((visible) => !visible)}
              className="rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
              aria-label={
                isConfirmVisible ? "Hide confirmation" : "Show confirmation"
              }
            >
              {isConfirmVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-700"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
