import type { Gallery } from "../gallery/gallery.types";
import { THEMES_DATA } from "./themes.data";

const KEY = "vyntra_custom_themes";

export function loadCustomThemes(): Gallery[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Gallery[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomTheme(theme: Gallery): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadCustomThemes();
    const updated = [theme, ...existing.filter((t) => t.id !== theme.id)];
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // silently fail
  }
}

export function loadAllThemes(): Gallery[] {
  const custom = loadCustomThemes();
  return [...custom, ...THEMES_DATA];
}
