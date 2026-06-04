"use client";

import { Star, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Email } from "./mail.types";
import { LABELS } from "./mail.data";

interface MailListItemProps {
  email: Email;
  isSelected: boolean;
  onSelect: () => void;
  onToggleStar: (id: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86_400_000) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diff < 7 * 86_400_000) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

export function MailListItem({ email, isSelected, onSelect, onToggleStar }: MailListItemProps) {
  const senderName = email.folder === "sent" || email.folder === "drafts"
    ? (email.to[0]?.name || "Draft")
    : email.from.name;

  const emailLabels = LABELS.filter((l) => email.labels.includes(l.id));

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={cn(
        "w-full text-left px-4 py-3.5 border-b border-border/60 transition-colors group relative cursor-pointer",
        isSelected
          ? "bg-primary/5 border-l-2 border-l-primary"
          : "hover:bg-muted/40 border-l-2 border-l-transparent",
        !email.read && !isSelected && "bg-background",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Unread dot */}
        <div className="pt-1 shrink-0 w-2 flex justify-center">
          {!email.read && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
          )}
        </div>

        {/* Avatar */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
          isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
        )}>
          {getInitials(senderName)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              "text-sm truncate",
              !email.read ? "font-bold text-foreground" : "font-medium text-foreground/80",
            )}>
              {senderName}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {email.attachments && email.attachments.length > 0 && (
                <Paperclip size={11} className="text-muted-foreground/60" />
              )}
              <span className="text-[11px] text-muted-foreground font-mono">
                {formatDate(email.date)}
              </span>
            </div>
          </div>

          <p className={cn(
            "text-xs mt-0.5 truncate",
            !email.read ? "font-semibold text-foreground/90" : "text-muted-foreground",
          )}>
            {email.subject}
          </p>

          <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate leading-relaxed">
            {email.preview}
          </p>

          {/* Labels */}
          {emailLabels.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              {emailLabels.map((l) => (
                <span key={l.id} className={cn("w-1.5 h-1.5 rounded-full", l.color)} />
              ))}
            </div>
          )}
        </div>

        {/* Star */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStar(email.id); }}
          className={cn(
            "shrink-0 p-0.5 rounded transition-colors mt-0.5 opacity-0 group-hover:opacity-100",
            email.starred ? "opacity-100 text-amber-400" : "text-muted-foreground/40 hover:text-amber-400",
          )}
        >
          <Star size={14} className={email.starred ? "fill-amber-400" : ""} />
        </button>
      </div>
    </div>
  );
}
