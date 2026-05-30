"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  Command,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { useCommandPalette } from "@/components/layout/CommandPalette";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/crm": "CRM",
  "/cms": "CMS / Editor",
  "/seo": "SEO Tools",
  "/lighthouse": "Lighthouse",
  "/payments": "Payments",
  "/store": "Store",
  "/calling": "Calling",
  "/email": "Email Automations",
  "/users": "Users",
  "/reports": "Reports",
  "/settings": "Settings",
};

interface TopbarProps {
  onMenuClick: () => void;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light", icon: Sun },
    { value: "dark", icon: Moon },
    { value: "system", icon: Monitor },
  ];

  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
      {themes.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200 cursor-pointer",
            theme === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={`${value} mode`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

function NotificationButton() {
  return (
    <button
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-lg",
        "border border-border bg-muted/50 text-muted-foreground",
        "hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer"
      )}
      aria-label="Notifications"
    >
      <Bell className="h-4 w-4" />
      {/* unread dot */}
      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error border-2 border-background" />
    </button>
  );
}


export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const { open: openPalette } = useCommandPalette();

  const currentPage = Object.entries(PAGE_TITLES).find(([key]) =>
    key === "/" ? pathname === "/" : pathname.startsWith(key)
  );
  const pageTitle = currentPage?.[1] ?? "Vyntra";

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "sticky top-0 z-30 flex h-16 flex-shrink-0 items-center",
        "border-b border-border bg-background/80 backdrop-blur-md",
        "px-4 sm:px-6"
      )}
    >
      <div className="flex flex-1 items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg lg:hidden",
            "border border-border bg-muted/50 text-muted-foreground",
            "hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer"
          )}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Page title — desktop */}
        <h2 className="hidden lg:block text-sm font-semibold text-foreground">{pageTitle}</h2>

        {/* Search bar */}
        <button
          onClick={openPalette}
          className={cn(
            "flex flex-1 max-w-sm items-center gap-2 rounded-lg",
            "border border-border bg-muted/50 px-3 py-2",
            "text-sm text-muted-foreground",
            "hover:bg-muted transition-all duration-200 cursor-pointer"
          )}
        >
          <Search className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="flex-1 text-left">Search anything...</span>
          <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </kbd>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-4">
        <ThemeToggle />
        <NotificationButton />
        <ProfileMenu />
      </div>
    </motion.header>
  );
}
