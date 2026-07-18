/**
 * Injects a Google Fonts stylesheet <link> for the given family (once).
 * Mirrors the loader used by the Brand Kit FontPicker so picked fonts render
 * anywhere they're applied.
 */
export function loadGoogleFont(font?: string | null): void {
  if (!font || typeof document === "undefined") return;
  const id = `gfont-${font.replace(/ /g, "+")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(
    / /g,
    "+",
  )}:wght@400;600;700&display=swap`;
  document.head.appendChild(link);
}
