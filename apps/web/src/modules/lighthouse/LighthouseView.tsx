"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionTitle from "@/components/common/SectionTitle";
import { type TabId, type DeviceType, type AuditResults } from "./lighthouse.types";
import { CONSOLE_LOGS, copyToClipboard } from "./lighthouse.utils";
import { LighthouseAuditBar } from "./LighthouseAuditBar";
import { LighthouseScanModal } from "./LighthouseScanModal";
import { LighthouseDashboard } from "./LighthouseDashboard";
import { LighthouseAIOptimizer } from "./LighthouseAIOptimizer";

export function LighthouseView() {
  // Audit state
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [url, setUrl] = useState("https://example.com");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [networkThrottling, setNetworkThrottling] = useState("fast3g");
  const [cpuThrottling, setCpuThrottling] = useState("4x");
  const [showSettings, setShowSettings] = useState(false);
  const [auditResults, setAuditResults] = useState<AuditResults | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("Optimize React re-renders with heavy array manipulation");

  const runAuditSimulation = () => {
    setIsScanning(true);
    setScanStep(0);
    setAuditResults(null);
  };

  // Scan step ticker
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanStep((prev) => {
        if (prev >= CONSOLE_LOGS.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            const seed = url.length + (device === "mobile" ? 12 : 37);
            const r = (min: number, max: number, offset = 0) =>
              Math.floor(((seed * 31 + offset) % (max - min + 1)) + min);
            setAuditResults({
              scores: {
                perf: device === "mobile" ? r(45, 78, 1) : r(82, 99, 2),
                a11y: r(85, 100, 3),
                best: r(75, 100, 4),
                seo: r(80, 100, 5),
              },
              metrics: {
                fcp: (device === "mobile" ? r(21, 45, 6) / 10 : r(8, 18, 7) / 10).toFixed(1) + " s",
                si: (device === "mobile" ? r(35, 62, 8) / 10 : r(12, 28, 9) / 10).toFixed(1) + " s",
                lcp: (device === "mobile" ? r(32, 58, 10) / 10 : r(15, 30, 11) / 10).toFixed(1) + " s",
                tbt: (device === "mobile" ? r(300, 800, 12) : r(40, 220, 13)) + " ms",
                cls: (device === "mobile" ? r(12, 38, 14) / 100 : r(1, 15, 15) / 100).toFixed(3),
              },
              info: {
                url,
                timestamp: new Date().toLocaleString(),
                device,
                throttling: `${networkThrottling === "none" ? "None" : networkThrottling === "fast3g" ? "Fast 3G" : "Slow 4G"} / CPU ${cpuThrottling}`,
              },
            });
            setIsScanning(false);
            showToast("Performance report successfully generated!");
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 220);
    return () => clearInterval(interval);
  }, [isScanning, url, device, networkThrottling, cpuThrottling]);

  // Initial auto-scan
  useEffect(() => { runAuditSimulation(); }, []);

  // Re-scan on device switch
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    runAuditSimulation();
  }, [device]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string, message = "Copied to clipboard!") => {
    copyToClipboard(text);
    showToast(message);
  };

  const handleSolveWithAI = (prompt: string) => {
    setAiPrompt(prompt);
    setActiveTab("ai-optimizer");
  };

  return (
    <div className="font-sans text-foreground transition-colors duration-300">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-glass-lg border border-border bg-card text-foreground"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full pb-5 space-y-0">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 mb-5 gap-4">
          <SectionTitle mb="0" title="Lighthouse Keeper" paragraph="Next-gen performance diagnostic suite & optimizer" className="max-w-full" width="100%" />

          <nav className="flex rounded-xl bg-card/80 p-1 border border-border w-fit">
            {(["dashboard", "ai-optimizer"] as TabId[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all",
                  activeTab === tab ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab === "ai-optimizer" && <Sparkles size={13} />}
                {tab === "dashboard" ? "Dashboard" : "AI Optimizer"}
              </button>
            ))}
          </nav>
        </header>

        {/* Audit bar */}
        <LighthouseAuditBar
          url={url} setUrl={setUrl}
          device={device} setDevice={setDevice}
          isScanning={isScanning}
          networkThrottling={networkThrottling} setNetworkThrottling={setNetworkThrottling}
          cpuThrottling={cpuThrottling} setCpuThrottling={setCpuThrottling}
          showSettings={showSettings} setShowSettings={setShowSettings}
          onRunAudit={runAuditSimulation}
        />

        {/* Scanning modal */}
        <LighthouseScanModal
          isScanning={isScanning}
          url={url}
          scanStep={scanStep}
          networkThrottling={networkThrottling}
        />

        {/* Dashboard */}
        {activeTab === "dashboard" && auditResults && (
          <LighthouseDashboard
            auditResults={auditResults}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            handleCopy={handleCopy}
            onSolveWithAI={handleSolveWithAI}
          />
        )}

        {/* AI Optimizer */}
        {activeTab === "ai-optimizer" && (
          <LighthouseAIOptimizer
            initialPrompt={aiPrompt}
            onPromptChange={setAiPrompt}
            handleCopy={handleCopy}
          />
        )}
      </div>
    </div>
  );
}
