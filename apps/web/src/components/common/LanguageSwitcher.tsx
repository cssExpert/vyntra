"use client";

import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { localeLabels, type Locale, locales } from "@/i18n/config";

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get current locale from cookie
    const cookies = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXT_LOCALE="));
    const locale = (cookies?.split("=")[1] || "en") as Locale;
    setCurrentLocale(locale);
  }, []);

  const handleChangeLocale = (locale: Locale) => {
    console.log("🌐 [Before] Switching to:", locale);
    console.log("🌐 [Before] Current cookie:", document.cookie);

    // Set cookie with proper options
    const date = new Date();
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
    const cookieString = `NEXT_LOCALE=${locale};path=/;expires=${date.toUTCString()};SameSite=Lax`;
    document.cookie = cookieString;

    console.log("🌐 [After] Cookie set:", document.cookie);
    console.log("🌐 [After] Cookie string was:", cookieString);

    setCurrentLocale(locale);
    setIsOpen(false);
    // Reload to apply locale change
    setTimeout(() => {
      console.log("🌐 Reloading page...");
      window.location.reload();
    }, 100);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          "border border-border bg-muted/50 text-muted-foreground",
          "hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer",
        )}
        aria-label="Change language"
        title={localeLabels[currentLocale]}
      >
        <Globe className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 rounded-lg border border-border bg-background shadow-lg z-50">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleChangeLocale(locale)}
              className={cn(
                "w-full px-3 py-2 text-sm text-left transition-colors",
                "hover:bg-muted",
                currentLocale === locale && "bg-primary/10 text-primary font-semibold",
              )}
            >
              {localeLabels[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
