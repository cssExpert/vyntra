"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Laptop,
  Tablet,
  Smartphone,
  ExternalLink,
  RefreshCw,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSitePreviewUrl } from "@/hooks/useSitePreviewUrl";

type Device = "desktop" | "tablet" | "mobile";

const DEVICES: {
  id: Device;
  label: string;
  icon: LucideIcon;
  width: string;
}[] = [
  { id: "desktop", label: "Desktop", icon: Laptop, width: "100%" },
  { id: "tablet", label: "Tablet", icon: Tablet, width: "768px" },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: "390px" },
];

export function PreviewWebsiteView() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("cms.previewwebsite.tsx");
  const { previewUrl } = useSitePreviewUrl();
  const [device, setDevice] = useState<Device>("desktop");
  const [reloadKey, setReloadKey] = useState(0);

  const siteUrl = previewUrl();
  const currentDevice = DEVICES.find((d) => d.id === device)!;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Preview Website
          </span>
          {siteUrl && (
            <span className="text-xs text-muted-foreground font-mono truncate max-w-[260px]">
              {siteUrl}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Device switcher */}
          <div className="flex bg-muted rounded-lg p-0.5 border border-border">
            {DEVICES.map((dev) => {
              const Icon = dev.icon;
              return (
                <button
                  key={dev.id}
                  onClick={() => setDevice(dev.id)}
                  title={dev.label}
                  className={`p-1.5 rounded-md transition-all ${
                    device === dev.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>

          {/* Reload */}
          {siteUrl && (
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              title="Reload preview"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Open in new tab */}
          {siteUrl && (
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                bg-primary hover:bg-primary-600 text-primary-foreground transition-colors"
            >
              Open in new tab
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-muted/40 flex items-start justify-center p-6">
        {!siteUrl ? (
          <NoDomainState />
        ) : (
          <motion.div
            key={device}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            style={{ width: currentDevice.width, maxWidth: "100%" }}
            className="flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-border bg-card"
          >
            {/* Browser chrome */}
            <div className="shrink-0 px-4 py-2.5 bg-muted border-b border-border flex items-center gap-2">
              <div className="flex gap-1.5 shrink-0">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="flex-1 text-center text-[11px] font-mono text-muted-foreground truncate px-4">
                {siteUrl}
              </span>
            </div>

            {/* Iframe */}
            <iframe
              key={reloadKey}
              src={siteUrl ?? ""}
              title="Site preview"
              className="w-full border-0"
              style={{ height: "calc(100vh - 200px)", minHeight: 400 }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function NoDomainState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 max-w-sm">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-5 border border-border">
        <Globe className="w-7 h-7 text-muted-foreground" />
      </div>
      <h2 className="text-base font-semibold text-foreground mb-2">
        No domain configured
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your site needs a subdomain or custom domain before it can be previewed.
        Ask your super admin to set one in{" "}
        <strong>Admin → Organizations → Domains</strong>.
      </p>
    </div>
  );
}
