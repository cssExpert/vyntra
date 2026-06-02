"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import Mention from "@tiptap/extension-mention";
import { motion } from "framer-motion";
import { AtSign } from "lucide-react";
import {
  makeSuggestionRender,
  type SuggestionListHandle,
} from "./suggestion-render";

interface MentionUser {
  id: string;
  label: string;
  role: string;
}

const USERS: MentionUser[] = [
  { id: "1", label: "Alex Rivera", role: "Technical Writer" },
  { id: "2", label: "Sarah Chen", role: "Developer Advocate" },
  { id: "3", label: "Marcus Johnson", role: "Product Manager" },
  { id: "4", label: "Ravi Gupta", role: "Engineer" },
  { id: "5", label: "Vasudev Sharma", role: "Designer" },
  { id: "6", label: "Priya Patel", role: "Marketing" },
];

interface MentionListProps {
  items: MentionUser[];
  command: (item: MentionUser) => void;
}

const MentionList = forwardRef<SuggestionListHandle, MentionListProps>(
  ({ items, command }, ref) => {
    const [selected, setSelected] = useState(0);
    useEffect(() => setSelected(0), [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelected((s) => (s + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelected((s) => (s + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          if (items[selected]) command(items[selected]);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
        className="w-60 max-h-72 overflow-y-auto rounded-xl border border-border bg-card shadow-[0_12px_40px_rgba(0,0,0,0.16)] p-1.5"
      >
        {items.map((u, i) => (
          <button
            key={u.id}
            type="button"
            onMouseEnter={() => setSelected(i)}
            onClick={() => command(u)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
              i === selected ? "bg-muted" : "hover:bg-muted/60"
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
              {u.label
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground truncate">
                {u.label}
              </span>
              <span className="block text-[11px] text-muted-foreground truncate">
                {u.role}
              </span>
            </span>
            <AtSign className="w-3 h-3 text-muted-foreground/50 ml-auto shrink-0" />
          </button>
        ))}
      </motion.div>
    );
  },
);
MentionList.displayName = "MentionList";

export function buildMention() {
  return Mention.configure({
    HTMLAttributes: { class: "mention" },
    suggestion: {
      char: "@",
      items: ({ query }) =>
        USERS.filter((u) =>
          u.label.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 6),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: makeSuggestionRender(MentionList as any),
      command: ({ editor, range, props }) => {
        const user = props as unknown as MentionUser;
        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            { type: "mention", attrs: { id: user.id, label: user.label } },
            { type: "text", text: " " },
          ])
          .run();
      },
    },
  });
}
