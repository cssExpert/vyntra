"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Search,
  FileCode,
  Map,
  Sliders,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type TabId, type Notification } from "./seo.types";
import { copyToClipboard } from "./seo.utils";
import { SeoDashboard } from "./SeoDashboard";
import { SeoKeywords } from "./SeoKeywords";
import { SeoMetaTags } from "./SeoMetaTags";
import { SeoSitemaps } from "./SeoSitemaps";
import { SeoSerp } from "./SeoSerp";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: TrendingUp },
  { id: "keywords", label: "Keyword Explorer", icon: Search },
  { id: "metatags", label: "Meta Tag Architect", icon: FileCode },
  { id: "sitemaps", label: "Sitemap Creator", icon: Map },
  { id: "serp", label: "SERP Simulator", icon: Sliders },
];

export function SeoView() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopy = (text: string, message = "Copied to clipboard!") => {
    copyToClipboard(text);
    showNotification(message, "success");
  };

  return (
    <div className="w-full font-sans">
      {/* Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-glass-lg border backdrop-blur-md",
              notification.type === "error"
                ? "bg-destructive/10 border-destructive/30 text-destructive"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
            )}
          >
            <div className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span className="text-sm font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full space-y-6">
        {/* Animated horizontal tabs */}
        <div className="p-1 rounded-xl flex items-center gap-1 border border-border bg-card w-fit flex-wrap">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer transition-colors duration-150",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="seo-tab-indicator"
                    className="absolute inset-0 rounded-lg bg-primary shadow-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4 shrink-0" />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "dashboard" && (
              <SeoDashboard setActiveTab={setActiveTab} />
            )}
            {activeTab === "keywords" && (
              <SeoKeywords
                showNotification={showNotification}
                handleCopy={handleCopy}
              />
            )}
            {activeTab === "metatags" && (
              <SeoMetaTags
                showNotification={showNotification}
                handleCopy={handleCopy}
              />
            )}
            {activeTab === "sitemaps" && (
              <SeoSitemaps
                showNotification={showNotification}
                handleCopy={handleCopy}
              />
            )}
            {activeTab === "serp" && (
              <SeoSerp showNotification={showNotification} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
