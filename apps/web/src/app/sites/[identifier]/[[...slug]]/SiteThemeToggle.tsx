"use client";

import { useTheme } from "next-themes";

// Sun icon — shown in dark mode (click → go light)
function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

// Moon icon — shown in light mode (click → go dark)
function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  );
}

export function SiteThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    // suppressHydrationWarning: server renders light-mode icon, client corrects after hydration — no mismatch error
    <button
      suppressHydrationWarning
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="site-theme-toggle flex items-center justify-center w-8 h-8 rounded-full transition-all hover:opacity-70 shrink-0"
      style={{ color: "var(--foreground, #111827)" }}
    >
      {/* Moon visible in light mode, Sun visible in dark mode — CSS drives this */}
      <span className="block dark:hidden"><MoonIcon /></span>
      <span className="hidden dark:block"><SunIcon /></span>
    </button>
  );
}
