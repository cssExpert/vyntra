"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Popover } from "react-tiny-popover";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  ChevronDown,
  Search,
  X,
  Plus,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { Sketch } from "@uiw/react-color";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibraryStore, type BrandKit } from "@/store/libraryStore";
import { cn } from "@/lib/utils";

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
}

// ── Color swatches ────────────────────────────────────────────────────────────

const SWATCH_PRESETS = [
  "#F76235",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
  "#000000",
  "#ffffff",
];

// ── Google Fonts list ─────────────────────────────────────────────────────────

export const GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Nunito",
  "Ubuntu",
  "Oswald",
  "Source Sans 3",
  "Merriweather",
  "PT Sans",
  "Noto Sans",
  "Playfair Display",
  "Lora",
  "Fira Sans",
  "DM Sans",
  "Space Grotesk",
  "Plus Jakarta Sans",
  "Outfit",
  "Sora",
  "Manrope",
  "Work Sans",
  "Mulish",
  "Rubik",
  "Karla",
  "Jost",
  "Josefin Sans",
  "Libre Baskerville",
  "EB Garamond",
  "Cormorant Garamond",
  "Crimson Text",
  "Spectral",
  "Bitter",
  "Arimo",
  "Cabin",
  "Quicksand",
  "Comfortaa",
  "Pacifico",
  "Dancing Script",
  "Great Vibes",
  "Righteous",
  "Bebas Neue",
  "Anton",
  "Teko",
  "Barlow",
  "Exo 2",
  "Saira",
] as const;

const BUTTON_STYLES: { value: BrandKit["buttonStyle"]; label: string }[] = [
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
  { value: "sharp", label: "Sharp" },
];

// ── ColorField — @uiw/react-color Sketch popover ──────────────────────────────

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
  }>({ left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  function handleToggle() {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const left = Math.min(r.left, window.innerWidth - 220);
      if (window.innerHeight - r.bottom >= 300) {
        setCoords({ top: r.bottom + 4, bottom: undefined, left });
      } else {
        setCoords({
          top: undefined,
          bottom: window.innerHeight - r.top + 4,
          left,
        });
      }
    }
    setOpen((p) => !p);
  }

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(t) &&
        popoverRef.current &&
        !popoverRef.current.contains(t)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div>
      <label className="block text-[11px] text-muted-foreground mb-1">
        {label}
      </label>
      <div ref={triggerRef}>
        <button
          type="button"
          onClick={handleToggle}
          className="w-full flex items-center gap-2 border border-border rounded-md px-2 h-9 hover:border-primary/60 transition-colors"
        >
          <span
            className="w-5 h-5 rounded border border-black/10 shadow-sm shrink-0"
            style={{ backgroundColor: value }}
          />
          <span className="text-xs font-mono text-foreground uppercase flex-1 text-left">
            {value}
          </span>
          <ChevronDown
            className={cn(
              "w-3 h-3 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              ...(coords.top !== undefined ? { top: coords.top } : {}),
              ...(coords.bottom !== undefined ? { bottom: coords.bottom } : {}),
              left: coords.left,
              zIndex: 9999,
            }}
            className="drop-shadow-xl rounded-md overflow-hidden border border-border"
          >
            <Sketch
              color={value}
              presetColors={SWATCH_PRESETS}
              onChange={(c) => onChange(c.hex)}
              style={
                {
                  "--sketch-background": "hsl(var(--card))",
                } as React.CSSProperties
              }
            />
          </div>,
          document.body,
        )}
    </div>
  );
}

// ── FontPicker ────────────────────────────────────────────────────────────────

type FontPickerTab = "google" | "custom";

export function FontPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (font: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<FontPickerTab>("google");
  const [search, setSearch] = useState("");
  const [customName, setCustomName] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [triggerWidth, setTriggerWidth] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const filtered = GOOGLE_FONTS.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase()),
  );

  const isCustomFont = !GOOGLE_FONTS.includes(
    value as (typeof GOOGLE_FONTS)[number],
  );

  function handleToggle() {
    if (!open && triggerRef.current) {
      setTriggerWidth(triggerRef.current.getBoundingClientRect().width);
    }
    setOpen((v) => !v);
  }

  function selectGoogleFont(font: string) {
    const id = `gfont-${font.replace(/ /g, "+")}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;600;700&display=swap`;
      document.head.appendChild(link);
    }
    onChange(font);
    setOpen(false);
    setSearch("");
  }

  function applyCustom() {
    if (!customName.trim()) return;
    if (customUrl.trim()) {
      const existing = document.querySelector(
        `style[data-font="${customName.trim()}"]`,
      );
      if (!existing) {
        const style = document.createElement("style");
        style.setAttribute("data-font", customName.trim());
        style.textContent = `@import url('${customUrl.trim()}');`;
        document.head.appendChild(style);
      }
    }
    onChange(customName.trim());
    setCustomName("");
    setCustomUrl("");
    setOpen(false);
  }

  const dropdownContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: -4,
            transition: { duration: 0.1 },
          }}
          style={{ width: triggerWidth || 220 }}
          className="rounded-xl border border-border bg-card shadow-xl overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-border">
            {(["google", "custom"] as FontPickerTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setTab(t);
                }}
                className={cn(
                  "flex-1 py-2 text-xs font-semibold transition-colors",
                  tab === t
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t === "google" ? "Google Fonts" : "Custom Font"}
              </button>
            ))}
          </div>

          {tab === "google" ? (
            <>
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search fonts…"
                    className="w-full h-8 pl-8 pr-7 rounded-md border border-border bg-muted text-xs focus:outline-none focus:border-primary"
                  />
                  {search && (
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearch("");
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    No fonts found
                  </p>
                ) : (
                  filtered.map((font) => (
                    <button
                      key={font}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectGoogleFont(font);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-muted transition-colors text-left",
                        value === font && "bg-primary/10 text-primary",
                      )}
                      style={{ fontFamily: `'${font}', sans-serif` }}
                    >
                      <span>{font}</span>
                      {value === font && (
                        <span className="text-[10px] font-semibold text-primary">
                          Selected
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="px-3 py-2 border-t border-border">
                <a
                  href="https://fonts.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Browse all on Google Fonts
                </a>
              </div>
            </>
          ) : (
            <div className="p-3 flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">
                  Font Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. MyBrandFont"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">
                  Google Fonts / @import URL
                  <span className="text-muted-foreground font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <Input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://fonts.googleapis.com/css2?family=..."
                  className="h-8 text-xs"
                />
                <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed">
                  Paste a Google Fonts embed URL or a self-hosted CSS @import.
                  Leave blank if the font is already loaded globally.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyCustom();
                }}
                disabled={!customName.trim()}
                className="w-full"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Apply Custom Font
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1.5">
        {label}
        {isCustomFont && (
          <span className="ml-1.5 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
            Custom
          </span>
        )}
      </label>

      <Popover
        isOpen={open}
        positions={["bottom", "top"]}
        align="start"
        padding={4}
        reposition
        onClickOutside={() => setOpen(false)}
        containerStyle={{ zIndex: "9999" }}
        content={dropdownContent}
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          className="w-full h-9 flex items-center justify-between gap-2 px-3 rounded-md border border-border bg-background text-sm hover:border-primary/60 transition-colors"
          style={{ fontFamily: `'${value}', sans-serif` }}
        >
          <span className="truncate">{value}</span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      </Popover>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function CreateBrandKitModal({
  isOpen: isOpenProp,
  onClose: onCloseProp,
}: Props) {
  const { createBrandKit, brandKitModalOpen, setBrandKitModalOpen } =
    useLibraryStore();
  const isOpen = isOpenProp !== undefined ? isOpenProp : brandKitModalOpen;
  const onClose = onCloseProp ?? (() => setBrandKitModalOpen(false));

  const [name, setName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [logo, setLogo] = useState("");
  const logoFileRef = useRef<HTMLInputElement>(null);

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogo(URL.createObjectURL(file));
    e.target.value = "";
  }
  const [fontHeading, setFontHeading] = useState("Raleway");
  const [fontBody, setFontBody] = useState("Inter");
  const [buttonStyle, setButtonStyle] =
    useState<BrandKit["buttonStyle"]>("rounded");

  function handleSave() {
    if (!name.trim()) return;
    createBrandKit({
      name: name.trim(),
      primaryColor,
      secondaryColor,
      accentColor,
      logo,
      fontHeading,
      fontBody,
      buttonStyle,
    });
    onClose();
    resetForm();
  }

  function resetForm() {
    setName("");
    setPrimaryColor("#6366f1");
    setSecondaryColor("#8b5cf6");
    setAccentColor("#f59e0b");
    setLogo("");
    setFontHeading("Raleway");
    setFontBody("Inter");
    setButtonStyle("rounded");
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      icon={<Palette className="w-4 h-4" />}
      title="Create Brand Kit"
      description="Define your brand colors, fonts, and style."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Create Brand Kit
          </Button>
        </div>
      }
    >
      <div className="flex flex-col p-5 gap-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Kit Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Agency Brand"
            autoFocus
          />
        </div>

        {/* Colors */}
        <div>
          <p className="text-xs font-semibold text-foreground mb-2">Colors</p>
          <div className="grid grid-cols-3 gap-3">
            <ColorField
              label="Primary"
              value={primaryColor}
              onChange={setPrimaryColor}
            />
            <ColorField
              label="Secondary"
              value={secondaryColor}
              onChange={setSecondaryColor}
            />
            <ColorField
              label="Accent"
              value={accentColor}
              onChange={setAccentColor}
            />
          </div>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Logo URL{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://..."
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground shrink-0">or</span>
            <input
              ref={logoFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoFile}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => logoFileRef.current?.click()}
              className="shrink-0 h-9 gap-1.5 px-3"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Browse
            </Button>
          </div>
        </div>

        {/* Fonts */}
        <div className="grid grid-cols-2 gap-3">
          <FontPicker
            label="Heading Font"
            value={fontHeading}
            onChange={setFontHeading}
          />
          <FontPicker
            label="Body Font"
            value={fontBody}
            onChange={setFontBody}
          />
        </div>

        {/* Button style */}
        <div>
          <p className="text-xs font-semibold text-foreground mb-2">
            Button Style
          </p>
          <div className="flex gap-2">
            {BUTTON_STYLES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setButtonStyle(value)}
                className={cn(
                  "flex-1 py-2 text-xs font-medium border transition-colors",
                  value === "rounded"
                    ? "rounded-md"
                    : value === "pill"
                      ? "rounded-full"
                      : "rounded-none",
                  buttonStyle === value
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
