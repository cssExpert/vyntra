"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  Bell,
  Users2,
  CreditCard,
  Mail,
  BarChart3,
  UserPlus,
  AlertTriangle,
  Settings,
  Check,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Data ──────────────────────────────────────────────────── */
interface Notification {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    icon: Users2,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    title: "New lead assigned",
    description: "Priya Patel from StartupXYZ was assigned to you.",
    time: "2m ago",
    unread: true,
  },
  {
    id: "n2",
    icon: CreditCard,
    iconColor: "text-green-400",
    iconBg: "bg-green-500/10",
    title: "Payment received",
    description: "Acme Corp paid $24,000 — invoice #INV-2024-089.",
    time: "18m ago",
    unread: true,
  },
  {
    id: "n3",
    icon: Mail,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
    title: "Campaign sent",
    description: '"Q4 Outreach" reached 1,240 recipients.',
    time: "1h ago",
    unread: true,
  },
  {
    id: "n4",
    icon: BarChart3,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    title: "Monthly report ready",
    description: "November 2024 report has been generated.",
    time: "3h ago",
    unread: false,
  },
  {
    id: "n5",
    icon: UserPlus,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    title: "New user joined",
    description: "Emma Davis created an account via referral.",
    time: "5h ago",
    unread: false,
  },
  {
    id: "n6",
    icon: AlertTriangle,
    iconColor: "text-red-400",
    iconBg: "bg-red-500/10",
    title: "Lighthouse score dropped",
    description: "techcorp.io performance score fell below 70.",
    time: "Yesterday",
    unread: false,
  },
];

/* ─── Animation variants ────────────────────────────────────── */
const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 420, damping: 28, mass: 0.7 },
  },
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

/* ─── Notification row ──────────────────────────────────────── */
function NotificationItem({
  item,
  onRead,
}: {
  item: Notification;
  onRead: (id: string) => void;
}) {
  const Icon = item.icon;
  return (
    <motion.div
      variants={itemVariants}
      onClick={() => onRead(item.id)}
      className={cn(
        "flex items-start gap-3 px-4 py-3 cursor-pointer",
        "hover:bg-muted/60 transition-colors duration-150",
        item.unread && "bg-primary/[0.03]",
      )}
    >
      <span className={cn(
        "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl",
        item.iconBg,
      )}>
        <Icon className={cn("h-3.5 w-3.5", item.iconColor)} />
      </span>

      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm leading-snug truncate",
          item.unread ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
        )}>
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground/80 mt-0.5 line-clamp-1">
          {item.description}
        </p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">{item.time}</p>
      </div>

      <div className="flex-shrink-0 mt-2">
        {item.unread
          ? <span className="block h-2 w-2 rounded-full bg-primary" />
          : <span className="block h-2 w-2" />
        }
      </div>
    </motion.div>
  );
}

/* ─── Main component ────────────────────────────────────────── */
export function NotificationsDropdown() {
  const [isOpen, setIsOpen]       = useState(false);
  const [tab, setTab]             = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  /* Position of the dropdown panel (top-right, fixed) */
  const [pos, setPos]             = useState({ top: 0, right: 0 });
  const [mounted, setMounted]     = useState(false);

  const buttonRef    = useRef<HTMLButtonElement>(null);
  const dropdownRef  = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const displayed   = tab === "unread"
    ? notifications.filter((n) => n.unread)
    : notifications;

  /* Portal needs document to exist (SSR guard) */
  useEffect(() => { setMounted(true); }, []);

  /* Calculate position from button rect when opening */
  const toggle = useCallback(() => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top:   rect.bottom + 10,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen((v) => !v);
  }, [isOpen]);

  /* Click-outside */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inButton   = buttonRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inButton && !inDropdown) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const markRead    = (id: string) =>
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, unread: false } : n));
  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <>
      {/* ── Bell button ──────────────────────────────── */}
      <button
        ref={buttonRef}
        onClick={toggle}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg",
          "border transition-all duration-200 cursor-pointer",
          isOpen
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center",
              "rounded-full bg-error border-2 border-background",
              "text-[9px] font-bold text-white",
            )}
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      {/*
        Portal renders backdrop + dropdown directly in <body>.
        This escapes the motion.header's CSS transform, which would
        otherwise make position:fixed children clip to the 64px topbar
        instead of the full viewport.
      */}
      {mounted && isOpen && createPortal(
        <>
          {/* Backdrop — covers full viewport below topbar */}
          <div
            className="fixed inset-x-0 bottom-0 z-[998] bg-black/20 backdrop-blur-[2px]"
            style={{ top: 64 }}          /* topbar height */
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown panel */}
          <motion.div
            ref={dropdownRef}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            style={{
              top: pos.top,
              right: pos.right,
              position: "fixed",
              zIndex: 999,
              boxShadow: "0 24px 48px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
            className={cn(
              "w-[380px] max-h-[520px]",
              "rounded-2xl border border-border/60",
              "bg-card/95 backdrop-blur-2xl",
              "flex flex-col overflow-hidden",
            )}
          >
            {/* ── Header ──────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Check className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
                <button className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Settings className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* ── Tabs ────────────────────────────────── */}
            <div className="flex items-center px-4 pt-3 pb-0 border-b border-border/40">
              {(["all", "unread"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "relative px-3 pb-2.5 text-xs font-medium capitalize transition-colors",
                    tab === t
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                  {t === "unread" && unreadCount > 0 && (
                    <span className="ml-1 text-[9px] text-primary font-bold">{unreadCount}</span>
                  )}
                  {tab === t && (
                    <motion.span
                      layoutId="notif-tab-line"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* ── List ────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                    <Bell className="h-5 w-5 text-muted-foreground/40" />
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {tab === "unread" ? "All caught up!" : "No notifications"}
                  </p>
                </div>
              ) : (
                <motion.div
                  key={tab}
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  className="py-1"
                >
                  {displayed.map((item) => (
                    <NotificationItem key={item.id} item={item} onRead={markRead} />
                  ))}
                </motion.div>
              )}
            </div>

            {/* ── Footer ──────────────────────────────── */}
            <div className="border-t border-border/40 px-4 py-3">
              <button className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group">
                View all notifications
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </motion.div>
        </>,
        document.body,
      )}
    </>
  );
}
