"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiGetOrgSettings, type OrganizationSettings, ApiError } from "@/lib/api";
import { useAuth } from "./AuthProvider";

interface SettingsContextType {
  settings: OrganizationSettings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGetOrgSettings();
      setSettings(data);
      applyTheme(data);
    } catch (err) {
      // Handle "No organization context" errors
      if (err instanceof ApiError && err.status === 400) {
        const message = err.message || "No organization context";
        setError(message);
        setSettings(null);
      } else {
        const message = err instanceof Error ? err.message : "Failed to load settings";
        setError(message);
        console.error("Failed to load organization settings:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  useEffect(() => {
    // Only load settings after auth is checked and user is authenticated
    if (!authLoading && isAuthenticated) {
      loadSettings();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}

const BRAND_DEFAULTS = {
  primary:   "#d14c23", // Flamingo 500
  secondary: "#8b5cf6", // Purple
  accent:    "#ec4899", // Pink
} as const;

function hexToHslParts(hex: string): [number, number, number] {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return [14, 71, 48]; // Flamingo fallback
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

function applyTheme(settings: OrganizationSettings) {
  const root = document.documentElement;

  const primary   = settings.primaryColor   || BRAND_DEFAULTS.primary;
  const secondary = settings.secondaryColor || BRAND_DEFAULTS.secondary;
  const accent    = settings.accentColor    || BRAND_DEFAULTS.accent;

  const [ph, ps, pl] = hexToHslParts(primary);
  const [sh, ss, sl] = hexToHslParts(secondary);
  const [ah, as_, al] = hexToHslParts(accent);

  // Core semantic variables (consumed as hsl(var(--primary)))
  root.style.setProperty("--primary",       `${ph} ${ps}% ${pl}%`);
  root.style.setProperty("--ring",          `${ph} ${ps}% ${pl}%`);
  root.style.setProperty("--secondary",     `${sh} ${ss}% ${sl}%`);
  root.style.setProperty("--accent",        `${ah} ${as_}% ${al}%`);

  // Lighter tint of primary (+8 L) — used by gradients so they update too
  root.style.setProperty("--primary-light", `${ph} ${ps}% ${Math.min(pl + 8, 95)}%`);

  if (settings.faviconUrl) {
    const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (link) link.href = settings.faviconUrl;
  }
}
