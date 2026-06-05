"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Copy,
  FileEdit,
  Mail,
  Phone,
  CheckSquare,
  Calendar,
  MoreHorizontal,
  Sparkles,
  ChevronDown,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Clipboard,
  Building2,
  Tag,
  Clock,
  User,
  ChevronRight,
} from "lucide-react";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { CRMContact } from "../../types";

/* ─── Stage label map ───────────────────────────────────────── */
const STAGE_LABELS: Record<
  string,
  {
    label: string;
    variant: "default" | "info" | "success" | "warning" | "purple" | "muted";
  }
> = {
  subscriber: { label: "Subscriber", variant: "muted" },
  lead: { label: "Lead", variant: "info" },
  mql: { label: "MQL", variant: "purple" },
  sql: { label: "SQL", variant: "default" },
  opportunity: { label: "Opportunity", variant: "warning" },
  customer: { label: "Customer", variant: "success" },
};

const SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  referral: "Referral",
  social: "Social",
  email: "Email",
  paid_ads: "Paid Ads",
  organic: "Organic",
  cold_outreach: "Cold Outreach",
};

/* ─── Quick action button ───────────────────────────────────── */
function QuickAction({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button className="flex flex-col items-center gap-1.5 group">
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          "border border-border bg-muted/60",
          "text-muted-foreground group-hover:text-foreground group-hover:bg-muted group-hover:border-border/80",
          "transition-all duration-150",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </span>
    </button>
  );
}

/* ─── Info row ──────────────────────────────────────────────── */
function InfoRow({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}

/* ─── Main drawer ───────────────────────────────────────────── */
interface ContactPreviewDrawerProps {
  contact: CRMContact;
  isOpen: boolean;
  onClose: () => void;
}

export function ContactPreviewDrawer({
  contact,
  isOpen,
  onClose,
}: ContactPreviewDrawerProps) {
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const initials = getInitials(contact.name);
  const stage = STAGE_LABELS[contact.stage] ?? {
    label: contact.stage,
    variant: "muted" as const,
  };

  const aiSummary = contact.lastActivity
    ? `The most recent activity for this contact was ${contact.lastActivity.toLowerCase()}. ${contact.source ? `They were acquired through ${SOURCE_LABELS[contact.source] ?? contact.source}.` : ""} ${contact.value && contact.value > 0 ? `Current deal value is ${formatCurrency(contact.value)}.` : ""}`
    : `No recent activity recorded for this contact. ${contact.source ? `Originally acquired via ${SOURCE_LABELS[contact.source] ?? contact.source}.` : ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const QUICK_ACTIONS = [
    { icon: FileEdit, label: "Note" },
    { icon: Mail, label: "Email" },
    { icon: Phone, label: "Call" },
    { icon: CheckSquare, label: "Task" },
    { icon: Calendar, label: "Meeting" },
    { icon: MoreHorizontal, label: "More" },
  ];

  return (
    <>
      {/* ── Backdrop (own AnimatePresence — single direct child) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="preview-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="preview-contact fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {/* ── Panel (own AnimatePresence — single direct child) ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="preview-panel"
            initial={{ x: "100%", opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 34,
              mass: 0.85,
            }}
            className={cn(
              "fixed right-0 top-0 h-full z-50 w-[400px] max-w-[calc(100vw-3rem)]",
              "bg-card border-l border-border",
              "flex flex-col overflow-hidden",
              "shadow-[-8px_0_32px_rgba(0,0,0,0.35)]",
            )}
          >
            {/* ── Header ──────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <h3 className="text-base font-semibold text-foreground">
                Preview
              </h3>
              <button
                onClick={onClose}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg",
                  "text-muted-foreground border border-border/60 bg-muted/40",
                  "hover:text-foreground hover:bg-muted transition-all duration-150 cursor-pointer",
                )}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* ── Sub-nav ──────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/60 flex-shrink-0">
              <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                View record
                <ExternalLink className="h-3 w-3" />
              </button>
              <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                Actions
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>

            {/* ── Scrollable content ───────────────────── */}
            <div className="flex-1 overflow-y-auto">
              {/* Contact card */}
              <div className="px-5 py-5 border-b border-border/60">
                {/* Avatar + name row */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={cn(
                      "h-12 w-12 flex-shrink-0 rounded-full",
                      "bg-gradient-brand",
                      "flex items-center justify-center text-sm font-bold text-white",
                    )}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-base font-semibold text-primary leading-tight">
                        {contact.name}
                      </h4>
                      <ExternalLink className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    </div>
                    {contact.company && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {contact.company}
                      </p>
                    )}
                    {/* Email row */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-xs text-primary truncate">
                        {contact.email}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <button
                        onClick={handleCopy}
                        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                        title={copied ? "Copied!" : "Copy email"}
                      >
                        {copied ? (
                          <CheckSquare className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Clipboard className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Meta rows */}
                <div className="space-y-2">
                  {contact.company && (
                    <InfoRow icon={Building2}>{contact.company}</InfoRow>
                  )}
                  {contact.phone && (
                    <InfoRow icon={Phone}>{contact.phone}</InfoRow>
                  )}
                  {contact.owner && (
                    <InfoRow icon={User}>Owner: {contact.owner}</InfoRow>
                  )}
                  {contact.lastActivity && (
                    <InfoRow icon={Clock}>{contact.lastActivity}</InfoRow>
                  )}
                  {contact.source && (
                    <InfoRow icon={Tag}>
                      {SOURCE_LABELS[contact.source] ?? contact.source}
                    </InfoRow>
                  )}
                  {contact.value && contact.value > 0 ? (
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge
                        variant={stage.variant}
                        label={stage.label}
                        dot
                      />
                      <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                        {formatCurrency(contact.value)}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <StatusBadge
                        variant={stage.variant}
                        label={stage.label}
                        dot
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div className="px-5 py-4 border-b border-border/60">
                <div className="flex items-start justify-between">
                  {QUICK_ACTIONS.map((action) => (
                    <QuickAction
                      key={action.label}
                      icon={action.icon}
                      label={action.label}
                    />
                  ))}
                </div>
              </div>

              {/* AI Record summary */}
              <div className="px-5 py-4">
                {/* Section header */}
                <button
                  onClick={() => setSummaryOpen((v) => !v)}
                  className="flex items-center justify-between w-full mb-3 group"
                >
                  <div className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: summaryOpen ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                      className="text-muted-foreground"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                    <span className="text-sm font-semibold text-foreground">
                      Record summary
                    </span>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium",
                      "bg-gradient-to-r from-pink-500 to-purple-600 text-white",
                      "shadow-sm",
                    )}
                  >
                    <Sparkles className="h-3 w-3" />
                    AI
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {summaryOpen && (
                    <motion.div
                      key="summary"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div
                        className={cn(
                          "rounded-xl border border-pink-500/25 bg-pink-500/5 p-4",
                        )}
                      >
                        {/* Timestamp */}
                        <div className="flex items-center gap-2 mb-3">
                          <p className="text-[11px] text-muted-foreground">
                            Generated{" "}
                            {new Date().toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <RefreshCw className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Summary text */}
                        <p className="text-sm text-foreground leading-relaxed mb-4">
                          {aiSummary}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {contact.source ? `1 Source` : "0 Sources"}
                          </span>
                          <div className="flex items-center gap-1 ml-auto">
                            {[ThumbsUp, ThumbsDown, Clipboard].map(
                              (Icon, i) => (
                                <button
                                  key={i}
                                  className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                </button>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Ask a question */}
                        <button
                          className={cn(
                            "mt-3 flex w-full items-center justify-center gap-1.5 rounded-full",
                            "border border-pink-500/40 bg-transparent px-4 py-1.5",
                            "text-xs font-medium text-pink-500 hover:bg-pink-500/10 transition-colors",
                          )}
                        >
                          <Sparkles className="h-3 w-3" />
                          Ask a question
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
