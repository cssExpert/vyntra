// Storage service for handling file uploads across different providers
// Supports: Local filesystem, AWS S3, Uploadthing, Vercel Blob

"use client";

import React from "react";
import { API_BASE } from "./api";
import type { AdminSettings } from "./api";

export type StorageProvider = "local" | "s3" | "uploadthing" | "vercel-blob";

export interface UploadOptions {
  file: File;
  filename?: string;
  onProgress?: (progress: number) => void;
  companyId?: string;
  module?: string;
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

class StorageService {
  private settings: AdminSettings | null = null;
  private settingsPromise: Promise<AdminSettings> | null = null;

  /**
   * Load storage settings from the server.
   * Cached after first load to avoid repeated API calls.
   * Falls back to local storage if settings unavailable.
   */
  private async loadSettings(): Promise<AdminSettings> {
    if (this.settings) return this.settings;
    if (this.settingsPromise) return this.settingsPromise;

    this.settingsPromise = (async () => {
      const defaultSettings = {
        id: "default",
        siteName: "Default",
        supportEmail: "support@example.com",
        logoUrl: null,
        faviconUrl: null,
        primaryColor: "#d14c23",
        secondaryColor: "#8b5cf6",
        accentColor: "#ec4899",
        maxOrganizations: 1000,
        maxUsersPerOrganization: 500,
        enableRegistration: true,
        enableSocialAuth: false,
        maintenanceMode: false,
        storageProvider: "local" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        // Try to fetch storage config from public endpoint
        const response = await fetch(`${API_BASE}/upload/config`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const config = await response.json();
          // Use configured provider if available
          this.settings = {
            ...defaultSettings,
            storageProvider: (config.storageProvider || "local") as any,
          };
          console.log(
            "[Storage] Using provider:",
            this.settings.storageProvider || "local"
          );
          return this.settings!;
        } else {
          // Config endpoint returned error, use fallback
          console.info(
            "[Storage] Config endpoint returned",
            response.status,
            "- using local storage"
          );
          this.settings = defaultSettings;
          return this.settings!;
        }
      } catch (error) {
        // Network error, timeout, or other issue - use fallback
        console.info(
          "[Storage] Could not reach config endpoint -",
          error instanceof Error ? error.message : error,
          "- using local storage"
        );

        // Fallback to local storage
        // This is critical - uploads must always work with at minimum local storage
        this.settings = defaultSettings;
        return this.settings!;
      }
    })();

    return this.settingsPromise;
  }

  /**
   * Refresh cached settings (call after storage config is updated)
   */
  refreshSettings(): void {
    this.settings = null;
    this.settingsPromise = null;
  }

  /**
   * Upload a file using the configured storage provider
   */
  async upload(options: UploadOptions): Promise<UploadResult> {
    const settings = await this.loadSettings();
    const provider = settings.storageProvider || "local";

    switch (provider) {
      case "s3":
        return this.uploadToS3(options, settings);
      case "uploadthing":
        return this.uploadToUploadthing(options, settings);
      case "vercel-blob":
        return this.uploadToVercelBlob(options, settings);
      case "local":
      default:
        return this.uploadToLocal(options);
    }
  }

  /**
   * Upload to local server
   * Requires companyId and module for multi-tenant directory structure
   */
  private async uploadToLocal(options: UploadOptions): Promise<UploadResult> {
    const { file, filename, onProgress, companyId, module } = options;

    if (!companyId || !module) {
      throw new Error(
        "companyId and module are required for uploads (multi-tenant data isolation)"
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("companyId", companyId);
    formData.append("module", module);
    if (filename) formData.append("filename", filename);

    try {
      onProgress?.(30);

      const response = await fetch(`${API_BASE}/upload/local`, {
        method: "POST",
        body: formData,
      });

      onProgress?.(70);

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      onProgress?.(100);

      // Convert relative URL to absolute URL pointing to API server
      let url = result.url;
      if (url && url.startsWith('/uploads/')) {
        const apiBase = API_BASE.replace('/api', ''); // Get http://localhost:3001 from http://localhost:3001/api
        url = `${apiBase}${url}`;
      }

      return {
        url,
        filename: result.filename,
        size: file.size,
        mimeType: file.type,
      };
    } catch (error) {
      throw new Error(
        `Local upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Upload to AWS S3 using presigned URL
   * Requires companyId and module for multi-tenant directory structure
   */
  private async uploadToS3(
    options: UploadOptions,
    settings: AdminSettings,
  ): Promise<UploadResult> {
    if (!settings.s3Config) {
      throw new Error("S3 configuration not found");
    }

    const { file, filename: customFilename, onProgress, companyId, module } = options;

    if (!companyId || !module) {
      throw new Error(
        "companyId and module are required for uploads (multi-tenant data isolation)"
      );
    }

    const filename = customFilename || `${Date.now()}-${file.name}`;

    try {
      // Request presigned URL from backend
      onProgress?.(20);

      const presignedResponse = await fetch(
        `${API_BASE}/upload/s3/presigned-url`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename,
            contentType: file.type,
            contentLength: file.size,
            companyId,
            module,
          }),
        }
      );

      if (!presignedResponse.ok) {
        throw new Error("Failed to get presigned URL");
      }

      const { url: presignedUrl, publicUrl } =
        await presignedResponse.json();
      onProgress?.(30);

      // Upload to S3 using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      onProgress?.(90);

      if (!uploadResponse.ok) {
        throw new Error("S3 upload failed");
      }

      onProgress?.(100);

      return {
        url: publicUrl,
        filename,
        size: file.size,
        mimeType: file.type,
      };
    } catch (error) {
      throw new Error(
        `S3 upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Upload to Uploadthing
   * Requires companyId and module for multi-tenant directory structure
   */
  private async uploadToUploadthing(
    options: UploadOptions,
    settings: AdminSettings,
  ): Promise<UploadResult> {
    if (!settings.uploadthingConfig?.apiKey) {
      throw new Error("Uploadthing configuration not found");
    }

    const { file, onProgress, companyId, module } = options;

    if (!companyId || !module) {
      throw new Error(
        "companyId and module are required for uploads (multi-tenant data isolation)"
      );
    }

    try {
      onProgress?.(20);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("companyId", companyId);
      formData.append("module", module);

      const response = await fetch(`${API_BASE}/upload/uploadthing`, {
        method: "POST",
        body: formData,
      });

      onProgress?.(70);

      if (!response.ok) {
        throw new Error("Uploadthing upload failed");
      }

      const result = await response.json();
      onProgress?.(100);

      return {
        url: result.url,
        filename: result.filename || file.name,
        size: file.size,
        mimeType: file.type,
      };
    } catch (error) {
      throw new Error(
        `Uploadthing upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Upload to Vercel Blob
   * Requires companyId and module for multi-tenant directory structure
   */
  private async uploadToVercelBlob(
    options: UploadOptions,
    settings: AdminSettings,
  ): Promise<UploadResult> {
    if (!settings.vercelBlobConfig?.token) {
      throw new Error("Vercel Blob configuration not found");
    }

    const { file, filename: customFilename, onProgress, companyId, module } = options;

    if (!companyId || !module) {
      throw new Error(
        "companyId and module are required for uploads (multi-tenant data isolation)"
      );
    }

    const filename = customFilename || `${Date.now()}-${file.name}`;

    try {
      onProgress?.(20);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", filename);
      formData.append("companyId", companyId);
      formData.append("module", module);

      const response = await fetch(`${API_BASE}/upload/vercel-blob`, {
        method: "POST",
        body: formData,
      });

      onProgress?.(70);

      if (!response.ok) {
        throw new Error("Vercel Blob upload failed");
      }

      const result = await response.json();
      onProgress?.(100);

      return {
        url: result.url,
        filename: result.filename || filename,
        size: file.size,
        mimeType: file.type,
      };
    } catch (error) {
      throw new Error(
        `Vercel Blob upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get the current storage provider (without loading all settings)
   */
  async getProvider(): Promise<StorageProvider> {
    const settings = await this.loadSettings();
    return settings.storageProvider || "local";
  }

  /**
   * Delete a file (provider-specific implementation)
   */
  async delete(url: string): Promise<void> {
    const settings = await this.loadSettings();
    const provider = settings.storageProvider || "local";

    try {
      await fetch(`${API_BASE}/upload/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, provider }),
      });
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();

/**
 * React Hook for file uploads
 * Usage: const { upload, uploading, error } = useUpload();
 * Call: upload(file, { companyId, module, filename })
 */
export function useUpload() {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);

  const upload = React.useCallback(
    async (
      file: File,
      options?: Partial<Omit<UploadOptions, "file" | "onProgress">>
    ): Promise<UploadResult | null> => {
      setUploading(true);
      setError(null);
      setProgress(0);

      try {
        const result = await storageService.upload({
          file,
          ...options,
          onProgress: setProgress,
        });
        setProgress(100);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed";
        setError(message);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  return { upload, uploading, error, progress };
}
