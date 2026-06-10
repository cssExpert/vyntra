"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Monitor,
  Tablet,
  Smartphone,
  FileText,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
  Code2,
  Zap,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcessedResult, ThemeFormData } from "../upload-types";

interface ThemePreviewPanelProps {
  result: ProcessedResult;
  formData: ThemeFormData;
  onPublish: () => void;
  isPublishing: boolean;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

const DEVICE_ICONS = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
} as const;

export function ThemePreviewPanel({
  result,
  formData,
  onPublish,
  isPublishing,
}: ThemePreviewPanelProps) {
  const [device, setDevice] = useState<DeviceMode>("desktop");

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
      {/* LEFT — Live Preview */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0 }}
        className="lg:col-span-3 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Live Preview
          </h3>
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
            {(["desktop", "tablet", "mobile"] as DeviceMode[]).map((d) => {
              const Icon = DEVICE_ICONS[d];
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevice(d)}
                  aria-label={`Preview on ${d}`}
                  className={cn(
                    "p-2 rounded-md transition-all cursor-pointer",
                    device === d
                      ? "bg-card text-primary shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-muted/40 border border-border rounded-xl p-4 overflow-auto flex justify-center min-h-[500px]">
          <div
            style={{
              width: DEVICE_WIDTHS[device],
              transition: "width 0.3s ease",
              maxWidth: "100%",
            }}
            className="overflow-hidden rounded-xl border border-border shadow-lg"
          >
            <iframe
              srcDoc={result.previewHtml}
              sandbox="allow-scripts allow-same-origin"
              title="Theme Preview"
              className="w-full block"
              style={{ height: 500, border: "none" }}
            />
          </div>
        </div>
      </motion.div>

      {/* RIGHT — Info panels */}
      <div className="lg:col-span-1 space-y-4">
        {/* Detected Pages */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-5 space-y-3"
        >
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Detected Pages
          </h3>
          <ul className="space-y-2">
            {result.pages.map((page) => (
              <li
                key={page.file}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground font-medium truncate">
                    {page.name}
                  </span>
                  <span className="text-xs text-muted-foreground/70 truncate hidden sm:block">
                    {page.file}
                  </span>
                </div>
                {page.isMain && (
                  <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-full uppercase tracking-wide">
                    Main
                  </span>
                )}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Assets */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-5 space-y-3"
        >
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Assets
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Images",
                value: result.assets.images,
                Icon: ImageIcon,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
              },
              {
                label: "CSS Files",
                value: result.assets.cssFiles,
                Icon: Code2,
                color: "text-blue-500",
                bg: "bg-blue-500/10",
              },
              {
                label: "JS Files",
                value: result.assets.jsFiles,
                Icon: Zap,
                color: "text-violet-500",
                bg: "bg-violet-500/10",
              },
              {
                label: "Fonts",
                value: result.assets.fonts,
                Icon: Type,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
              },
            ].map(({ label, value, Icon, color, bg }) => (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-2.5 p-3 rounded-lg border border-border",
                  bg,
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", color)} />
                <div>
                  <p className={cn("text-lg font-bold leading-none", color)}>
                    {value}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Publish */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.3 }}
        >
          <button
            type="button"
            onClick={onPublish}
            disabled={isPublishing}
            className={cn(
              "w-full flex items-center justify-center gap-2.5 px-5 py-4 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer",
              isPublishing
                ? "bg-primary/60 text-primary-foreground cursor-not-allowed"
                : "bg-primary hover:bg-primary-600 text-primary-foreground shadow-md hover:shadow-lg active:scale-[0.98]",
            )}
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Publish Theme to Hub
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
