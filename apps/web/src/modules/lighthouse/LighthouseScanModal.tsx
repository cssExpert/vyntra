"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { CONSOLE_LOGS } from "./lighthouse.utils";

interface LighthouseScanModalProps {
  isScanning: boolean;
  url: string;
  scanStep: number;
  networkThrottling: string;
}

export function LighthouseScanModal({
  isScanning, url, scanStep, networkThrottling,
}: LighthouseScanModalProps) {
  return (
    <AnimatePresence>
      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mb-10 rounded-2xl border border-primary/30 overflow-hidden bg-card/80 backdrop-blur-xl relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Lighthouse illustration */}
            <div className="lg:col-span-5 p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-border bg-background/60 relative">
              <div className="relative w-48 h-48 flex items-end justify-center mb-6">
                <svg
                  className="w-32 h-44 drop-shadow-[0_0_20px_rgba(56,189,248,0.2)]"
                  viewBox="0 0 100 150"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M 0,140 Q 25,130 50,140 T 100,140 L 100,150 L 0,150 Z" fill="#0c4a6e" className="animate-pulse" />
                  <path d="M 10,140 L 25,120 L 45,135 L 65,122 L 90,140 Z" fill="#1e293b" />
                  <path d="M 38,130 L 42,40 L 58,40 L 62,130 Z" fill="#e2e8f0" />
                  <path d="M 40.2,105 L 59.8,105 L 59.1,95 L 40.9,95 Z" fill="#ef4444" />
                  <path d="M 41.1,75 L 58.9,75 L 58.2,65 L 41.8,65 Z" fill="#ef4444" />
                  <path d="M 36,40 L 64,40 L 62,37 L 38,37 Z" fill="#0f172a" />
                  <rect x="42" y="27" width="16" height="10" fill="#334155" />
                  <rect x="45" y="27" width="10" height="10" fill="#38bdf8" opacity="0.3" />
                  <path d="M 40,27 Q 50,12 60,27 Z" fill="#ef4444" />
                  <circle cx="50" cy="11" r="2" fill="#ef4444" />
                  <circle cx="50" cy="32" r="6" className="fill-amber-400 animate-ping opacity-75" />
                  <circle cx="50" cy="32" r="3" className="fill-amber-300" />
                </svg>
                <div className="absolute top-8 left-4 w-3.5 h-3.5 rounded-full bg-primary animate-bounce" />
                <div className="absolute top-24 right-4 w-2.5 h-2.5 rounded-full bg-primary/70 animate-pulse" />
                <div className="absolute bottom-16 left-6 w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <h3 className="text-lg font-extrabold text-foreground mb-1">Scanning Target Page</h3>
              <p className="text-xs text-primary font-mono tracking-wider">{url}</p>
            </div>

            {/* Terminal console — intentionally dark */}
            <div className="lg:col-span-7 p-6 flex flex-col justify-between bg-neutral-950 font-mono text-xs text-emerald-400">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-4">
                <span className="flex items-center gap-2">
                  <Terminal size={14} className="animate-pulse" />
                  <span>Diagnostics Console</span>
                </span>
                <span className="text-[10px] text-neutral-500">Thread: worker-01</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {CONSOLE_LOGS.slice(0, scanStep + 1).map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="text-neutral-600">[{idx.toString().padStart(2, "0")}]</span>
                    {idx === scanStep ? (
                      <span className="text-white font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        {log}
                      </span>
                    ) : (
                      <span className="text-neutral-400">{log}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-neutral-900 pt-3 flex items-center justify-between text-neutral-500 text-[10px]">
                <span>Emulated latency: {networkThrottling === "none" ? "0ms" : "150ms"}</span>
                <span>CPU: Intel Threaded Emulation</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
