"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Star, Trash2, Reply, Forward, Paperclip, X,
  MoreVertical, FileText, Image as ImageIcon, FileCode,
  MailOpen, Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Email } from "./mail.types";
import { LABELS } from "./mail.data";

interface MailDetailProps {
  email: Email;
  onClose: () => void;
  onToggleStar: (id: string) => void;
  onMarkUnread: (id: string) => void;
  onMarkImportant: (id: string) => void;
  onDelete: (id: string) => void;
  onReply: (email: Email) => void;
  onForward: (email: Email) => void;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleString([], {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function AttachmentIcon({ type }: { type: string }) {
  if (type === "pdf") return <FileText size={16} className="text-rose-500" />;
  if (type === "img") return <ImageIcon size={16} className="text-blue-500" />;
  if (type === "json" || type === "doc") return <FileCode size={16} className="text-primary" />;
  return <Paperclip size={16} className="text-muted-foreground" />;
}

export function MailDetail({
  email, onClose, onToggleStar, onMarkUnread, onMarkImportant, onDelete, onReply, onForward,
}: MailDetailProps) {
  const t = useTranslations("mail.detail");
  const emailLabels = LABELS.filter((l) => email.labels.includes(l.id));
  const isImportant = email.labels.includes("important");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const menuItems = [
    {
      icon: <Star size={16} className={email.starred ? "fill-amber-400 text-amber-400" : ""} />,
      label: email.starred ? t("removeStar") : t("addStar"),
      onClick: () => { onToggleStar(email.id); setMenuOpen(false); },
    },
    {
      icon: <MailOpen size={16} />,
      label: t("markUnread"),
      onClick: () => { onMarkUnread(email.id); setMenuOpen(false); },
    },
    {
      icon: (
        <Bookmark
          size={16}
          className={isImportant ? "fill-primary text-primary" : ""}
        />
      ),
      label: isImportant ? t("removeImportant") : t("markImportant"),
      onClick: () => { onMarkImportant(email.id); setMenuOpen(false); },
    },
    {
      icon: <Forward size={16} />,
      label: t("forwardAll"),
      onClick: () => { onForward(email); setMenuOpen(false); },
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onReply(email)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Reply size={14} /> {t("reply")}
          </button>
          <button
            onClick={() => onForward(email)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Forward size={14} /> {t("forward")}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleStar(email.id)}
            className={cn(
              "p-1.5 rounded-sm transition-colors",
              email.starred
                ? "text-amber-400 hover:text-amber-500"
                : "text-muted-foreground hover:text-amber-400",
            )}
          >
            <Star size={15} className={email.starred ? "fill-amber-400" : ""} />
          </button>
          <button
            onClick={() => onDelete(email.id)}
            className="p-1.5 rounded-sm text-muted-foreground hover:text-rose-500 transition-colors"
          >
            <Trash2 size={15} />
          </button>

          {/* More menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={cn(
                "p-1.5 rounded-sm transition-colors",
                menuOpen
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <MoreVertical size={15} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-popover border border-border rounded-xl shadow-lg overflow-hidden py-1">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <span className="text-muted-foreground shrink-0">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <h1 className="text-xl font-bold text-foreground leading-snug mb-4">
          {email.subject}
        </h1>

        {emailLabels.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {emailLabels.map((l) => (
              <span
                key={l.id}
                className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-muted text-muted-foreground border-border"
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", l.color)} />
                {l.name}
              </span>
            ))}
          </div>
        )}

        {/* Sender card */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
            {getInitials(email.from.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="text-sm font-bold text-foreground">{email.from.name}</span>
                <span className="text-xs text-muted-foreground ml-2">&lt;{email.from.email}&gt;</span>
              </div>
              <span className="text-xs text-muted-foreground font-mono shrink-0">
                {formatFullDate(email.date)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t("to")} {email.to.map((r) => r.name || r.email).join(", ") || "—"}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
          {email.body}
        </div>

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Paperclip size={12} />
              {t("attachments", { count: email.attachments.length })}
            </p>
            <div className="flex flex-wrap gap-2">
              {email.attachments.map((att, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <AttachmentIcon type={att.type} />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{att.name}</p>
                    <p className="text-[10px] text-muted-foreground">{att.size}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick reply */}
      <div className="px-6 py-4 border-t border-border shrink-0">
        <button
          onClick={() => onReply(email)}
          className="w-full text-left px-4 py-3 rounded-sm border border-border bg-background hover:border-primary/40 text-sm text-muted-foreground transition-colors"
        >
          {t("replyTo", { name: email.from.name })}
        </button>
      </div>
    </div>
  );
}
