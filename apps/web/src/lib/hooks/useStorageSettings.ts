"use client";

import { useCallback } from "react";
import { storageService } from "@/lib/storage";

/**
 * Hook for managing storage settings refresh across the app
 * Call this after updating storage settings to reload configuration
 */
export function useStorageSettings() {
  const refreshSettings = useCallback(() => {
    storageService.refreshSettings();
  }, []);

  const reloadSettings = useCallback(async () => {
    refreshSettings();
    // Force reload of settings on next upload
    return storageService.getProvider();
  }, [refreshSettings]);

  return { refreshSettings, reloadSettings };
}
