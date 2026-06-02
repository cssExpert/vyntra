"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import Emoji, { gitHubEmojis, type EmojiItem } from "@tiptap/extension-emoji";
import { motion } from "framer-motion";
import {
  makeSuggestionRender,
  type SuggestionListHandle,
} from "./suggestion-render";

interface EmojiListProps {
  items: EmojiItem[];
  command: (item: { name: string }) => void;
}

const EmojiList = forwardRef<SuggestionListHandle, EmojiListProps>(
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
          if (items[selected]) command({ name: items[selected].name });
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
        className="w-64 max-h-72 overflow-y-auto rounded-xl border border-border bg-card shadow-[0_12px_40px_rgba(0,0,0,0.16)] p-1.5"
      >
        {items.map((e, i) => (
          <button
            key={e.name}
            type="button"
            onMouseEnter={() => setSelected(i)}
            onClick={() => command({ name: e.name })}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
              i === selected ? "bg-muted" : "hover:bg-muted/60"
            }`}
          >
            <span className="text-lg w-6 text-center shrink-0">
              {e.emoji ??
                (e.fallbackImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.fallbackImage} alt={e.name} className="w-5 h-5" />
                ) : null)}
            </span>
            <span className="text-sm text-foreground truncate">:{e.name}:</span>
          </button>
        ))}
      </motion.div>
    );
  },
);
EmojiList.displayName = "EmojiList";

export function buildEmoji() {
  return Emoji.configure({
    emojis: gitHubEmojis,
    enableEmoticons: true,
    suggestion: {
      char: ":",
      items: ({ editor, query }) => {
        const all = editor.storage.emoji.emojis as EmojiItem[];
        return all
          .filter(
            (e) =>
              e.shortcodes.some((s) => s.startsWith(query.toLowerCase())) ||
              e.tags.some((t) => t.startsWith(query.toLowerCase())),
          )
          .slice(0, 8);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: makeSuggestionRender(EmojiList as any),
      command: ({ editor, range, props }) => {
        const name = (props as unknown as { name: string }).name;
        editor.chain().focus().deleteRange(range).setEmoji(name).run();
      },
    },
  });
}
