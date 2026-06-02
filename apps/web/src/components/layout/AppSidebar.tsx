"use client";

import { useState, useEffect, useMemo } from "react";
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
  Building2,
  Package,
  Boxes,
  ChevronLeft,
  ChevronDown,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NAV_SECTIONS,
  SUPER_ADMIN_NAV,
  SIDEBAR_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
} from "@/constants/navigation";
import type { NavItem } from "@/types";
import Icon from "@/components/common/Icon";
import { useAuth } from "@/providers/AuthProvider";

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
  Building2,
  Package,
  Boxes,
};

interface AppSidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

/* ─── Sub-item (bullet style) ───────────────────────────────── */
function SubNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 pl-9 pr-3 py-1.5 rounded-lg text-sm transition-colors duration-150",
        isActive
          ? "text-foreground font-semibold"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full flex-shrink-0 transition-colors duration-150",
          isActive ? "bg-primary" : "bg-muted-foreground/35",
        )}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

/* ─── Main nav item ─────────────────────────────────────────── */
function NavItemComponent({
  item,
  isCollapsed,
  isActive,
  isExpanded,
  onToggle,
  pathname,
}: {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  pathname: string;
}) {
  const NavIcon = ICON_MAP[item.icon] ?? LayoutDashboard;
  const hasChildren = !!item.children?.length;

  const inner = (
    <>
      {/* Sliding background */}
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

      {/* Left bar indicator */}
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

      {/* Icon */}
      <span
        className={cn(
          "relative z-10 nav-icon flex-shrink-0 transition-colors",
          isActive
            ? "text-primary dark:text-white"
            : "text-muted-foreground group-hover:text-foreground",
        )}
      >
        <NavIcon className="h-[18px] w-[18px]" />
      </span>

      {/* Label — opacity only; sidebar overflow-hidden clips it as width shrinks */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.1, duration: 0.15 } }}
            exit={{ opacity: 0, transition: { duration: 0.07 } }}
            className="relative z-10 truncate text-sm"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Badges */}
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

      {/* Expand chevron for items with children */}
      {!isCollapsed && hasChildren && (
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 ml-auto text-muted-foreground"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      )}
    </>
  );

  /* Items with children: button (toggles submenu) + navigates on click */
  if (hasChildren) {
    return (
      <button
        onClick={onToggle}
        className={cn(
          "nav-item group relative w-full",
          isCollapsed && "justify-center px-0",
          isActive && "active",
        )}
      >
        {inner}
      </button>
    );
  }

  /* Regular items: Link */
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
      {inner}
    </Link>
  );
}

/* ─── AppSidebar ────────────────────────────────────────────── */
export function AppSidebar({
  isCollapsed,
  isMobileOpen,
  onToggle,
  onClose,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { hasModule, user, isSuperAdmin } = useAuth();

  /* Super admins get the platform-admin menu; companies get a nav filtered to
     the modules their package entitles. */
  const sections = useMemo(() => {
    if (isSuperAdmin) return SUPER_ADMIN_NAV;
    return NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.module || hasModule(item.module),
      ),
    })).filter((section) => section.items.length > 0);
  }, [hasModule, isSuperAdmin]);

  /* Track which items are expanded by their id */
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    sections.forEach((section) =>
      section.items.forEach((item) => {
        if (
          item.children?.some(
            (c) => pathname.startsWith(c.href) || pathname === c.href,
          )
        ) {
          initial.add(item.id);
        }
        /* Also expand if the parent route itself is active and has children */
        if (item.children?.length && pathname.startsWith(item.href)) {
          initial.add(item.id);
        }
      }),
    );
    return initial;
  });

  /* Auto-expand when navigating to a child route */
  useEffect(() => {
    sections.forEach((section) =>
      section.items.forEach((item) => {
        if (
          item.children?.some(
            (c) => pathname === c.href || pathname.startsWith(c.href),
          ) ||
          (item.children?.length && pathname.startsWith(item.href))
        ) {
          setExpandedItems((prev) => new Set(prev).add(item.id));
        }
      }),
    );
  }, [pathname, sections]);

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sidebarContent = (
    <motion.aside
      animate={{ width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
      className="relative flex h-full flex-col bg-sidebar border-r border-sidebar-border overflow-hidden"
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
                initial={{ opacity: 0, x: -6 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: { delay: 0.08, duration: 0.18 },
                }}
                exit={{ opacity: 0, x: -6, transition: { duration: 0.07 } }}
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
          {sections.map((section) => (
            <div key={section.id} className="mb-1">
              {/* Section label */}
              <AnimatePresence>
                {!isCollapsed && section.label && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { delay: 0.12, duration: 0.15 },
                    }}
                    exit={{ opacity: 0, transition: { duration: 0.07 } }}
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
                const hasChildren = !!item.children?.length;
                const isExpanded = expandedItems.has(item.id);

                /* Active if exact match OR any child is active */
                const isActive =
                  pathname === item.href ||
                  (!hasChildren &&
                    item.href !== "/dashboard" &&
                    pathname.startsWith(item.href)) ||
                  (hasChildren &&
                    !!item.children?.some(
                      (c) => pathname === c.href || pathname.startsWith(c.href),
                    ));

                return (
                  <div key={item.id}>
                    <NavItemComponent
                      item={item}
                      isCollapsed={isCollapsed}
                      isActive={isActive}
                      isExpanded={isExpanded}
                      onToggle={() => toggleItem(item.id)}
                      pathname={pathname}
                    />

                    {/* Submenu */}
                    <AnimatePresence initial={false}>
                      {hasChildren && isExpanded && !isCollapsed && (
                        <motion.div
                          key={`sub-${item.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.22,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <div className="py-1">
                            {item.children!.map((child) => {
                              const childActive =
                                pathname === child.href ||
                                pathname.startsWith(child.href);
                              return (
                                <SubNavItem
                                  key={child.id}
                                  item={child}
                                  isActive={childActive}
                                />
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
              animate={{
                opacity: 1,
                transition: { delay: 0.1, duration: 0.15 },
              }}
              exit={{ opacity: 0, transition: { duration: 0.07 } }}
              className="flex items-center gap-3 rounded-lg px-2 py-2"
            >
              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white">
                {user?.initials ?? "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  {user?.name ?? "Account"}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {user?.role ?? ""}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white cursor-pointer">
              {user?.initials ?? "?"}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
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
