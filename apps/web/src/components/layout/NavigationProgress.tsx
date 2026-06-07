"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/common/Icon";

export function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const prevPathname = useRef(pathname);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
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
          <div className="relative flex flex-col items-center gap-6">
            {/* Spinning outer ring */}
            <div className="relative flex items-center justify-center">
              {/* Outermost faint ring */}
              <motion.span
                className="absolute h-24 w-24 rounded-2xl border border-primary/15"
                animate={{ rotate: -360, scale: [1, 1.04, 1] }}
                transition={{
                  rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
              />

              {/* Inner counter-spinning ring */}
              <motion.span
                className="absolute h-14 w-14 rounded-xl"
                style={{
                  borderWidth: "1.5px",
                  borderStyle: "solid",
                  borderTopColor: "transparent",
                  borderRightColor: "hsl(var(--primary) / 0.5)",
                  borderBottomColor: "hsl(var(--primary) / 0.25)",
                  borderLeftColor: "transparent",
                  borderRadius: "14px",
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              />

              {/* Logo box */}
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-brand">
                <Icon name="Logo" size="24" className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Pulsing dots */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1, 0.8] }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    delay: i * 0.18,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
