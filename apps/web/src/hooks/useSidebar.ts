"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "vyntra-sidebar-collapsed";
const MOBILE_BREAKPOINT = 1024;

export function useSidebar() {
  /*
   * Read from localStorage synchronously inside the useState initializer.
   * This runs before the first render on the client, so the sidebar never
   * flashes the wrong state on reload.
   * The `typeof window` guard handles the SSR pass where localStorage is
   * unavailable — server always starts expanded, client corrects immediately.
   */
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored !== null ? (JSON.parse(stored) as boolean) : false;
    } catch {
      return false;
    }
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile]         = useState(false);

  /* Mobile breakpoint watcher — localStorage read no longer needed here */
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggle = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [isMobile]);

  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  return { isCollapsed, isMobileOpen, isMobile, toggle, closeMobile };
}
