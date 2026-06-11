export type Locale = "en" | "hi" | "fr";

export const defaultLocale: Locale = "en";
export const locales: Locale[] = ["en", "hi", "fr"];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  fr: "Français",
};

/** Flag shown next to each language and on the switcher trigger button. */
export const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  hi: "🇮🇳",
  fr: "🇫🇷",
};
