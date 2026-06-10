"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SITE_LANGUAGES, getLang } from "@/lib/site-languages";

interface Props {
  orgId: string;
  available: string[];
  defaultLang: string;
  activeLang: string; // resolved by RSC from cookie
}

function storageKey(orgId: string) {
  return `vyntra_site_lang_${orgId}`;
}

export function SiteLanguageSwitcher({ orgId, available, defaultLang, activeLang }: Props) {
  const langs = SITE_LANGUAGES.filter((l) => available.includes(l.code));
  const router = useRouter();
  const [active, setActive] = useState(activeLang);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Keep local state in sync if RSC passes a new activeLang (e.g. after refresh)
  useEffect(() => {
    setActive(activeLang);
  }, [activeLang]);

  // Keep <html lang> correct for browser auto-translate + screen readers
  useEffect(() => {
    document.documentElement.lang = active;
  }, [active]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const select = (code: string) => {
    setActive(code); // optimistic update — no flash on refresh
    setOpen(false);
    // Persist in localStorage for fast reads
    localStorage.setItem(storageKey(orgId), code);
    // Set cookie — RSC reads this on next render
    document.cookie = `vyntra_site_lang=${code}; path=/; max-age=31536000; SameSite=Lax`;
    // Re-run RSC so page content re-fetches with the new language
    router.refresh();
  };

  if (langs.length <= 1) return null;

  const current = getLang(active);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80 select-none"
        style={{
          background: "color-mix(in srgb, var(--foreground, #111827) 8%, transparent)",
          color: "var(--foreground, #111827)",
          border: "1px solid color-mix(in srgb, var(--foreground, #111827) 15%, transparent)",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="tracking-wide uppercase">{current.code}</span>
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1.5 w-44 rounded-xl shadow-xl overflow-hidden z-50"
          style={{
            background: "var(--background, #ffffff)",
            border: "1px solid var(--border, #e5e7eb)",
          }}
          role="listbox"
        >
          {langs.map((lang) => {
            const isActive = lang.code === active;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isActive}
                onClick={() => select(lang.code)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:opacity-80"
                style={{
                  background: isActive
                    ? "color-mix(in srgb, var(--primary, #3b82f6) 10%, transparent)"
                    : "transparent",
                  color: isActive
                    ? "var(--primary, #3b82f6)"
                    : "var(--foreground, #111827)",
                }}
              >
                <span className="text-base leading-none shrink-0">{lang.flag}</span>
                <span className="flex-1 font-medium truncate">{lang.native}</span>
                {isActive && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
