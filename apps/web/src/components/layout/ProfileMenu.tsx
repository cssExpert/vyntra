"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  FileText,
  Bell,
  Star,
  CreditCard,
  Lock,
  ScrollText,
  LogOut,
  ChevronDown,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

// ─── Menu item definitions ───────────────────────────────
// `scope` controls visibility: "all" applies to every account, "org" is
// tenant-only (billing, plans, etc.) and hidden from platform super admins.
type MenuScope = "all" | "org";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  scope: MenuScope;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "profile",
    label: "Profile",
    href: "/settings/profile",
    icon: User,
    scope: "all",
  },
  {
    id: "billing",
    label: "Billing Info",
    href: "/settings/billing",
    icon: FileText,
    scope: "org",
  },
  {
    id: "notifications",
    label: "Manage Notifications",
    href: "/settings/notifications",
    icon: Bell,
    scope: "org",
  },
  {
    id: "subscription",
    label: "Subscription",
    href: "/settings/subscription",
    icon: Star,
    scope: "org",
  },
  {
    id: "payment-creds",
    label: "Payment Credentials",
    href: "/payments",
    icon: CreditCard,
    scope: "org",
  },
  {
    id: "password",
    label: "Manage Password",
    href: "/settings/password",
    icon: Lock,
    scope: "all",
  },
  {
    id: "system-logs",
    label: "System Logs",
    href: "/settings/logs",
    icon: ScrollText,
    scope: "org",
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
  const { user, isSuperAdmin, logout } = useAuth();
  const router = useRouter();

  // Super admins are platform operators with no tenant billing/plans — show
  // only account-level items.
  const menuItems = MENU_ITEMS.filter(
    (item) => !isSuperAdmin || item.scope === "all",
  );
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  /* Position of the dropdown panel (top-right, fixed) */
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Portal needs document to exist (SSR guard) */
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    router.replace("/");
  };

  /* Calculate position from button rect when opening */
  const toggle = useCallback(() => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 10,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen((v) => !v);
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const inButton = buttonRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inButton && !inDropdown) setIsOpen(false);
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
    <>
      {/* ── Trigger ── */}
      <button
        ref={buttonRef}
        onClick={toggle}
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

      {/*
        Portal renders backdrop + dropdown directly in <body>, escaping the
        topbar's sticky/transform stacking context (same approach as
        NotificationsDropdown).
      */}
      {mounted &&
        isOpen &&
        createPortal(
          <>
            {/* Backdrop — covers full viewport below topbar */}
            <div
              className="fixed inset-x-0 bottom-0 z-[998] bg-black/20 backdrop-blur-[2px]"
              style={{ top: 64 }} /* topbar height */
              onClick={() => setIsOpen(false)}
            />

            {/*
             * LAYER 1 — fade only (opacity), no CSS transform.
             * backdropFilter must live here so the browser never composites
             * this element inside a transform stacking context.
             */}
            <motion.div
              ref={dropdownRef}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              className="w-72 rounded-2xl shadow-glass-lg"
              style={{
                top: pos.top,
                right: pos.right,
                position: "fixed",
                zIndex: 999,
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
                  {menuItems.map((item) => {
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
          </>,
          document.body,
        )}
    </>
  );
}
