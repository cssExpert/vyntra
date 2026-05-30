"use client";

import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, ArrowRight, Github } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Auth logic here
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/dashboard";
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-mesh p-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/8 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="glass-card p-8">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-brand">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-display text-foreground">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to your Vyntra workspace
            </p>
          </div>

          {/* OAuth */}
          <button className="mb-4 flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-muted/50 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-all duration-200 cursor-pointer">
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                className={cn(
                  "w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground",
                  "placeholder:text-muted-foreground/60",
                  "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-200"
                )}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 pr-10 text-sm text-foreground",
                    "placeholder:text-muted-foreground/60",
                    "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                    "transition-all duration-200"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "relative w-full flex items-center justify-center gap-2 rounded-lg",
                "bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground",
                "hover:bg-primary/90 transition-all duration-200 cursor-pointer",
                "disabled:opacity-70 disabled:cursor-not-allowed",
                "shadow-glow-brand"
              )}
            >
              {isLoading ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Start free trial
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground/60">
          By signing in you agree to our{" "}
          <a href="#" className="underline underline-offset-2 hover:text-muted-foreground">Terms</a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-2 hover:text-muted-foreground">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
}
