"use client";

import { useState } from "react";
import { Search, X, Inbox } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Email, MailFolder } from "./mail.types";
import { MailListItem } from "./MailListItem";
import { FOLDER_LABELS } from "./mail.data";
import { Input } from "@/components/ui/input";

interface MailListProps {
  folder: MailFolder;
  emails: Email[];
  selectedId: string | null;
  onSelect: (email: Email) => void;
  onToggleStar: (id: string) => void;
  titleOverride?: string;
}

export function MailList({
  folder,
  emails,
  selectedId,
  onSelect,
  onToggleStar,
  titleOverride,
}: MailListProps) {
  const [search, setSearch] = useState("");

  const filtered = emails.filter((e) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      e.subject.toLowerCase().includes(q) ||
      e.from.name.toLowerCase().includes(q) ||
      e.preview.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">
            {titleOverride ?? FOLDER_LABELS[folder]}
          </h2>
          <span className="text-[11px] text-muted-foreground font-mono">
            {emails.length} {emails.length === 1 ? "message" : "messages"}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
          />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            size="xl" className="w-full pl-9 pr-8 bg-background border border-border rounded-sm text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:outline-none focus-visible:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4"
            >
              <Inbox className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-muted-foreground">
                {search ? "No results found" : "Nothing here"}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-xs text-primary hover:text-primary/80 underline"
                >
                  Clear search
                </button>
              )}
            </motion.div>
          ) : (
            filtered.map((email) => (
              <motion.div
                key={email.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MailListItem
                  email={email}
                  isSelected={selectedId === email.id}
                  onSelect={() => onSelect(email)}
                  onToggleStar={onToggleStar}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
