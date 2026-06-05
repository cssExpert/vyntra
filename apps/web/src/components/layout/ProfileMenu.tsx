"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  FileText,
  Bell,
  Star,
  CreditCard,
  Lock,
  Cpu,
  ScrollText,
  LogOut,
  ChevronDown,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

// ─── Menu item definitions ───────────────────────────────
interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

const MENU_ITEMS: MenuItem[] = [
  { id: "profile", label: "Profile", href: "/settings/profile", icon: User },
  {
    id: "billing",
    label: "Billing Info",
    href: "/settings/billing",
    icon: FileText,
  },
  {
    id: "notifications",
    label: "Manage Notifications",
    href: "/settings/notifications",
    icon: Bell,
  },
  {
    id: "subscription",
    label: "Subscription",
    href: "/settings/subscription",
    icon: Star,
  },
  {
    id: "payment-creds",
    label: "Payment Credentials",
    href: "/payments",
    icon: CreditCard,
  },
  {
    id: "password",
    label: "Manage Password",
    href: "/settings/password",
    icon: Lock,
  },
  {
    id: "configuration",
    label: "Configuration",
    href: "/settings/configuration",
    icon: Cpu,
  },
  {
    id: "system-logs",
    label: "System Logs",
    href: "/settings/logs",
    icon: ScrollText,
  },
];

// ─── Framer Motion variants ──────────────────────────────

// Outer layer: opacity ONLY — zero transforms so backdropFilter works
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: "easeIn" } },
};

// Inner layer: scale + slide for the visual pop, propagates stagger to children
const panelVariants = {
  hidden: { scale: 0.95, y: -8 },
  visible: {
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.03,
      delayChildren: 0.06,
    },
  },
  exit: { scale: 0.95, y: -8, transition: { duration: 0.14, ease: "easeIn" } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.16, ease: "easeOut" },
  },
};

// ─── Component ───────────────────────────────────────────
export function ProfileMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    router.replace("/");
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {/* ── Trigger ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-1.5",
          "transition-all duration-200 cursor-pointer",
          isOpen
            ? "border-primary/40 bg-primary/10 text-foreground"
            : "border-border bg-muted/50 hover:bg-muted text-foreground",
        )}
      >
        {/* Avatar */}
        <div className="h-6 w-6 flex-shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-bold text-white">
          {user?.initials ?? "??"}
        </div>
        <span className="hidden sm:block text-sm font-medium">
          {user?.name?.split(" ")[0] ?? "Account"}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* ── Dropdown Panel ── */}
      <AnimatePresence>
        {isOpen && (
          /**
           * LAYER 1 — fade only (opacity), no CSS transform.
           * backdropFilter must live here so the browser never composites
           * this element inside a transform stacking context.
           */
          <motion.div
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl shadow-glass-lg"
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/**
             * LAYER 2 — scale + slide animation + overflow-hidden clipping.
             * bg-card/80 keeps 20% transparency so blur is visible.
             * staggerChildren propagates down to itemVariants.
             */}
            <motion.div
              variants={panelVariants}
              className="rounded-2xl overflow-hidden border border-border bg-card flex flex-col origin-top-right"
            >
              {/* ── User info header ── */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 p-4 border-b border-border bg-muted/40"
              >
                <div className="relative flex-shrink-0">
                  <div className="h-11 w-11 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold text-white shadow-glow-brand">
                    {user?.initials ?? "??"}
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-card" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {user?.name ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email ?? "—"}
                  </p>
                  <div className="mt-1 inline-flex items-center rounded-full bg-brand-500/10 px-2 py-0.5">
                    <span className="text-[10px] font-semibold text-brand-400 uppercase tracking-wide">
                      {user?.role ?? "User"}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* ── Menu items ── */}
              <div className="py-1.5">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;
                  return (
                    <motion.div key={item.id} variants={itemVariants}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          setActiveItem(item.id);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "group flex items-center gap-3 px-4 py-2.5 mx-1.5 rounded-md",
                          "text-sm transition-all duration-150 cursor-pointer",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted/80",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm transition-colors duration-150",
                            isActive
                              ? "bg-primary/15 text-primary"
                              : "bg-muted/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* ── Logout ── */}
              <motion.div
                variants={itemVariants}
                className="border-t border-border mt-1 p-2"
              >
                <button
                  onClick={handleLogout}
                  className={cn(
                    "group flex w-full items-center gap-3 px-4 py-2.5 rounded-md",
                    "text-sm font-medium text-error",
                    "hover:bg-error/10 transition-all duration-150 cursor-pointer",
                  )}
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm bg-error/10 text-error group-hover:bg-error/20 transition-colors duration-150">
                    <LogOut className="h-3.5 w-3.5" />
                  </span>
                  Logout
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
