"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Search, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { useCommandPalette } from "@/components/layout/CommandPalette";
import { NotificationsDropdown } from "@/components/layout/NotificationsDropdown";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/crm": "CRM",
  "/cms": "CMS",
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

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const { open: openPalette } = useCommandPalette();

  const currentPage = Object.entries(PAGE_TITLES).find(([key]) =>
    key === "/" ? pathname === "/" : pathname.startsWith(key),
  );
  const pageTitle = currentPage?.[1] ?? "ERVFlow";

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "sticky top-0 z-30 flex h-16 flex-shrink-0 items-center",
        "border-b border-border bg-background/80 backdrop-blur-md",
        "px-4 sm:px-6",
      )}
    >
      <div className="flex flex-1 items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg lg:hidden",
            "border border-border bg-muted/50 text-muted-foreground",
            "hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer",
          )}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Page title — desktop */}
        <h2 className="hidden lg:block text-sm font-semibold text-foreground">
          {pageTitle}
        </h2>

        {/* Search bar */}
        <button
          onClick={openPalette}
          className={cn(
            "flex flex-1 max-w-xs min-h-9 sm:min-h-inherit md:max-w-sm items-center gap-2 rounded-lg",
            "border border-border bg-muted/50 pl-2 pr-1.5 sm:px-3 py-1 sm:py-2",
            "text-sm text-muted-foreground",
            "hover:bg-muted transition-all duration-200 cursor-pointer",
          )}
        >
          <Search className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="hidden sm:flex flex-1 text-left">
            Search anything...
          </span>
          <kbd className="ml-auto flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </kbd>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 md:pag-2 ml-4">
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationsDropdown />
        <ProfileMenu />
      </div>
    </motion.header>
  );
}
