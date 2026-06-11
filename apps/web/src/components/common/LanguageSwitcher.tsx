"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Languages, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { localeFlags, localeLabels, type Locale, locales } from "@/i18n/config";

/* Same dropdown motion as NotificationsDropdown / ProfileMenu */
const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 420,
      damping: 28,
      mass: 0.7,
    },
  },
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Portal needs document to exist (SSR guard) */
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Get current locale from cookie
    const cookies = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXT_LOCALE="));
    const locale = (cookies?.split("=")[1] || "en") as Locale;
    setCurrentLocale(locale);
  }, []);

  /* Calculate position from button rect when opening */
  const toggle = useCallback(() => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 10,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen((v) => !v);
  }, [isOpen]);

  /* Click-outside */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inButton = buttonRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inButton && !inDropdown) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const handleChangeLocale = (locale: Locale) => {
    const date = new Date();
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `NEXT_LOCALE=${locale};path=/;expires=${date.toUTCString()};SameSite=Lax`;
    setCurrentLocale(locale);
    setIsOpen(false);
    // Reload to apply locale change
    window.location.reload();
  };

  return (
    <>
      {/* ── Globe button ─────────────────────────────── */}
      <button
        ref={buttonRef}
        onClick={toggle}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          "border transition-all duration-200 cursor-pointer",
          isOpen
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        aria-label="Change language"
        title={localeLabels[currentLocale]}
      >
        <span className="text-base leading-none" aria-hidden>
          {localeFlags[currentLocale] ?? <Languages className="h-4 w-4" />}
        </span>
      </button>

      {/*
        Portal renders backdrop + dropdown directly in <body>, escaping the
        topbar's CSS transform (same approach as NotificationsDropdown).
      */}
      {mounted &&
        isOpen &&
        createPortal(
          <>
            {/* Backdrop — covers full viewport below topbar */}
            <div
              className="fixed inset-x-0 bottom-0 z-[998] bg-black/20 backdrop-blur-[2px]"
              style={{ top: 64 }} /* topbar height */
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown panel */}
            <motion.div
              ref={dropdownRef}
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              style={{
                top: pos.top,
                right: pos.right,
                position: "fixed",
                zIndex: 999,
                boxShadow:
                  "0 24px 48px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
              }}
              className={cn(
                "w-52",
                "rounded-2xl border border-border/60",
                "bg-card/95 backdrop-blur-2xl",
                "flex flex-col overflow-hidden",
              )}
            >
              {/* ── Header ──────────────────────────────── */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <Languages className="h-3.5 w-3.5 text-primary" />
                </span>
                <span className="text-sm font-semibold text-foreground">
                  Language
                </span>
              </div>

              {/* ── Locale list ─────────────────────────── */}
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="py-1.5"
              >
                {locales.map((locale) => {
                  const active = currentLocale === locale;
                  return (
                    <motion.button
                      key={locale}
                      variants={itemVariants}
                      onClick={() => handleChangeLocale(locale)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-left",
                        "hover:bg-muted/60 transition-colors duration-150 cursor-pointer",
                        active
                          ? "font-semibold text-primary"
                          : "text-foreground",
                      )}
                    >
                      <span className="text-base leading-none" aria-hidden>
                        {localeFlags[locale]}
                      </span>
                      <span className="flex-1">{localeLabels[locale]}</span>
                      {active && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          </>,
          document.body,
        )}
    </>
  );
}
