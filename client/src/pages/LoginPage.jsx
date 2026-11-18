import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormField from "../components/FormField.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../services/api.js";

export default function LoginPage() {
  const { login, sessionError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      const redirectPath = location.state?.from?.pathname;
      navigate(redirectPath?.startsWith("/") ? redirectPath : "/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "We couldn’t sign you in. Try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to FlowForge"
      description="Use your account details to continue to your workspace."
    >
      <div className="mb-7 lg:hidden">
        <p className="text-sm leading-6 text-slate-500">
          Use your account details to continue to your workspace.
        </p>
      </div>

      {sessionError && !error && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-800"
        >
          {sessionError}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormField
          id="email"
          label="Email address"
          icon={Mail}
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
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
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        New to FlowForge?{" "}
        <Link
          to="/signup"
          className="font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
