"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { HeroPanel } from "./HeroPanel";
import Icon from "@/components/common/Icon";

// ─── Toggle ───────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={cn(
        "relative inline-flex h-[26px] w-[48px] flex-shrink-0 items-center rounded-full",
        "transition-colors duration-200 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
        checked ? "bg-primary" : "bg-gray-200",
      )}
    >
      <span
        className={cn(
          "inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow",
          "transition-transform duration-200",
          checked ? "translate-x-[23px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────
export function LoginPage() {
  const router = useRouter();
  const {
    login,
    isAuthenticated,
    isSuperAdmin,
    isLoading: authLoading,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Super admins land on the platform admin dashboard; everyone else on the
  // org dashboard.
  const landingPath = isSuperAdmin ? "/admin/dashboard" : "/dashboard";

  // Signed in (fresh login or revisiting "/") → go straight to the dashboard.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(landingPath);
    }
  }, [authLoading, isAuthenticated, landingPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setIsLoading(true);
    try {
      // On success, auth state updates and the effect above redirects to the
      // role-appropriate dashboard.
      await login(email, password);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid email or password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Avoid flashing the login form while rehydrating or redirecting an
  // already-authenticated user.
  if (authLoading || isAuthenticated) return null;
  const inputClass = (focused: boolean, extraClasses?: string) =>
    cn(
      "w-full rounded-xl border px-3 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-300 transition-all duration-150",
      focused
        ? "outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15"
        : "border-gray-200 hover:border-gray-300",
      extraClasses,
    );

  return (
    <div className="flex h-screen bg-white overflow-hidden p-0 gap-3">
      {/* ── Left: narrow photo panel ── */}
      <div className="hidden lg:block lg:w-[40%] xl:w-[40%] flex-shrink-0 h-full">
        <HeroPanel />
      </div>

      {/* ── Right: wide form panel ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-1 flex-col items-center justify-center bg-white"
      >
        {/* Form card — constrained width, centered */}
        <div className="w-full max-w-md px-4">
          {/* Heading */}
          <div className="mb-7 text-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 font-merienda leading-tight">
              Login to ERVFlow
            </h1>
            <p className="mt-2 text-sm md:text-base text-gray-500 leading-relaxed">
              Manage your business operations effortlessly with our powerful
              all-in-one platform.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email input */}
            <div className="w-full space-y-1">
              <label
                htmlFor="email"
                className="block text-sm text-gray-400 mb-0.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="info.companyname@gmail.com"
                className={inputClass(emailFocused)}
              />
            </div>

            {/* Password input */}
            <div className="w-full space-y-1">
              <label
                htmlFor="password"
                className="block text-sm text-gray-400 mb-0.5"
              >
                Password
              </label>
              <div className="flex items-center relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••••"
                  className={inputClass(passwordFocused, "pr40")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 flex-shrink-0 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="pt-0.5">
              <Link
                href="/forgot-password"
                className="text-[13px] font-semibold text-primary/75 hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Remember me toggle */}
            <div className="flex items-center justify-between py-1">
              <span className="text-[13px] text-gray-500">
                Remember sign in details
              </span>
              <Toggle
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[13px] text-red-600"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!email.trim() || isLoading}
              className={cn(
                "w-full flex items-center justify-center",
                "rounded-full text-white",
                "py-3.5 text-[14px] font-bold h-[50px]",
                "transition-all duration-200 mt-1",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                email.trim()
                  ? "bg-primary hover:bg-primary/90 active:scale-[0.99] cursor-pointer"
                  : "bg-primary/40 cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          {/* OR divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button
            type="button"
            className={cn(
              "w-full flex items-center justify-center gap-3",
              "rounded-xl border border-gray-200 bg-gray-50",
              "py-3 text-[13.5px] font-semibold text-gray-800",
              "hover:bg-gray-100 transition-colors cursor-pointer",
              "focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
            )}
          >
            <Icon name="Google" size="20" className="w-5 h-5" />
            Continue with Google
          </button>

          {/* Sign up */}
          <p className="mt-7 text-[13px] text-gray-500 text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary/75 hover:text-primary transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
