"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiGetOrgSettings, type OrganizationSettings } from "@/lib/api";

interface SettingsContextType {
  settings: OrganizationSettings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
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
      const message = err instanceof Error ? err.message : "Failed to load settings";
      setError(message);
      console.error("Failed to load organization settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  useEffect(() => {
    loadSettings();
  }, []);

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

function applyTheme(settings: OrganizationSettings) {
  const root = document.documentElement;

  // Apply brand colors as CSS custom properties
  root.style.setProperty("--color-primary", settings.primaryColor);
  root.style.setProperty("--color-secondary", settings.secondaryColor);
  root.style.setProperty("--color-accent", settings.accentColor);

  // Apply favicon if set
  if (settings.faviconUrl) {
    const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (link) {
      link.href = settings.faviconUrl;
    }
  }
}
