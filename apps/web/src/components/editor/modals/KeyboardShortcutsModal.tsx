"use client";

import { Keyboard, X } from "lucide-react";
import {
  MotionModal,
  MotionModalTitle,
  MotionModalClose,
} from "@/components/editor/ui/MotionModal";
import { cn } from "@/lib/utils";

// ── Shortcut data ──────────────────────────────────────────────────────────────

interface Shortcut {
  keys: string[];
  description: string;
  mouse?: boolean; // true → render as a gesture label, not a kbd badge
}

interface ShortcutGroup {
  label: string;
  shortcuts: Shortcut[];
}

const GROUPS: ShortcutGroup[] = [
  {
    label: "File",
    shortcuts: [
      { keys: ["Ctrl", "S"], description: "Save draft" },
    ],
  },
  {
    label: "History",
    shortcuts: [
      { keys: ["Ctrl", "Z"], description: "Undo" },
      { keys: ["Ctrl", "⇧", "Z"], description: "Redo" },
      { keys: ["Ctrl", "Y"], description: "Redo (Windows)" },
    ],
  },
  {
    label: "Zoom",
    shortcuts: [
      { keys: ["Ctrl", "="], description: "Zoom in" },
      { keys: ["Ctrl", "−"], description: "Zoom out" },
      { keys: ["Ctrl", "0"], description: "Reset zoom to 100%" },
    ],
  },
  {
    label: "Elements",
    shortcuts: [
      { keys: ["Del"], description: "Delete selected element" },
      { keys: ["Ctrl", "D"], description: "Duplicate element" },
      { keys: ["Ctrl", "C"], description: "Copy element" },
      { keys: ["Ctrl", "V"], description: "Paste element" },
      { keys: ["Esc"], description: "Deselect element" },
    ],
  },
  {
    label: "Inline editing",
    shortcuts: [
      { keys: ["Dbl-click"], description: "Edit text inline", mouse: true },
      { keys: ["F2"], description: "Edit selected text node" },
      { keys: ["Enter"], description: "Confirm edit" },
      { keys: ["Esc"], description: "Cancel edit" },
    ],
  },
  {
    label: "View",
    shortcuts: [
      { keys: ["Esc"], description: "Exit preview mode" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
    ],
  },
];

// Split into two balanced columns
const LEFT_GROUPS = GROUPS.slice(0, 3);
const RIGHT_GROUPS = GROUPS.slice(3);

// ── Sub-components ─────────────────────────────────────────────────────────────

function KbdKey({ label, mouse }: { label: string; mouse?: boolean }) {
  if (mouse) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium text-muted-foreground bg-muted border border-border">
        {label}
      </span>
    );
  }
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded-md font-mono text-[10px] font-semibold text-foreground bg-muted border border-border shadow-[0_1px_0_0_hsl(var(--border))]">
      {label}
    </kbd>
  );
}

function ShortcutRow({ shortcut }: { shortcut: Shortcut }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-xs text-muted-foreground leading-none">
        {shortcut.description}
      </span>
      <div className="flex items-center gap-0.5 shrink-0">
        {shortcut.keys.map((key, i) => (
          <span key={i} className="flex items-center gap-0.5">
            {i > 0 && !shortcut.mouse && (
              <span className="text-[9px] text-muted-foreground/50 mx-0.5">+</span>
            )}
            <KbdKey label={key} mouse={shortcut.mouse && i === 0} />
          </span>
        ))}
      </div>
    </div>
  );
}

function GroupBlock({ group }: { group: ShortcutGroup }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1 pb-1 border-b border-border">
        {group.label}
      </p>
      <div className="divide-y divide-border/50">
        {group.shortcuts.map((s) => (
          <ShortcutRow key={s.description} shortcut={s} />
        ))}
      </div>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ open, onClose }: Props) {
  return (
    <MotionModal
      open={open}
      onClose={onClose}
      className="w-[580px] max-w-[95vw]"
    >
      <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <MotionModalTitle asChild>
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Keyboard className="w-4 h-4 text-primary" />
              Keyboard Shortcuts
            </h2>
          </MotionModalTitle>
          <MotionModalClose asChild>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </MotionModalClose>
        </div>

        {/* Body — two-column grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-5 py-5">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {LEFT_GROUPS.map((g) => (
              <GroupBlock key={g.label} group={g} />
            ))}
          </div>
          {/* Right column */}
          <div className="flex flex-col gap-5">
            {RIGHT_GROUPS.map((g) => (
              <GroupBlock key={g.label} group={g} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/40 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground/60">
            <span className="font-semibold">⌘</span> on Mac ·{" "}
            <span className="font-semibold">Ctrl</span> on Windows / Linux
          </p>
          <button
            onClick={onClose}
            className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Press <KbdKey label="Esc" /> to close
          </button>
        </div>
      </div>
    </MotionModal>
  );
}
