"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "react-lottie";
import LoaderAnimation from "@/assets/ERVFlowLoader.json";
import { useAuth } from "@/providers/AuthProvider";
import { useSettings } from "@/providers/SettingsProvider";
import { useAdminSettings } from "@/providers/AdminSettingsProvider";
import { useSidebar } from "@/hooks/useSidebar";
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "@/constants/navigation";

const AUTH_PATHS = ["/login", "/signup", "/forgot-password"];
const TOPBAR_HEIGHT = 64; // Topbar is h-16

// ── Runtime Lottie tinting ───────────────────────────────────────────────────
// The loader JSON ships with the default brand orange baked into its fill
// shapes (assets[*].layers[*].shapes[*].it[*] where ty === "fl"). Instead of
// editing the file per brand, we repaint every fill/stroke with the
// organization's primary color from Settings.

/** "#F76235" → Lottie color [0.969, 0.384, 0.208, 1] (0–1 RGBA). */
function hexToLottieColor(
  hex: string,
): [number, number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
}

/** Deep-clones the animation and repaints every fill ("fl") / stroke ("st"). */
function tintLottie(data: object, hex: string): object {
  const color = hexToLottieColor(hex);
  if (!color) return data;
  const clone = JSON.parse(JSON.stringify(data)) as object;
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node && typeof node === "object") {
      const obj = node as Record<string, unknown>;
      if (
        (obj.ty === "fl" || obj.ty === "st") &&
        obj.c &&
        typeof obj.c === "object"
      ) {
        const c = obj.c as Record<string, unknown>;
        c.a = 0; // static (non-keyframed) color
        c.k = color;
      }
      Object.values(obj).forEach(walk);
    }
  };
  walk(clone);
  return clone;
}

export function NavigationProgress() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const { settings: adminSettings } = useAdminSettings();
  const { isCollapsed, isMobile } = useSidebar();

  // Repaint the loader with the brand primary color. Org settings apply for
  // tenant users; super admins have no org context, so fall back to the
  // platform-level admin branding before the hardcoded default.
  const primaryColor =
    settings?.primaryColor || adminSettings?.primaryColor || "#F76235";
  const animationData = useMemo(
    () => tintLottie(LoaderAnimation, primaryColor),
    [primaryColor],
  );
  const [loading, setLoading] = useState(false);
  const prevPathname = useRef(pathname);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Full-screen on auth pages or when not authenticated
  const isAuthPage = AUTH_PATHS.some((p) => pathname?.startsWith(p));
  const isFullScreen = isAuthPage || !isAuthenticated;

  // Mobile sidebar is an overlay — doesn't push content
  const sidebarOffset = isMobile
    ? 0
    : isCollapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : SIDEBAR_WIDTH;

  const overlayStyle = isFullScreen
    ? { inset: 0 }
    : { left: sidebarOffset, top: TOPBAR_HEIGHT, right: 0, bottom: 0 };

  // Start loader on any internal link click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      if (
        !href ||
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      )
        return;

      const targetPath = href.split("?")[0];
      if (targetPath === window.location.pathname) return;

      setLoading(true);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Stop loader once Next.js commits the new pathname
  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    if (hideTimer.current) clearTimeout(hideTimer.current);
    // Small delay so the incoming page has one frame to paint before fade-out
    hideTimer.current = setTimeout(() => setLoading(false), 120);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="page-loader"
          className="fixed z-[9999] flex flex-col items-center justify-center bg-background"
          style={overlayStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
        >
          {/* Ambient glow blobs — match the bg-mesh pattern */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute right-1/4 bottom-1/3 h-64 w-64 rounded-full bg-accent/6 blur-3xl" />
          </div>

          {/* Loader card */}
          <div className="relative flex flex-col items-center gap-1">
            {/* Lottie spinner + logo */}
            <div className="relative flex items-center justify-center">
              <Lottie
                key={primaryColor}
                options={{
                  loop: true,
                  autoplay: true,
                  animationData,
                  rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
                }}
                height={250}
                width={250}
                isClickToPauseDisabled
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
