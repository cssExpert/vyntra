"use client";

import { useEffect, useRef, useState } from "react";
import { SITE_LANGUAGES, getLang } from "@/lib/site-languages";

interface Props {
  orgId: string;
  available: string[];   // language codes enabled by admin
  defaultLang: string;
}

function storageKey(orgId: string) {
  return `vyntra_site_lang_${orgId}`;
}

export function SiteLanguageSwitcher({ orgId, available, defaultLang }: Props) {
  const langs = SITE_LANGUAGES.filter((l) => available.includes(l.code));
  const [active, setActive] = useState(defaultLang);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Read stored preference on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey(orgId));
    if (stored && available.includes(stored)) {
      setActive(stored);
    }
  }, [orgId, available]);

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
    setActive(code);
    localStorage.setItem(storageKey(orgId), code);
    setOpen(false);
    // Set cookie so SSR pages can read the preference on next navigation
    document.cookie = `vyntra_site_lang=${code}; path=/; max-age=31536000; SameSite=Lax`;
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
