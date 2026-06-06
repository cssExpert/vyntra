"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiGetAdminSettings, type AdminSettings } from "@/lib/api";

interface AdminSettingsContextType {
  settings: AdminSettings | null;
  loading: boolean;
  error: string | null;
}

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined);

export function AdminSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiGetAdminSettings();
        setSettings(data);
        applyAdminTheme(data);
      } catch (err) {
        // Silently fail on load - admin settings are optional and serve as defaults
        // If user isn't authenticated or can't access admin settings, just use defaults
        setSettings(null);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return (
    <AdminSettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </AdminSettingsContext.Provider>
  );
}

export function useAdminSettings() {
  const context = useContext(AdminSettingsContext);
  if (!context) {
    throw new Error("useAdminSettings must be used within AdminSettingsProvider");
  }
  return context;
}

// Apply admin theme as platform defaults (org settings will override these)
function hexToHslParts(hex: string): [number, number, number] {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return [14, 71, 48];
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : l > 0.5 ? d / (2 - max - min) : d / (max + min);
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

function applyAdminTheme(settings: AdminSettings) {
  const root = document.documentElement;

  const primary   = settings.primaryColor   || "#3b82f6";
  const secondary = settings.secondaryColor || "#8b5cf6";
  const accent    = settings.accentColor    || "#ec4899";

  const [ph, ps, pl] = hexToHslParts(primary);
  const [sh, ss, sl] = hexToHslParts(secondary);
  const [ah, as_, al] = hexToHslParts(accent);

  root.style.setProperty("--primary",       `${ph} ${ps}% ${pl}%`);
  root.style.setProperty("--primary-light", `${ph} ${ps}% ${clamp(pl + 8, 0, 95)}%`);
  root.style.setProperty("--ring",          `${ph} ${ps}% ${pl}%`);
  root.style.setProperty("--secondary",     `${sh} ${ss}% ${sl}%`);
  root.style.setProperty("--accent",        `${ah} ${as_}% ${al}%`);

  root.style.setProperty("--brand-50",  `${ph} ${ps}% ${clamp(pl + 47, 0, 98)}%`);
  root.style.setProperty("--brand-100", `${ph} ${ps}% ${clamp(pl + 40, 0, 95)}%`);
  root.style.setProperty("--brand-200", `${ph} ${ps}% ${clamp(pl + 30, 0, 90)}%`);
  root.style.setProperty("--brand-300", `${ph} ${ps}% ${clamp(pl + 19, 0, 85)}%`);
  root.style.setProperty("--brand-400", `${ph} ${ps}% ${clamp(pl + 8,  0, 80)}%`);
  root.style.setProperty("--brand-500", `${ph} ${ps}% ${pl}%`);
  root.style.setProperty("--brand-600", `${ph} ${ps}% ${clamp(pl - 8,  5, 100)}%`);
  root.style.setProperty("--brand-700", `${ph} ${ps}% ${clamp(pl - 18, 5, 100)}%`);
  root.style.setProperty("--brand-800", `${ph} ${ps}% ${clamp(pl - 27, 5, 100)}%`);
  root.style.setProperty("--brand-900", `${ph} ${ps}% ${clamp(pl - 36, 5, 100)}%`);
  root.style.setProperty("--brand-950", `${ph} ${ps}% ${clamp(pl - 40, 5, 100)}%`);

  if (settings.faviconUrl) {
    const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (link) link.href = settings.faviconUrl;
  }
}
