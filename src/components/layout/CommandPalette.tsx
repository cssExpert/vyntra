"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Users2,
  Mail,
  Phone,
  FileText,
  TrendingUp,
  Gauge,
  ShoppingBag,
  CreditCard,
  BarChart3,
  UserCog,
  Settings2,
  ArrowRight,
  Hash,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS } from "@/constants/navigation";

/* ─── Icon map ─────────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users2,
  Mail,
  Phone,
  FileText,
  TrendingUp,
  Gauge,
  ShoppingBag,
  CreditCard,
  BarChart3,
  UserCog,
  Settings2,
};

/* ─── Data ──────────────────────────────────────────────────── */
interface CommandItem {
  id: string;
  label: string;
  href: string;
  group: string;
  icon: string;
}

const COMMAND_ITEMS: CommandItem[] = NAV_SECTIONS.flatMap((section) =>
  section.items.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    group: section.label ?? "Core",
    icon: item.icon,
  })),
);

/* ─── Context ───────────────────────────────────────────────── */
interface CommandPaletteContextValue {
  open: () => void;
  close: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue>({
  open: () => {},
  close: () => {},
});

export function useCommandPalette() {
  return useContext(CommandPaletteContext);
}

/* ─── Palette Modal ─────────────────────────────────────────── */
function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Sliding highlight state
  const [highlight, setHighlight] = useState({ top: 8, height: 40, opacity: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Map from flat index → button element
  const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  /* Filter */
  const filtered = query.trim()
    ? COMMAND_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.group.toLowerCase().includes(query.toLowerCase()),
      )
    : COMMAND_ITEMS;

  /* Group */
  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  const flatList = Object.values(groups).flat();

  /* Reset on query change */
  useEffect(() => { setActiveIndex(0); }, [query]);

  /* Focus input on mount */
  useEffect(() => { inputRef.current?.focus(); }, []);

  /* Scroll active into view */
  useEffect(() => {
    buttonRefs.current
      .get(activeIndex)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  /*
   * Sliding highlight: measure active button position relative to
   * the scrollable list container and animate a single pill there.
   * useLayoutEffect fires after DOM mutations, so refs are populated.
   */
  useLayoutEffect(() => {
    const el = buttonRefs.current.get(activeIndex);
    if (!el || !listRef.current) return;

    const listRect = listRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const top = elRect.top - listRect.top + listRef.current.scrollTop;

    setHighlight({ top, height: elRect.height, opacity: 1 });
  }, [activeIndex, query]);

  const navigate = useCallback(
    (item: CommandItem) => { onClose(); router.push(item.href); },
    [onClose, router],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatList.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = flatList[activeIndex];
        if (item) navigate(item);
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [flatList, activeIndex, navigate, onClose],
  );

  let flatIndex = -1;

  return (
    /* Spring entrance — NO exit variant so React unmounts cleanly */
    <motion.div
      initial={{ opacity: 0, scale: 0.93, y: -16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 440, damping: 30, mass: 0.7 }}
      className={cn(
        "w-full max-w-lg mx-auto overflow-hidden",
        "rounded-2xl border border-border/60",
        "bg-card/95 backdrop-blur-2xl",
      )}
      style={{
        boxShadow:
          "0 32px 72px -8px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Search input ─────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50">
        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search pages, actions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex-1 bg-transparent text-sm text-foreground",
            "placeholder:text-muted-foreground/60 outline-none border-none",
          )}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <kbd
          onClick={onClose}
          className={cn(
            "flex items-center rounded-md border border-border/60",
            "bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground",
            "cursor-pointer hover:bg-muted transition-colors select-none",
          )}
        >
          Esc
        </kbd>
      </div>

      {/* ── Results ──────────────────────────────────── */}
      <div
        ref={listRef}
        className="relative max-h-[360px] overflow-y-auto overscroll-contain p-2"
      >
        {flatList.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <Hash className="h-8 w-8 opacity-30" />
            <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
          </div>
        ) : (
          <>
            {/* Single sliding highlight pill — driven by measured position */}
            <motion.div
              aria-hidden
              animate={{
                top: highlight.top,
                height: highlight.height,
                opacity: highlight.opacity,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.35 }}
              className="absolute left-2 right-2 rounded-lg bg-primary/10 pointer-events-none"
              style={{ top: highlight.top, height: highlight.height, opacity: 0 }}
            />

            {Object.entries(groups).map(([group, items]) => (
              <div key={group} className="mb-1">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  {group}
                </p>

                {items.map((item) => {
                  flatIndex += 1;
                  const currentIndex = flatIndex;
                  const isActive = currentIndex === activeIndex;
                  const IconComp = ICON_MAP[item.icon] ?? Hash;

                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        if (el) buttonRefs.current.set(currentIndex, el);
                        else buttonRefs.current.delete(currentIndex);
                      }}
                      data-active={isActive}
                      onClick={() => navigate(item)}
                      onMouseEnter={() => setActiveIndex(currentIndex)}
                      className={cn(
                        "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left",
                        "transition-colors duration-75",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {/* Icon */}
                      <span
                        className={cn(
                          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg",
                          "border transition-colors duration-100",
                          isActive
                            ? "border-primary/40 bg-primary/15 text-primary"
                            : "border-border/60 bg-muted/50 text-muted-foreground",
                        )}
                      >
                        <IconComp className="h-3.5 w-3.5" />
                      </span>

                      {/* Label */}
                      <span className="flex-1 text-sm font-medium">{item.label}</span>

                      {/* Arrow — simple opacity, no AnimatePresence */}
                      <span
                        className="text-primary transition-opacity duration-100"
                        style={{ opacity: isActive ? 1 : 0 }}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────── */}
      <div className="flex items-center gap-4 border-t border-border/40 px-4 py-2.5">
        {[
          { keys: ["↑", "↓"], label: "navigate" },
          { keys: ["↵"], label: "open" },
          { keys: ["Esc"], label: "close" },
        ].map(({ keys, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            {keys.map((k) => (
              <kbd
                key={k}
                className="rounded border border-border/60 bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
              >
                {k}
              </kbd>
            ))}
            <span className="text-[10px] text-muted-foreground/55">{label}</span>
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Provider ──────────────────────────────────────────────── */
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  /* Global ⌘K / Ctrl+K */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ open, close }}>
      {children}

      {/*
        No AnimatePresence — when isOpen becomes false React unmounts
        this entire subtree immediately. Zero chance of a z-50 overlay
        lingering invisibly and blocking pointer events.
        The spring entrance on <Palette> still gives the animated feel.
      */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />

          {/* Palette */}
          <div className="relative flex items-start justify-center px-4 pt-[14vh] pointer-events-none">
            <div className="w-full max-w-lg pointer-events-auto">
              <Palette onClose={close} />
            </div>
          </div>
        </div>
      )}
    </CommandPaletteContext.Provider>
  );
}
