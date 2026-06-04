import { INITIAL_GALLERIES } from "./gallery.data";
import type { Gallery } from "./gallery.types";

const KEY = "vyntra_galleries";

export function loadGalleries(): Gallery[] {
  if (typeof window === "undefined") return INITIAL_GALLERIES;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Gallery[]) : INITIAL_GALLERIES;
  } catch {
    return INITIAL_GALLERIES;
  }
}

export function saveGalleries(galleries: Gallery[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(galleries));
}

export function updateGalleryCover(galleryId: string, coverUrl: string): void {
  const all = loadGalleries();
  saveGalleries(all.map((g) => (g.id === galleryId ? { ...g, coverUrl } : g)));
}
