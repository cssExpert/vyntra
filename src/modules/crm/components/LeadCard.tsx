"use client";

import { motion } from "framer-motion";
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

interface LeadCardProps {
  contact: CRMContact;
  index?: number;
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg",
        "text-muted-foreground border border-border/60",
        "hover:bg-muted hover:text-foreground hover:border-border",
        "transition-all duration-150 cursor-pointer",
      )}
      aria-label={label}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

export function LeadCard({ contact, index = 0 }: LeadCardProps) {
  const initials = getInitials(contact.name);
  const hasValue = contact.value && contact.value > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group rounded-xl border border-border bg-card p-3.5",
        "hover:border-primary/30 hover:shadow-glass",
        "transition-all duration-200 cursor-pointer",
      )}
    >
      {/* Name + value */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar */}
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
          <p className="text-xs text-muted-foreground truncate">{contact.company}</p>
        </div>
      )}

      {/* Last activity */}
      {contact.lastActivity && (
        <div className="flex items-center gap-1.5 mb-3">
          <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground truncate">{contact.lastActivity}</p>
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
      <div className="flex items-center gap-1.5 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ActionButton icon={LayoutGrid} label="View contact" />
        <ActionButton icon={Plus}       label="Add task" />
        <ActionButton icon={Mail}       label="Send email" />
        <ActionButton icon={Pencil}     label="Edit contact" />
      </div>
    </motion.div>
  );
}
