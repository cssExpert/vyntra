"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroPanel } from "./HeroPanel";
import Icon from "@/components/common/Icon";

export function SignupPage() {
  const t = useTranslations("auth");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isFormReady = name.trim() && email.trim() && password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      // TODO: wire up to API when endpoint is available
      await new Promise((r) => setTimeout(r, 1000));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* Left: hero panel */}
      <div className="hidden lg:block lg:w-[40%] xl:w-[40%] flex-shrink-0 h-full">
        <HeroPanel />
      </div>

      {/* Right: form panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-1 flex-col items-center justify-center bg-white overflow-y-auto py-8"
      >
        <div className="w-full max-w-md px-4">
          {/* Heading */}
          <div className="mb-7 text-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 font-merienda leading-tight">
              Create your account
            </h1>
            <p className="mt-2 text-sm md:text-base text-gray-500 leading-relaxed">
              Get started with ERVFlow — free to try, no card required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full name */}
            <div className="w-full space-y-1">
              <label
                htmlFor="name"
                className="block text-sm text-gray-400 mb-0.5"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                placeholder="John Smith"
                className={inputClass(nameFocused)}
              />
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="w-full space-y-1">
              <label
                htmlFor="password"
                className="block text-sm text-gray-400 mb-0.5"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="Min. 6 characters"
                  className={inputClass(passwordFocused, "pr40")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {password && password.length < 6 && (
                <p className="text-[11px] text-red-400 mt-1">
                  At least 6 characters required
                </p>
              )}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[13px] text-red-600"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={!isFormReady || isLoading}
              className={cn(
                "w-full flex items-center justify-center",
                "rounded-full text-white",
                "py-3.5 text-[14px] font-bold h-[50px] mt-1",
                "transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isFormReady && !isLoading
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
                "Create account"
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
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50 py-3 text-[13.5px] font-semibold text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Icon name="Google" size="20" className="w-5 h-5" />
            Continue with Google
          </button>

          <p className="mt-6 text-[13px] text-gray-500 text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
