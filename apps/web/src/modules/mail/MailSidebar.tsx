"use client";

import { motion } from "framer-motion";
import { Inbox, Send, FileText, Star, Trash2, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { MailFolder, Email } from "./mail.types";
import { LABELS } from "./mail.data";

interface MailSidebarProps {
  activeFolder: MailFolder;
  setActiveFolder: (f: MailFolder) => void;
  activeLabel: string | null;
  onLabelChange: (labelId: string) => void;
  emails: Email[];
  onCompose: () => void;
}

export function MailSidebar({
  activeFolder,
  setActiveFolder,
  activeLabel,
  onLabelChange,
  emails,
  onCompose,
}: MailSidebarProps) {
  const t = useTranslations("mail");

  const FOLDERS: { id: MailFolder; label: string; icon: React.ElementType }[] = [
    { id: "inbox", label: t("folders.inbox"), icon: Inbox },
    { id: "sent", label: t("folders.sent"), icon: Send },
    { id: "drafts", label: t("folders.drafts"), icon: FileText },
    { id: "starred", label: t("folders.starred"), icon: Star },
    { id: "deleted", label: t("folders.deleted"), icon: Trash2 },
  ];

  const countUnread = (folder: MailFolder) => {
    if (folder === "starred")
      return emails.filter((e) => e.starred && !e.read).length;
    return emails.filter((e) => e.folder === folder && !e.read).length;
  };

  const countByLabel = (labelId: string) =>
    emails.filter((e) => e.labels.includes(labelId)).length;

  return (
    <aside className="w-56 shrink-0 flex flex-col gap-6 pr-4 border-r border-border">
      {/* Compose */}
      <button
        onClick={onCompose}
        className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all active:scale-[0.98] group shadow-glow-brand w-full justify-center"
      >
        <Pencil size={15} className="stroke-[2.5]" />
        {t("composeBtn")}
      </button>

      {/* Folders */}
      <nav className="space-y-0.5">
        {FOLDERS.map(({ id, label, icon: Icon }) => {
          const isActive = activeFolder === id && !activeLabel;
          const unread = countUnread(id);
          return (
            <button
              key={id}
              onClick={() => setActiveFolder(id)}
              className={cn(
                "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 text-left",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mail-folder-indicator"
                  className="absolute inset-0 rounded-lg bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Icon className="relative z-10 h-4 w-4 shrink-0" />
              <span className="relative z-10 flex-1">{label}</span>
              {unread > 0 && (
                <span
                  className={cn(
                    "relative z-10 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Labels */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 mb-2">
          {t("labelsHeading")}
        </p>
        <div className="space-y-0.5">
          {LABELS.map((label) => {
            const isActive = activeLabel === label.id;
            const count = countByLabel(label.id);
            return (
              <button
                key={label.id}
                onClick={() => onLabelChange(label.id)}
                className={cn(
                  "relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 text-left",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mail-label-indicator"
                    className="absolute inset-0 rounded-lg bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 w-2 h-2 rounded-full shrink-0",
                    label.color,
                  )}
                />
                <span className="relative z-10 flex-1">{label.name}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "relative z-10 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
