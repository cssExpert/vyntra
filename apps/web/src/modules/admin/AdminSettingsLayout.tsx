"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  HardDrive,
  Mail,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = [
  {
    id: "app",
    label: "App Settings",
    description: "General platform configuration",
    icon: Settings,
    href: "/admin/settings",
  },
  {
    id: "storage",
    label: "Storage",
    description: "Cloud storage & file management",
    icon: HardDrive,
    href: "/admin/settings/storage",
  },
  {
    id: "email",
    label: "Email",
    description: "SMTP and email provider settings",
    icon: Mail,
    href: "/admin/settings/email",
  },
  {
    id: "payment",
    label: "Payment Methods",
    description: "Payment provider configuration",
    icon: CreditCard,
    href: "/admin/settings/payment",
  },
];

function getActiveTab(pathname: string): string {
  if (pathname === "/admin/settings") return "app";
  if (pathname === "/admin/settings/storage") return "storage";
  if (pathname === "/admin/settings/email") return "email";
  if (pathname === "/admin/settings/payment") return "payment";
  return "app";
}

export function AdminSettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  return (
    <div className="flex gap-6 lg:gap-8">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:block w-64 shrink-0">
        <nav className="sticky top-24 space-y-1">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "flex items-start gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/60",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 mt-0.5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <div className="min-w-0">
                  <p className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-primary" : "text-foreground",
                  )}>
                    {tab.label}
                  </p>
                  <p className={cn(
                    "text-xs mt-0.5 truncate",
                    isActive
                      ? "text-primary/70"
                      : "text-muted-foreground",
                  )}>
                    {tab.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Mobile tabs ─────────────────────────────────────────────────────── */}
      <div className="lg:hidden mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 whitespace-nowrap text-sm font-medium transition-all duration-200 shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
