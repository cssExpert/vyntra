import type { Gallery } from "../gallery/gallery.types";
import type { EditorNode } from "@/types/editor";
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

export function updateCustomTheme(id: string, patch: Partial<Gallery>): void {
  if (typeof window === "undefined") return;
  try {
    const updated = loadCustomThemes().map((t) =>
      t.id === id ? { ...t, ...patch } : t,
    );
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export function deleteCustomTheme(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const updated = loadCustomThemes().filter((t) => t.id !== id);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // silently fail
  }
}

export function loadAllThemes(): Gallery[] {
  const custom = loadCustomThemes();
  return [...custom, ...THEMES_DATA];
}

// ── Per-theme node storage (for custom/uploaded themes) ─────────────────────
const NODES_KEY = "vyntra_theme_nodes";

type NodesMap = Record<string, EditorNode[]>;

function readNodesMap(): NodesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(NODES_KEY);
    return raw ? (JSON.parse(raw) as NodesMap) : {};
  } catch { return {}; }
}

export function saveThemeNodes(id: string, nodes: EditorNode[]): void {
  if (typeof window === "undefined") return;
  try {
    const map = readNodesMap();
    map[id] = nodes;
    localStorage.setItem(NODES_KEY, JSON.stringify(map));
  } catch {}
}

export function loadThemeNodes(id: string): EditorNode[] | null {
  const map = readNodesMap();
  return map[id] ?? null;
}

export function deleteThemeNodes(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const map = readNodesMap();
    delete map[id];
    localStorage.setItem(NODES_KEY, JSON.stringify(map));
  } catch {}
}
