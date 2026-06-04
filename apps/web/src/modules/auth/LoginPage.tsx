"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  Users,
  ShoppingBag,
  Mail,
} from "lucide-react";
import Icon from "@/components/common/Icon";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

// ─── Floating stat cards shown over the hero image ──────
const HERO_STATS = [
  {
    label: "Monthly Revenue",
    value: "$124.7k",
    change: "+12.5%",
    positive: true,
  },
  { label: "Active Leads", value: "348", change: "+8.2%", positive: true },
  { label: "Store Orders", value: "1,284", change: "+23.4%", positive: true },
  { label: "Email Open Rate", value: "34.2%", change: "+3.8%", positive: true },
];

const HERO_ACTIVITY = [
  { icon: Users, text: "New lead from StartupXYZ", time: "2m ago" },
  { icon: ShoppingBag, text: "Order #1284 — $349 received", time: "14m ago" },
  { icon: Mail, text: "December campaign sent to 8,380", time: "1h ago" },
  { icon: TrendingUp, text: "Lighthouse score improved to 92", time: "3h ago" },
];

// ─── Animation variants ──────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

// ─── Left hero panel ─────────────────────────────────────
function HeroPanel() {
  return (
    <div className="relative hidden lg:flex flex-col h-full overflow-hidden rounded-2xl">
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1400&q=85"
        alt="Professional business environment"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

      {/* Headline text */}
      <div className="absolute bottom-81 left-8 right-8 z-10">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-2xl md:3xl font-extrabold font-display text-white leading-snug"
        >
          One platform.
          <br />
          Every operation.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-2 text-sm text-white/60"
        >
          CRM · CMS · SEO · Payments · Store · Email — all in one place.
        </motion.p>
      </div>

      {/* Stats row */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="absolute bottom-44 left-8 right-8 z-10 grid grid-cols-2 gap-2"
      >
        {HERO_STATS.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-md px-3 py-2.5"
          >
            <p className="text-[10px] text-white/60 uppercase tracking-wide">
              {stat.label}
            </p>
            <div className="flex items-end justify-between mt-0.5">
              <p className="text-base font-bold text-white font-display">
                {stat.value}
              </p>
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  stat.positive ? "text-emerald-400" : "text-red-400",
                )}
              >
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Activity feed */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="absolute bottom-4 left-8 right-8 z-10 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-3 space-y-2"
      >
        {HERO_ACTIVITY.map(({ icon: ActivityIcon, text, time }) => (
          <motion.div
            key={text}
            variants={fadeUp}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-white/15">
              <ActivityIcon className="h-3 w-3 text-white/80" />
            </div>
            <p className="flex-1 truncate text-xs text-white/80">{text}</p>
            <span className="flex-shrink-0 text-[10px] text-white/40">
              {time}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────
export function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
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

  return (
    <div className="flex h-screen bg-background overflow-hidden p-3 gap-3">
      {/* ── Left: hero image ── */}
      <div className="flex-1 min-w-0">
        <HeroPanel />
      </div>

      {/* ── Right: form panel ── */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex w-full max-w-md flex-col justify-center px-8 pb-4 lg:px-12 pt-4 md:pt-8 lg:pt-16 bg-background"
      >
        {/* Logo */}
        <div className="mb-10 md:mb-12 lg:mb-20 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-glow-brand">
            <Icon name="Logo" size="24" className="w-6 h-6 text-white" />
          </div>
          <span className="text-md lg:text-lg font-extrabold font-merienda text-foreground tracking-tight">
            ERVFlow
          </span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-foreground">
            Login
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage your business operations.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Your e-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@domain.com"
              className={cn(
                "w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground",
                "placeholder:text-muted-foreground/50",
                "transition-all duration-200 outline-none",
                "focus:border-primary focus:ring-2 focus:ring-primary/20",
                "border-border hover:border-muted-foreground/40",
              )}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••••••"
                className={cn(
                  "w-full rounded-xl border bg-background px-4 py-3 pr-11 text-sm text-foreground",
                  "placeholder:text-muted-foreground/50",
                  "transition-all duration-200 outline-none",
                  "focus:border-primary focus:ring-2 focus:ring-primary/20",
                  "border-border hover:border-muted-foreground/40",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Forgot password */}
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Forgot my password?
              </Link>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-sm text-error"
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full flex items-center justify-center gap-2",
              "rounded-xl bg-foreground text-background",
              "py-3.5 text-sm font-semibold",
              "hover:opacity-90 active:scale-[0.99]",
              "transition-all duration-200 cursor-pointer",
              "disabled:opacity-60 disabled:cursor-not-allowed",
            )}
          >
            {isLoading ? (
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
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
              <>
                Login
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Sign up link */}
        <p className="mt-8 text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors"
          >
            Sign up
          </Link>
        </p>

        {/* Footer note */}
        <p className="mt-auto pt-8 text-center text-xs md:text-sm text-muted-foreground/40">
          © {new Date().getFullYear()} ERVFlow. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
