"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users2,
  FileText,
  TrendingUp,
  Gauge,
  CreditCard,
  ShoppingBag,
  Phone,
  Mail,
  UserCog,
  Settings2,
  BarChart3,
  ChevronLeft,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NAV_SECTIONS,
  SIDEBAR_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
} from "@/constants/navigation";
import type { NavItem } from "@/types";
import Icon from "@/components/common/Icon";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users2,
  FileText,
  TrendingUp,
  Gauge,
  CreditCard,
  ShoppingBag,
  Phone,
  Mail,
  UserCog,
  Settings2,
  BarChart3,
};

interface AppSidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function NavItemComponent({
  item,
  isCollapsed,
  isActive,
}: {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
}) {
  const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;

  return (
    <Link
      href={item.href}
      className={cn(
        "nav-item group relative",
        isCollapsed && "justify-center px-0",
        isActive && "active",
      )}
      title={isCollapsed ? item.label : undefined}
    >
      {/*
       * Sliding background — layoutId="nav-active-bg" means Framer Motion
       * animates this element from the previously-active item to this one
       * whenever the active route changes. Kept inset-0 so it never escapes
       * the Link's own bounds (no overflow-hidden clipping risk).
       */}
      {isActive && (
        <motion.span
          layoutId="nav-active-bg"
          className="absolute inset-0 rounded-lg bg-primary/10 dark:bg-[#404040]"
          transition={{
            type: "tween",
            duration: 0.22,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      )}

      {/*
       * Left bar indicator — simple fade-in/out; the sliding feel comes from
       * the background above. Correct position: top-1/2 -translate-y-1/2
       * centres the bar on the item row.
       */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            key="bar"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute -left-2 top-0 -translate-y-1/2 h-10 w-1 rounded-r-full bg-primary origin-center"
          />
        )}
      </AnimatePresence>

      {/* Icon — z-10 so it renders above the sliding background */}
      <span
        className={cn(
          "relative z-10 nav-icon flex-shrink-0 transition-colors",
          isActive
            ? "text-primary dark:text-white"
            : "text-muted-foreground group-hover:text-foreground",
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>

      {/* Label — z-10 so it renders above the sliding background */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 flex-1 truncate text-sm"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Badges — z-10 */}
      {!isCollapsed && item.badge && (
        <span
          className={cn(
            "relative z-10 ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
            item.badgeVariant === "info"
              ? "bg-info/15 text-info"
              : "bg-primary/15 text-primary",
          )}
        >
          {item.badge}
        </span>
      )}

      {!isCollapsed && item.isNew && (
        <span className="relative z-10 ml-auto rounded-full bg-success/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-success">
          New
        </span>
      )}
    </Link>
  );
}

export function AppSidebar({
  isCollapsed,
  isMobileOpen,
  onToggle,
  onClose,
}: AppSidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <motion.aside
      animate={{ width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "relative flex h-full flex-col bg-sidebar border-r border-sidebar-border overflow-hidden",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 flex-shrink-0 items-center border-b border-sidebar-border px-4",
          isCollapsed && "justify-center px-0",
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-primary shadow-glow-brand">
            <Icon name="Brand" size="24" className="h-6 w-6 text-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-base font-bold font-display text-foreground">
                  Vyntra
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 no-scrollbar">
        <div className="space-y-0.5 px-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.id} className="mb-1">
              {/* Section label */}
              <AnimatePresence>
                {!isCollapsed && section.label && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50"
                  >
                    {section.label}
                  </motion.div>
                )}
              </AnimatePresence>

              {isCollapsed && section.label && (
                <div className="my-2 mx-2 border-t border-sidebar-border/50" />
              )}

              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <NavItemComponent
                    key={item.id}
                    item={item}
                    isCollapsed={isCollapsed}
                    isActive={isActive}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "border-t border-sidebar-border p-3",
          isCollapsed && "flex justify-center",
        )}
      >
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-lg px-2 py-2"
            >
              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white">
                RG
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  Ravi Gupta
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  Admin
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white cursor-pointer">
              RG
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );

  return (
    <>
      {/* Desktop sidebar — relative wrapper so toggle button can escape overflow-hidden aside */}
      <div className="hidden lg:flex h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
        <button
          onClick={onToggle}
          className={cn(
            "absolute -right-3 top-20 z-20 flex",
            "h-6 w-6 items-center justify-center rounded-full",
            "border border-border bg-card shadow-glass text-muted-foreground",
            "hover:text-foreground hover:bg-muted transition-all duration-200 cursor-pointer",
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.span
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </motion.span>
        </button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: -SIDEBAR_WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_WIDTH }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-full lg:hidden"
              style={{ width: SIDEBAR_WIDTH }}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
