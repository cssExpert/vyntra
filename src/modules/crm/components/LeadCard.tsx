"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Plus,
  Mail,
  Pencil,
  Building2,
  Clock,
  User,
} from "lucide-react";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import type { CRMContact } from "../types";
import { ContactPreviewDrawer } from "./shared/ContactPreviewDrawer";

/* ─── Tooltip ───────────────────────────────────────────────── */
function Tooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="tip"
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className={cn(
              "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50",
              "whitespace-nowrap rounded-md border border-border/60",
              "bg-popover px-2 py-1 text-[10px] font-medium text-foreground",
              "shadow-lg pointer-events-none",
            )}
          >
            {label}
            {/* Arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 block border-4 border-transparent border-t-border/60" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Action button ─────────────────────────────────────────── */
function ActionButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  active?: boolean;
}) {
  return (
    <Tooltip label={label}>
      <button
        onClick={onClick}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg",
          "border transition-all duration-150 cursor-pointer",
          active
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border",
        )}
        aria-label={label}
      >
        <Icon className="h-3.5 w-3.5" />
      </button>
    </Tooltip>
  );
}

/* ─── LeadCard ──────────────────────────────────────────────── */
interface LeadCardProps {
  contact: CRMContact;
  index?: number;
}

export function LeadCard({ contact, index = 0 }: LeadCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const initials = getInitials(contact.name);
  const hasValue = contact.value && contact.value > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3, ease: "easeOut" }}
        className={cn(
          "group rounded-xl border bg-card p-3.5",
          "transition-all duration-200 cursor-pointer",
          previewOpen
            ? "border-primary/40 shadow-glass"
            : "border-border hover:border-primary/30 hover:shadow-glass",
        )}
      >
        {/* Name + value */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 flex-shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-[9px] font-bold text-white">
              {initials}
            </div>
            <p className="text-sm font-semibold text-primary hover:text-primary/80 truncate transition-colors">
              {contact.name}
            </p>
          </div>
          {hasValue && (
            <span className="flex-shrink-0 text-[10px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded-full">
              {formatCurrency(contact.value!)}
            </span>
          )}
        </div>

        {/* Owner */}
        {contact.owner && (
          <div className="flex items-center gap-1.5 mb-2">
            <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground truncate">
              Contact owner: {contact.owner}
            </p>
          </div>
        )}

        {/* Company */}
        {contact.company && (
          <div className="flex items-center gap-1.5 mb-2">
            <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground truncate">
              {contact.company}
            </p>
          </div>
        )}

        {/* Last activity */}
        {contact.lastActivity && (
          <div className="flex items-center gap-1.5 mb-3">
            <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground truncate">
              {contact.lastActivity}
            </p>
          </div>
        )}

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {contact.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div
          className={cn(
            "flex items-center gap-1.5 pt-2 border-t border-border/50",
            "transition-opacity duration-200",
            previewOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <ActionButton
            icon={LayoutGrid}
            label="Preview contact"
            active={previewOpen}
            onClick={(e) => {
              e.stopPropagation();
              setPreviewOpen((v) => !v);
            }}
          />
          <ActionButton
            icon={Plus}
            label="Add task"
            onClick={(e) => e.stopPropagation()}
          />
          <ActionButton
            icon={Mail}
            label="Send email"
            onClick={(e) => e.stopPropagation()}
          />
          <ActionButton
            icon={Pencil}
            label="Edit contact"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </motion.div>

      {/* Preview drawer — rendered outside the card but inside the fragment */}
      <ContactPreviewDrawer
        contact={contact}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
