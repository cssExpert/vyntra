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
            <span className="w-6 shrink-0 flex items-center justify-center">
              {e.fallbackImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.fallbackImage} alt={e.emoji ?? e.name} className="w-5 h-5 object-contain" loading="lazy" />
              ) : e.emoji ? (
                <span className="text-lg leading-none">{e.emoji}</span>
              ) : (
                <span className="text-xs text-muted-foreground">?</span>
              )}
            </span>
            <span className="text-sm text-foreground truncate">:{e.name}:</span>
          </button>
        ))}
      </motion.div>
    );
  },
);
EmojiList.displayName = "EmojiList";

const POPULAR = [
  "smile", "heart", "+1", "fire", "rocket", "tada",
  "clap", "eyes", "100", "raised_hands",
];

export function buildEmoji() {
  return Emoji.configure({
    emojis: gitHubEmojis,
    enableEmoticons: true,
    forceFallbackImages: true,
    suggestion: {
      char: ":",
      items: ({ editor, query }) => {
        const all = editor.storage.emoji.emojis as EmojiItem[];
        const q = query.toLowerCase();
        if (!q) {
          return all.filter((e) => POPULAR.includes(e.name));
        }
        return all
          .filter(
            (e) =>
              !e.name.startsWith("regional_indicator_") &&
              (e.name.startsWith(q) ||
                e.shortcodes?.some((s) => s.startsWith(q)) ||
                e.tags?.some((t) => t.startsWith(q))),
          )
          .slice(0, 8);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: makeSuggestionRender(EmojiList as any),
      command: ({ editor, range, props }) => {
        const name = (props as unknown as { name: string }).name;
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContentAt(range.from, { type: "emoji", attrs: { name } })
          .run();
      },
    },
  });
}
