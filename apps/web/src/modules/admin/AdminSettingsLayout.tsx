"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, HardDrive, Mail, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { MotionTabs } from "@/components/ui/MotionTabs";
import type { MotionTabItem } from "@/components/ui/MotionTabs";

const SETTINGS_TABS: MotionTabItem[] = [
  {
    id: "app",
    label: "App Settings",
    icon: Settings,
    href: "/admin/settings",
  },
  {
    id: "storage",
    label: "Storage",
    icon: HardDrive,
    href: "/admin/settings/storage",
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    href: "/admin/settings/email",
  },
  {
    id: "payment",
    label: "Payment",
    icon: CreditCard,
    href: "/admin/settings/payment",
  },
];

const SETTINGS_SIDEBAR = [
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
        <nav className="sticky top-6 space-y-1">
          {SETTINGS_SIDEBAR.map((tab) => {
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
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isActive ? "text-primary" : "text-foreground",
                    )}
                  >
                    {tab.label}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-0.5 truncate",
                      isActive ? "text-primary/70" : "text-muted-foreground",
                    )}
                  >
                    {tab.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Mobile tabs ─────────────────────────────────────────────────────── */}
      <MotionTabs
        tabs={SETTINGS_TABS}
        active={activeTab}
        layoutId="admin-settings-tabs"
        className="lg:hidden mb-6"
      />

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
