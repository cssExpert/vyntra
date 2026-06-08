"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "react-lottie";
import LoaderAnimation from "@/assets/ERVFlowLoader.json";
import { useAuth } from "@/providers/AuthProvider";
import { useSidebar } from "@/hooks/useSidebar";
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "@/constants/navigation";

const AUTH_PATHS = ["/login", "/signup", "/forgot-password"];
const TOPBAR_HEIGHT = 64; // Topbar is h-16

export function NavigationProgress() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { isCollapsed, isMobile } = useSidebar();
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
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: LoaderAnimation,
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
