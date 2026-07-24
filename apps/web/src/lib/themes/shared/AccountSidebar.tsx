"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  Download,
  Heart,
  Wallet,
  Trophy,
  User,
  Lock,
  ShieldCheck,
  MapPin,
  LogOut,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

const DASHBOARD_SECTION: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/account", icon: LayoutDashboard },
  { key: "quick-order", label: "Quick Order", href: "/account/quick-order", icon: ClipboardList },
  { key: "orders", label: "Orders", href: "/account/orders", icon: ShoppingBag },
  { key: "downloads", label: "My Downloads", href: "/account/downloads", icon: Download },
  { key: "wishlist", label: "Wishlist", href: "/account/wishlist", icon: Heart },
  { key: "store-credit", label: "Store Credit", href: "/account/store-credit", icon: Wallet },
  { key: "reward-points", label: "Reward Points", href: "/account/reward-points", icon: Trophy },
];

const SETTINGS_SECTION: NavItem[] = [
  { key: "profile", label: "Profile Info", href: "/account/profile", icon: User },
  { key: "change-password", label: "Change Password", href: "/account/change-password", icon: Lock },
  { key: "login-security", label: "Login Security", href: "/account/login-security", icon: ShieldCheck },
  { key: "addresses", label: "Addresses", href: "/account/addresses", icon: MapPin },
];

function isActive(pathname: string, href: string) {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavRow({ item, active, accentColor }: { item: NavItem; active: boolean; accentColor: string }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="relative flex items-center gap-3 pl-5 pr-3 py-2.5 group">
      {active && (
        <motion.span
          layoutId="account-nav-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full"
          style={{ backgroundColor: accentColor }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <Icon className="w-[18px] h-[18px] shrink-0" style={{ color: active ? accentColor : "#9ca3af" }} />
      <span
        className="text-sm font-medium transition-colors"
        style={{ color: active ? accentColor : "#374151" }}
      >
        {item.label}
      </span>
    </Link>
  );
}

export function AccountSidebar({ onLogout, accentColor = "#e4611e" }: { onLogout: () => void; accentColor?: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-white dark:bg-[#1c1c1e] border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
      <div className="py-4">
        <p className="px-5 pb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Dashboard
        </p>
        {DASHBOARD_SECTION.map((item) => (
          <NavRow key={item.key} item={item} active={isActive(pathname, item.href)} accentColor={accentColor} />
        ))}
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 py-4">
        <p className="px-5 pb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Account Settings
        </p>
        {SETTINGS_SECTION.map((item) => (
          <NavRow key={item.key} item={item} active={isActive(pathname, item.href)} accentColor={accentColor} />
        ))}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 pl-5 pr-3 py-2.5 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  );
}
