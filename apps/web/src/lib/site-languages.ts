export interface SiteLanguage {
  code: string;
  name: string;    // English name
  native: string;  // Name in that language
  flag: string;    // Emoji flag
}

export const SITE_LANGUAGES: SiteLanguage[] = [
  { code: "en", name: "English",    native: "English",            flag: "🇬🇧" },
  { code: "hi", name: "Hindi",      native: "हिन्दी",              flag: "🇮🇳" },
  { code: "fr", name: "French",     native: "Français",           flag: "🇫🇷" },
  { code: "de", name: "German",     native: "Deutsch",            flag: "🇩🇪" },
  { code: "es", name: "Spanish",    native: "Español",            flag: "🇪🇸" },
  { code: "it", name: "Italian",    native: "Italiano",           flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", native: "Português",          flag: "🇧🇷" },
  { code: "ar", name: "Arabic",     native: "العربية",            flag: "🇸🇦" },
  { code: "zh", name: "Chinese",    native: "中文",               flag: "🇨🇳" },
  { code: "ja", name: "Japanese",   native: "日本語",             flag: "🇯🇵" },
  { code: "ko", name: "Korean",     native: "한국어",             flag: "🇰🇷" },
  { code: "ru", name: "Russian",    native: "Русский",            flag: "🇷🇺" },
  { code: "nl", name: "Dutch",      native: "Nederlands",         flag: "🇳🇱" },
  { code: "tr", name: "Turkish",    native: "Türkçe",             flag: "🇹🇷" },
  { code: "pl", name: "Polish",     native: "Polski",             flag: "🇵🇱" },
  { code: "sv", name: "Swedish",    native: "Svenska",            flag: "🇸🇪" },
  { code: "da", name: "Danish",     native: "Dansk",              flag: "🇩🇰" },
  { code: "fi", name: "Finnish",    native: "Suomi",              flag: "🇫🇮" },
  { code: "no", name: "Norwegian",  native: "Norsk",              flag: "🇳🇴" },
  { code: "cs", name: "Czech",      native: "Čeština",            flag: "🇨🇿" },
  { code: "uk", name: "Ukrainian",  native: "Українська",         flag: "🇺🇦" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia",   flag: "🇮🇩" },
  { code: "ms", name: "Malay",      native: "Bahasa Melayu",      flag: "🇲🇾" },
  { code: "th", name: "Thai",       native: "ภาษาไทย",            flag: "🇹🇭" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt",         flag: "🇻🇳" },
];

export function getLang(code: string): SiteLanguage {
  return SITE_LANGUAGES.find((l) => l.code === code) ?? SITE_LANGUAGES[0];
}
