"use client";

import { useState } from "react";
import { getBlockMeta, getBlockGroups, getThemeLabel } from "@/lib/themes/blockDefaultsResolver";
import type { BlockType } from "@/lib/themes/types";

const ORANGE = "#e4611e";

// Mini SVG thumbnail for each block type
function BlockThumbnail({ icon }: { icon: string }) {
  const base = "w-full h-full";
  switch (icon) {
    case "carousel":
      return (
        <svg className={base} viewBox="0 0 160 80" fill="none">
          <rect width="160" height="80" fill="#f1f1f1" />
          <rect x="8" y="8" width="144" height="64" rx="3" fill="#d1d5db" />
          <rect x="20" y="24" width="60" height="8" rx="2" fill="#9ca3af" />
          <rect x="20" y="37" width="40" height="5" rx="1.5" fill="#d1d5db" />
          <rect x="20" y="48" width="28" height="10" rx="2" fill={ORANGE} />
          <circle cx="148" cy="40" r="6" fill="rgba(255,255,255,0.7)" />
          <polyline points="146,37 149,40 146,43" stroke="#555" strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="40" r="6" fill="rgba(255,255,255,0.7)" />
          <polyline points="14,37 11,40 14,43" stroke="#555" strokeWidth="1.5" fill="none" />
          <circle cx="76" cy="72" r="3" fill={ORANGE} />
          <circle cx="84" cy="72" r="3" fill="#d1d5db" />
          <circle cx="92" cy="72" r="3" fill="#d1d5db" />
        </svg>
      );
    case "grid":
      return (
        <svg className={base} viewBox="0 0 160 80" fill="none">
          <rect width="160" height="80" fill="#f9fafb" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${8 + i * 38}, 12)`}>
              <rect width="32" height="40" rx="2" fill="#e5e7eb" />
              <rect y="44" width="32" height="5" rx="1" fill="#9ca3af" />
              <rect y="52" width="20" height="4" rx="1" fill={ORANGE} />
            </g>
          ))}
        </svg>
      );
    case "tabs":
      return (
        <svg className={base} viewBox="0 0 160 80" fill="none">
          <rect width="160" height="80" fill="#f9fafb" />
          <rect x="8" y="8" width="40" height="14" rx="2" fill={ORANGE} />
          <rect x="52" y="8" width="40" height="14" rx="2" fill="#e5e7eb" />
          <rect x="96" y="8" width="40" height="14" rx="2" fill="#e5e7eb" />
          <rect x="8" y="26" width="144" height="1" fill="#e5e7eb" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${8 + i * 38}, 30)`}>
              <rect width="32" height="36" rx="2" fill="#e5e7eb" />
            </g>
          ))}
        </svg>
      );
    case "features":
      return (
        <svg className={base} viewBox="0 0 160 80" fill="none">
          <rect width="160" height="80" fill="#f5f5f5" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${8 + i * 38}, 20)`}>
              <circle cx="16" cy="16" r="14" fill="white" stroke={ORANGE} strokeWidth="1.5" />
              <rect x="10" y="14" width="12" height="4" rx="1" fill={ORANGE} />
              <rect x="6" y="38" width="28" height="5" rx="1" fill="#9ca3af" />
              <rect x="8" y="46" width="24" height="3" rx="1" fill="#d1d5db" />
            </g>
          ))}
        </svg>
      );
    case "promo":
      return (
        <svg className={base} viewBox="0 0 160 80" fill="none">
          <rect width="160" height="80" fill="#212529" />
          <rect x="8" y="10" width="90" height="60" rx="3" fill="#2d3748" />
          <rect x="16" y="22" width="50" height="6" rx="2" fill="white" />
          <rect x="16" y="32" width="36" height="4" rx="1" fill="rgba(255,255,255,0.4)" />
          <rect x="16" y="44" width="30" height="10" rx="2" fill={ORANGE} />
          <rect x="50" y="44" width="30" height="10" rx="2" fill="none" stroke="white" strokeWidth="1" />
        </svg>
      );
    case "brands":
      return (
        <svg className={base} viewBox="0 0 160 80" fill="none">
          <rect width="160" height="80" fill="#f5f5f5" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={8 + i * 38} y="20" width="32" height="40" rx="2" fill="white" stroke="#e5e7eb" />
          ))}
          <circle cx="8" cy="40" r="5" fill="white" stroke="#d1d5db" />
          <circle cx="152" cy="40" r="5" fill="white" stroke="#d1d5db" />
        </svg>
      );
    case "categories":
      return (
        <svg className={base} viewBox="0 0 160 80" fill="none">
          <rect width="160" height="80" fill="white" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i} transform={`translate(${8 + i * 24}, 12)`}>
              <circle cx="10" cy="20" r="14" fill="#e5e7eb" />
              <rect x="2" y="38" width="16" height="4" rx="1" fill="#9ca3af" />
            </g>
          ))}
        </svg>
      );
    case "newsletter":
      return (
        <svg className={base} viewBox="0 0 160 80" fill="none">
          <rect width="160" height="80" fill="#212529" />
          <rect x="30" y="18" width="100" height="8" rx="2" fill="rgba(255,255,255,0.5)" />
          <rect x="44" y="30" width="72" height="5" rx="1" fill="rgba(255,255,255,0.2)" />
          <rect x="20" y="44" width="90" height="16" rx="2" fill="white" />
          <rect x="112" y="44" width="30" height="16" rx="2" fill={ORANGE} />
        </svg>
      );
    case "blog":
      return (
        <svg className={base} viewBox="0 0 160 80" fill="none">
          <rect width="160" height="80" fill="#f5f5f5" />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${8 + i * 50}, 8)`}>
              <rect width="44" height="30" rx="2" fill="#e5e7eb" />
              <rect y="34" width="44" height="5" rx="1" fill="#9ca3af" />
              <rect y="42" width="36" height="3" rx="1" fill="#d1d5db" />
              <rect y="48" width="28" height="3" rx="1" fill="#d1d5db" />
              <rect y="56" width="16" height="3" rx="1" fill={ORANGE} />
            </g>
          ))}
        </svg>
      );
    case "header":
      return (
        <svg className={base} viewBox="0 0 160 80" fill="none">
          <rect width="160" height="80" fill="#212529" />
          <rect x="8" y="18" width="90" height="8" rx="2" fill="white" opacity="0.9" />
          <rect x="8" y="34" width="28" height="4" rx="1" fill="rgba(255,255,255,0.4)" />
          <rect x="38" y="34" width="6" height="4" rx="1" fill="rgba(255,255,255,0.25)" />
          <rect x="46" y="34" width="36" height="4" rx="1" fill={ORANGE} opacity="0.9" />
        </svg>
      );
    case "text-image":
      return (
        <svg className={base} viewBox="0 0 160 80" fill="none">
          <rect width="160" height="80" fill="white" />
          <rect x="8" y="10" width="70" height="6" rx="2" fill="#212529" opacity="0.7" />
          <rect x="8" y="22" width="65" height="3" rx="1" fill="#d1d5db" />
          <rect x="8" y="29" width="60" height="3" rx="1" fill="#d1d5db" />
          <rect x="8" y="36" width="55" height="3" rx="1" fill="#d1d5db" />
          <rect x="8" y="43" width="45" height="3" rx="1" fill="#d1d5db" />
          <rect x="8" y="56" width="28" height="10" rx="2" fill={ORANGE} />
          <rect x="90" y="8" width="62" height="64" rx="4" fill="#e5e7eb" />
        </svg>
      );
    case "contact":
      return (
        <svg className={base} viewBox="0 0 160 80" fill="none">
          <rect width="160" height="80" fill="#f5f5f5" />
          <rect x="8" y="10" width="52" height="5" rx="1.5" fill="#212529" opacity="0.7" />
          <rect x="8" y="22" width="10" height="10" rx="2" fill={ORANGE} />
          <rect x="22" y="24" width="35" height="4" rx="1" fill="#d1d5db" />
          <rect x="8" y="36" width="10" height="10" rx="2" fill={ORANGE} />
          <rect x="22" y="38" width="35" height="4" rx="1" fill="#d1d5db" />
          <rect x="8" y="50" width="10" height="10" rx="2" fill={ORANGE} />
          <rect x="22" y="52" width="35" height="4" rx="1" fill="#d1d5db" />
          <rect x="82" y="6" width="70" height="68" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
          <rect x="88" y="14" width="52" height="4" rx="1" fill="#9ca3af" />
          <rect x="88" y="22" width="58" height="7" rx="2" fill="#f5f5f5" stroke="#e5e7eb" strokeWidth="1" />
          <rect x="88" y="33" width="58" height="7" rx="2" fill="#f5f5f5" stroke="#e5e7eb" strokeWidth="1" />
          <rect x="88" y="44" width="58" height="11" rx="2" fill="#f5f5f5" stroke="#e5e7eb" strokeWidth="1" />
          <rect x="88" y="59" width="58" height="9" rx="2" fill={ORANGE} />
        </svg>
      );
    case "map":
      return (
        <svg className={base} viewBox="0 0 160 80" fill="none">
          <rect width="160" height="80" fill="#e5f0e9" />
          <path d="M0 40 L30 20 L60 40 L90 15 L120 40 L160 22 V80 H0 Z" fill="#cfe6d8" />
          <path d="M0 55 L40 45 L80 60 L120 48 L160 58 V80 H0 Z" fill="#bfe0cf" />
          <path d="M20 8 C10 40 40 55 30 78" stroke="#9fd2f0" strokeWidth="4" fill="none" />
          <path d="M80 42 C86 44 90 50 80 78" stroke={ORANGE} strokeWidth="2" strokeDasharray="3 2" fill="none" />
          <circle cx="80" cy="38" r="7" fill={ORANGE} />
          <circle cx="80" cy="38" r="2.5" fill="white" />
        </svg>
      );
    case "html":
    default:
      return (
        <svg className={base} viewBox="0 0 160 80" fill="none">
          <rect width="160" height="80" fill="#1e293b" />
          <rect x="8" y="12" width="40" height="4" rx="1" fill="#64748b" />
          <rect x="20" y="22" width="60" height="4" rx="1" fill="#94a3b8" />
          <rect x="20" y="30" width="100" height="4" rx="1" fill={ORANGE} opacity="0.7" />
          <rect x="20" y="38" width="80" height="4" rx="1" fill="#94a3b8" />
          <rect x="20" y="46" width="50" height="4" rx="1" fill={ORANGE} opacity="0.7" />
          <rect x="8" y="56" width="40" height="4" rx="1" fill="#64748b" />
        </svg>
      );
  }
}

interface Props {
  onAdd: (type: BlockType) => void;
  themeIdentifier?: string;
}

interface BlockGroup {
  label: string;
  types: BlockType[];
}

type BlockMetaMap = Record<BlockType, { label: string; description: string; icon: string }>;

function BlockCard({ type, meta, onAdd }: { type: BlockType; meta: BlockMetaMap; onAdd: (t: BlockType) => void }) {
  const blockMeta = meta[type];
  return (
    <button
      onClick={() => onAdd(type)}
      className="w-full text-left rounded-lg border border-border bg-background hover:border-orange-400 hover:shadow-sm transition-all group overflow-hidden"
    >
      <div className="h-[72px] overflow-hidden bg-gray-50 dark:bg-muted border-b border-border">
        <BlockThumbnail icon={blockMeta.icon} />
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-foreground group-hover:text-orange-600 transition-colors">{blockMeta.label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{blockMeta.description}</p>
      </div>
    </button>
  );
}

function GroupSection({ group, meta, onAdd }: { group: BlockGroup; meta: BlockMetaMap; onAdd: (t: BlockType) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-1 py-1.5 group"
      >
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
          {group.label}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="space-y-2 mt-1">
          {group.types.map((type) => (
            <BlockCard key={type} type={type} meta={meta} onAdd={onAdd} />
          ))}
        </div>
      )}
    </div>
  );
}

export function BlockPalette({ onAdd, themeIdentifier = "shopingo" }: Props) {
  const meta = getBlockMeta(themeIdentifier);
  const groups = getBlockGroups(themeIdentifier);
  const themeLabel = getThemeLabel(themeIdentifier);
  return (
    <aside className="w-72 flex-shrink-0 border-r border-border bg-background flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3.5 border-b border-border shrink-0">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{themeLabel} Blocks</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {groups.map((group) => (
          <GroupSection key={group.label} group={group} meta={meta} onAdd={onAdd} />
        ))}
      </div>
    </aside>
  );
}
