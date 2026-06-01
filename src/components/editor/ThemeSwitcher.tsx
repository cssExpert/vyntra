"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      role="switch"
      aria-checked={isDark}
      title={isDark ? "Switch to Light" : "Switch to Dark"}
      className={cn(
        "relative flex items-center w-17 h-9 rounded-md cursor-pointer transition-colors duration-300 shadow-sm focus:outline-none",
        isDark ? "bg-primary" : "bg-card",
      )}
    >
      <Sun
        className={cn(
          "absolute left-1.5 w-3 h-3 transition-opacity",
          isDark ? "text-black opacity-40" : "text-primary opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute right-1.5 w-3 h-3 transition-opacity",
          isDark ? "text-black opacity-60" : "text-muted-foreground opacity-40",
        )}
      />

      <motion.div
        layout
        transition={{ type: "spring", stiffness: 600, damping: 38 }}
        className={cn(
          "absolute w-7 h-7 rounded-sm flex items-center justify-center",
          isDark ? "bg-black right-0.75" : "bg-muted left-0.75",
        )}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-primary fill-current" />
        ) : (
          <Sun className="w-4 h-4 text-primary fill-current" />
        )}
      </motion.div>
    </button>
  );
}
