"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MoveLeft, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroPanel } from "./HeroPanel";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      // TODO: wire up to API when endpoint is available
      await new Promise((r) => setTimeout(r, 1000));
      setSubmitted(true);
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
        className="flex flex-1 flex-col items-center justify-center bg-white"
      >
        <div className="w-full max-w-md px-4">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Heading */}
                <div className="mb-7 text-center">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 font-merienda leading-tight">
                    Forgot your password?
                  </h1>
                  <p className="mt-2 text-sm md:text-base text-gray-500 leading-relaxed">
                    Enter your email and we&apos;ll send you a link to reset
                    your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                    disabled={!email.trim() || isLoading}
                    className={cn(
                      "w-full flex items-center justify-center gap-2",
                      "rounded-full text-white",
                      "py-3.5 text-[14px] font-bold h-[50px]",
                      "transition-all duration-200",
                      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      email.trim() && !isLoading
                        ? "bg-primary hover:bg-primary-600 active:scale-[0.99] cursor-pointer"
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
                      "Send reset link"
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-primary transition-colors"
                  >
                    <MoveLeft className="h-3.5 w-3.5" />
                    Back to login
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 font-merienda">
                  Check your inbox
                </h2>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  We sent a password reset link to
                  <br />
                  <span className="font-semibold text-gray-700">{email}</span>
                </p>
                <p className="mt-6 text-[13px] text-gray-400">
                  Didn&apos;t receive it?{" "}
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                    }}
                    className="font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    Try again
                  </button>
                </p>
                <p className="mt-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-primary transition-colors"
                  >
                    <MoveLeft className="h-3.5 w-3.5" />
                    Back to login
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
