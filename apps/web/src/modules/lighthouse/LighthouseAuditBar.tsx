"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Compass,
  Monitor,
  Smartphone,
  Settings,
  RefreshCw,
  Play,
  Wifi,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeviceType } from "./lighthouse.types";
import { Input } from "@/components/ui/input";

interface LighthouseAuditBarProps {
  url: string;
  setUrl: (v: string) => void;
  device: DeviceType;
  setDevice: (v: DeviceType) => void;
  isScanning: boolean;
  networkThrottling: string;
  setNetworkThrottling: (v: string) => void;
  cpuThrottling: string;
  setCpuThrottling: (v: string) => void;
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
  onRunAudit: () => void;
}

export function LighthouseAuditBar({
  url,
  setUrl,
  device,
  setDevice,
  isScanning,
  networkThrottling,
  setNetworkThrottling,
  cpuThrottling,
  setCpuThrottling,
  showSettings,
  setShowSettings,
  onRunAudit,
}: LighthouseAuditBarProps) {
  const t = useTranslations("lighthouse.auditBar");

  const networkOptions = [
    { id: "none", label: t("netNoneLabel"), desc: t("netNoneDesc") },
    { id: "fast3g", label: t("netFast3gLabel"), desc: t("netFast3gDesc") },
    { id: "slow4g", label: t("netSlow4gLabel"), desc: t("netSlow4gDesc") },
  ];

  const cpuOptions = [
    { id: "none", label: t("cpuNoneLabel"), desc: t("cpuNoneDesc") },
    { id: "4x", label: t("cpu4xLabel"), desc: t("cpu4xDesc") },
    { id: "6x", label: t("cpu6xLabel"), desc: t("cpu6xDesc") },
  ];

  return (
    <section className="mb-10 p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4 justify-between relative z-10">
        {/* URL input */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            {t("targetUrl")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
              <Compass size={18} className="animate-spin-slow" />
            </div>
            <Input
              type="url"
              placeholder="e.g. https://my-portfolio-site.vercel.app"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isScanning}
              size="xl" className="w-full pl-11 pr-32 rounded-xl bg-background border border-border outline-none focus:outline-none focus-visible:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200"
            />
            {/* Device toggle inside input */}
            <div className="absolute inset-y-1.5 right-1.5 flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
              <button
                onClick={() => setDevice("desktop")}
                disabled={isScanning}
                className={cn(
                  "p-1.5 rounded transition",
                  device === "desktop"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title={t("emulateDesktop")}
              >
                <Monitor size={15} />
              </button>
              <button
                onClick={() => setDevice("mobile")}
                disabled={isScanning}
                className={cn(
                  "p-1.5 rounded transition",
                  device === "mobile"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title={t("emulateMobile")}
              >
                <Smartphone size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <button
            onClick={() => setShowSettings(!showSettings)}
            disabled={isScanning}
            className={cn(
              "w-full md:min-w-[200px] text-nowrap px-4 py-3.5 rounded-xl border bg-background hover:bg-muted text-foreground transition-all text-sm flex items-center justify-center gap-2",
              showSettings ? "border-primary text-primary" : "border-border",
            )}
          >
            <Settings size={16} />
            <span>{t("emulationSettings")}</span>
          </button>

          <button
            onClick={onRunAudit}
            disabled={isScanning || !url}
            className="w-full md:min-w-[230px] text-nowrap px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground text-sm font-bold shadow-glow-brand flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>{t("auditing")}</span>
              </>
            ) : (
              <>
                <Play size={16} className="fill-current" />
                <span>{t("generateAudit")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Emulation settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4 pt-4 border-t border-border"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                  <Wifi size={14} className="text-primary" /> {t("networkThrottling")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {networkOptions.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setNetworkThrottling(n.id)}
                      className={cn(
                        "p-3 text-left rounded-xl border text-xs transition",
                        networkThrottling === n.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <div className="font-bold">{n.label}</div>
                      <div className="text-[10px] text-muted-foreground/60 mt-1">
                        {n.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                  <Cpu size={14} className="text-primary" /> {t("cpuThrottling")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {cpuOptions.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCpuThrottling(c.id)}
                      className={cn(
                        "p-3 text-left rounded-xl border text-xs transition",
                        cpuThrottling === c.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <div className="font-bold">{c.label}</div>
                      <div className="text-[10px] text-muted-foreground/60 mt-1">
                        {c.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
