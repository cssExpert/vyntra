"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Code2,
  Palette,
  Layout,
  AlignCenter,
  Box,
  PencilRuler,
  Type,
  Sliders,
  Navigation,
  LayoutTemplate,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import { cmsMenus, cmsLayouts, type CmsMenu, type CmsLayout } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { BlockDataEditor } from "./BlockDataEditor";

const TYPOGRAPHY_SIZES = [
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-4xl",
  "text-5xl",
  "text-6xl",
  "text-7xl",
  "text-8xl",
  "text-9xl",
];
const FONT_WEIGHTS = [
  "font-thin",
  "font-light",
  "font-normal",
  "font-medium",
  "font-semibold",
  "font-bold",
  "font-extrabold",
  "font-black",
];
const TEXT_ALIGNS = ["text-left", "text-center", "text-right", "text-justify"];
const DISPLAY = [
  "block",
  "inline-block",
  "inline",
  "flex",
  "inline-flex",
  "grid",
  "hidden",
];
const FLEX_DIRECTIONS = [
  "flex-row",
  "flex-col",
  "flex-row-reverse",
  "flex-col-reverse",
];
const JUSTIFY = [
  "justify-start",
  "justify-center",
  "justify-end",
  "justify-between",
  "justify-around",
  "justify-evenly",
];
const ALIGN_ITEMS = [
  "items-start",
  "items-center",
  "items-end",
  "items-stretch",
  "items-baseline",
];
const ROUNDED = [
  "rounded-none",
  "rounded-sm",
  "rounded",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
  "rounded-3xl",
  "rounded-full",
];
const SPACING = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "8",
  "10",
  "12",
  "14",
  "16",
  "20",
  "24",
  "32",
  "40",
  "48",
  "56",
  "64",
  "auto",
];
const HTML_TAGS = [
  "div",
  "section",
  "article",
  "main",
  "aside",
  "header",
  "footer",
  "nav",
  "span",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "button",
  "ul",
  "li",
  "form",
  "input",
  "img",
];

const inputCls =
  "w-full rounded-md px-2 py-1.5 text-xs focus:outline-none transition-colors bg-muted dark:bg-muted border border-border dark:border-border text-foreground dark:text-foreground focus:border-primary dark:focus:border-primary";

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border dark:border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest transition-colors
          text-muted-foreground dark:text-muted-foreground hover:text-muted-foreground dark:hover:text-foreground"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" />
          {title}
        </div>
        {open ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InspectorInput({
  className: cls = "",
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">) {
  return <Input {...props} className={cn(inputCls, cls)} />;
}

function InspectorSelect({
  className: cls = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputCls, cls)} />;
}

function SelectControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] w-20 flex-shrink-0 text-muted-foreground dark:text-muted-foreground">
        {label}
      </label>
      <InspectorSelect value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt || "—"}
          </option>
        ))}
      </InspectorSelect>
    </div>
  );
}

function SpacingControl({
  prefix,
  label,
}: {
  prefix: "p" | "m";
  label: string;
}) {
  const { selectedId, findNode, removeClassName, addClassName } =
    useEditorStore();
  const node = selectedId ? findNode(selectedId) : null;
  if (!node) return null;
  const classes = (node.className ?? "").split(" ").filter(Boolean);
  const sides = [
    { key: `${prefix}t`, label: "T" },
    { key: `${prefix}r`, label: "R" },
    { key: `${prefix}b`, label: "B" },
    { key: `${prefix}l`, label: "L" },
  ];
  const getVal = (key: string) => {
    const c = classes.find((c) => c.startsWith(`${key}-`));
    return c ? c.split("-")[1] : "";
  };
  const setVal = (key: string, val: string) => {
    const ex = classes.find((c) => c.startsWith(`${key}-`));
    if (ex) removeClassName(node.id, ex);
    if (val) addClassName(node.id, `${key}-${val}`);
  };
  return (
    <div>
      <label className="text-[10px] mb-2 block font-medium uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
        {label}
      </label>
      <div className="grid grid-cols-4 gap-1.5">
        {sides.map(({ key, label: sl }) => (
          <div key={key}>
            <div className="text-[10px] text-center mb-1 text-muted-foreground dark:text-muted-foreground">
              {sl}
            </div>
            <InspectorSelect
              value={getVal(key)}
              onChange={(e) => setVal(key, e.target.value)}
              className="w-full"
            >
              <option value="">-</option>
              {SPACING.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </InspectorSelect>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassBadge({ cls, onRemove }: { cls: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs group bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground border border-border dark:border-border">
      <span className="font-mono">{cls}</span>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground dark:text-muted-foreground hover:text-red-500"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

function MenuSection({
  node,
}: {
  node: { id: string; props: Record<string, string> };
}) {
  const { updateNode, findNode } = useEditorStore();
  const [menus, setMenus] = useState<CmsMenu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cmsMenus
      .list()
      .then((data) => {
        setMenus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentMenuId = node.props["data-menu-id"] ?? "";

  function handleChange(menuId: string) {
    const current = findNode(node.id);
    if (!current) return;
    const props = { ...(current.props ?? {}) };
    if (menuId) {
      props["data-menu-id"] = menuId;
    } else {
      delete props["data-menu-id"];
    }
    updateNode(node.id, { props });
  }

  return (
    <Section title="Menu" icon={Navigation}>
      <div>
        <label className="text-[10px] mb-1.5 block text-muted-foreground dark:text-muted-foreground">
          Linked Menu
        </label>
        {loading ? (
          <div className="h-7 rounded-md bg-muted animate-pulse" />
        ) : menus.length === 0 ? (
          <p className="text-[10px] text-muted-foreground italic">
            No menus found. Create one in CMS → Menus.
          </p>
        ) : (
          <InspectorSelect
            value={currentMenuId}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full"
          >
            <option value="">— None —</option>
            {menus.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </InspectorSelect>
        )}
        {currentMenuId && (
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            This block renders the selected menu on the live site.
          </p>
        )}
      </div>
    </Section>
  );
}

function PageSettingsPanel({
  layoutId,
  onLayoutChange,
}: {
  layoutId: string | null;
  onLayoutChange: (id: string | null) => void;
}) {
  const [layouts, setLayouts] = useState<CmsLayout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cmsLayouts
      .list()
      .then(setLayouts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside className="w-64 flex flex-col h-full border-l bg-card border-border dark:border-border">
      <div className="min-h-16 flex-shrink-0 px-4 py-3 border-b border-border dark:border-border">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-3.5 h-3.5 text-muted-foreground dark:text-muted-foreground" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground dark:text-muted-foreground">
            Page Settings
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 py-4 space-y-4">
          <div>
            <label className="text-[10px] mb-1.5 block font-medium uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
              Layout
            </label>
            {loading ? (
              <div className="h-8 rounded-md bg-muted animate-pulse" />
            ) : layouts.length === 0 ? (
              <p className="text-[10px] text-muted-foreground italic">
                No layouts yet. Create one in CMS → Layouts.
              </p>
            ) : (
              <InspectorSelect
                value={layoutId ?? ""}
                onChange={(e) => onLayoutChange(e.target.value || null)}
              >
                <option value="">Use default layout</option>
                {layouts.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                    {l.isDefault ? " (default)" : ""}
                  </option>
                ))}
              </InspectorSelect>
            )}
            <p className="mt-1.5 text-[10px] text-muted-foreground dark:text-muted-foreground">
              Controls the header & footer shown on this page.
            </p>
          </div>

          <div className="pt-2 border-t border-border dark:border-border">
            <p className="text-[10px] text-muted-foreground dark:text-muted-foreground italic">
              Select an element on the canvas to inspect its styles.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function RightSidebar({
  layoutId = null,
  onLayoutChange = () => {},
}: {
  layoutId?: string | null;
  onLayoutChange?: (id: string | null) => void;
}) {
  const {
    selectedId,
    findNode,
    updateNode,
    setClassName,
    addClassName,
    removeClassName,
  } = useEditorStore();
  const [newClass, setNewClass] = useState("");

  const node = selectedId ? findNode(selectedId) : null;
  const classes = node ? (node.className ?? "").split(" ").filter(Boolean) : [];

  if (!node) {
    return (
      <PageSettingsPanel layoutId={layoutId} onLayoutChange={onLayoutChange} />
    );
  }

  if (node.type === "typed-block" && node.blockType) {
    return <BlockDataEditor node={node} />;
  }

  const getClass = (prefix: string) =>
    classes.find((c) => c.startsWith(prefix + "-")) || "";
  const setClass = (prefix: string, val: string) => {
    const ex = getClass(prefix);
    if (ex) removeClassName(node.id, ex);
    if (val) addClassName(node.id, val);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClass.trim()) {
      newClass
        .trim()
        .split(/\s+/)
        .forEach((c) => addClassName(node.id, c));
      setNewClass("");
    }
  };

  return (
    <aside className="w-64 flex flex-col h-full overflow-hidden border-l bg-card border-border dark:border-border">
      {/* Node header */}
      <div className="min-h-16 flex-shrink-0 px-4 py-3 border-b border-border dark:border-border">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-primary dark:bg-primary text-white dark:text-primary-foreground">
            &lt;{node.tag}&gt;
          </span>
          <span className="text-xs truncate flex-1 text-muted-foreground dark:text-muted-foreground">
            {node.type}
          </span>
        </div>
        <p className="text-[10px] font-mono mt-0.5 text-muted-foreground dark:text-muted-foreground">
          id: {node.id}
        </p>
      </div>

      {/* Scrollable sections */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Classes */}
        <Section title="Classes" icon={Code2}>
          <div className="flex flex-wrap gap-1 mb-2 min-h-[20px]">
            {classes.length === 0 ? (
              <span className="text-xs italic text-muted-foreground dark:text-muted-foreground">
                No classes applied
              </span>
            ) : (
              classes.map((cls) => (
                <ClassBadge
                  key={cls}
                  cls={cls}
                  onRemove={() => removeClassName(node.id, cls)}
                />
              ))
            )}
          </div>
          <form onSubmit={handleAddClass} className="flex gap-1.5">
            <InspectorInput
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              placeholder="Add Tailwind class…"
              className="flex-1"
            />
            <button
              type="submit"
              className="group rounded-md px-2 text-xs transition-colors flex-shrink-0 bg-primary dark:bg-primary text-white dark:text-primary-foreground hover:bg-primary dark:hover:bg-primary"
            >
              <Plus className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 w-3.5 h-3.5" />
            </button>
          </form>
          <div>
            <label className="text-[10px] block mb-1 text-muted-foreground dark:text-muted-foreground">
              Full class string
            </label>
            <textarea
              value={node.className}
              onChange={(e) => setClassName(node.id, e.target.value)}
              className="w-full rounded-md px-2.5 py-2 text-xs font-mono focus:outline-none min-h-[54px] resize-none transition-colors
                bg-muted dark:bg-muted border border-border dark:border-border
                text-foreground dark:text-foreground
                focus:border-primary dark:focus:border-primary"
            />
          </div>
        </Section>

        {/* Element */}
        <Section title="Element" icon={Code2} defaultOpen={false}>
          <div>
            <label className="text-[10px] mb-1.5 block text-muted-foreground dark:text-muted-foreground">
              HTML Tag
            </label>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {HTML_TAGS.slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  onClick={() => updateNode(node.id, { tag })}
                  className={cn(
                    "py-1 rounded text-[10px] font-mono transition-colors",
                    node.tag === tag
                      ? "bg-primary dark:bg-primary text-white dark:text-primary-foreground"
                      : "bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground",
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
            <InspectorSelect
              value={node.tag}
              onChange={(e) => updateNode(node.id, { tag: e.target.value })}
              className="w-full"
            >
              {HTML_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </InspectorSelect>
          </div>
          {node.content !== undefined && (
            <div>
              <label className="text-[10px] mb-1 block text-muted-foreground dark:text-muted-foreground">
                Content
              </label>
              <textarea
                value={node.content || ""}
                onChange={(e) =>
                  updateNode(node.id, { content: e.target.value })
                }
                className="w-full rounded-md px-2.5 py-2 text-xs focus:outline-none min-h-[54px] resize-none transition-colors
                  bg-muted dark:bg-muted border border-border dark:border-border
                  text-foreground dark:text-foreground
                  focus:border-primary dark:focus:border-primary"
              />
            </div>
          )}
        </Section>

        {/* Typography */}
        <Section title="Typography" icon={Type}>
          <SelectControl
            label="Size"
            value={getClass("text")}
            options={["", ...TYPOGRAPHY_SIZES]}
            onChange={(v) => setClass("text", v)}
          />
          <SelectControl
            label="Weight"
            value={getClass("font")}
            options={["", ...FONT_WEIGHTS]}
            onChange={(v) => setClass("font", v)}
          />
          <SelectControl
            label="Align"
            value={classes.find((c) => TEXT_ALIGNS.includes(c)) || ""}
            options={["", ...TEXT_ALIGNS]}
            onChange={(v) => {
              TEXT_ALIGNS.forEach((a) => {
                if (classes.includes(a)) removeClassName(node.id, a);
              });
              if (v) addClassName(node.id, v);
            }}
          />
          <div className="flex items-center gap-2">
            <label className="text-[10px] w-20 flex-shrink-0 text-muted-foreground dark:text-muted-foreground">
              Color
            </label>
            <InspectorInput
              placeholder="text-foreground"
              className="flex-1"
              onBlur={(e) => {
                if (e.target.value) {
                  addClassName(node.id, e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </div>
        </Section>

        {/* Layout */}
        <Section title="Layout" icon={Layout}>
          <SelectControl
            label="Display"
            value={classes.find((c) => DISPLAY.includes(c)) || ""}
            options={["", ...DISPLAY]}
            onChange={(v) => {
              DISPLAY.forEach((d) => {
                if (classes.includes(d)) removeClassName(node.id, d);
              });
              if (v) addClassName(node.id, v);
            }}
          />
          <SelectControl
            label="Direction"
            value={classes.find((c) => FLEX_DIRECTIONS.includes(c)) || ""}
            options={["", ...FLEX_DIRECTIONS]}
            onChange={(v) => {
              FLEX_DIRECTIONS.forEach((d) => {
                if (classes.includes(d)) removeClassName(node.id, d);
              });
              if (v) addClassName(node.id, v);
            }}
          />
          <SelectControl
            label="Justify"
            value={classes.find((c) => JUSTIFY.includes(c)) || ""}
            options={["", ...JUSTIFY]}
            onChange={(v) => {
              JUSTIFY.forEach((d) => {
                if (classes.includes(d)) removeClassName(node.id, d);
              });
              if (v) addClassName(node.id, v);
            }}
          />
          <SelectControl
            label="Align"
            value={classes.find((c) => ALIGN_ITEMS.includes(c)) || ""}
            options={["", ...ALIGN_ITEMS]}
            onChange={(v) => {
              ALIGN_ITEMS.forEach((d) => {
                if (classes.includes(d)) removeClassName(node.id, d);
              });
              if (v) addClassName(node.id, v);
            }}
          />
        </Section>

        {/* Spacing */}
        <Section title="Spacing" icon={AlignCenter}>
          <SpacingControl prefix="p" label="Padding" />
          <SpacingControl prefix="m" label="Margin" />
        </Section>

        {/* Size */}
        <Section title="Size" icon={PencilRuler} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Width", prefix: "w" },
              { label: "Height", prefix: "h" },
              { label: "Min W", prefix: "min-w" },
              { label: "Min H", prefix: "min-h" },
              { label: "Max W", prefix: "max-w" },
              { label: "Max H", prefix: "max-h" },
            ].map(({ label, prefix }) => (
              <div key={prefix}>
                <label className="text-[10px] mb-1 block text-muted-foreground dark:text-muted-foreground">
                  {label}
                </label>
                <InspectorInput
                  value={getClass(prefix).replace(`${prefix}-`, "") || ""}
                  onChange={(e) => {
                    const ex = getClass(prefix);
                    if (ex) removeClassName(node.id, ex);
                    if (e.target.value)
                      addClassName(node.id, `${prefix}-${e.target.value}`);
                  }}
                  placeholder="auto"
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Borders */}
        <Section title="Borders" icon={Box} defaultOpen={false}>
          <SelectControl
            label="Radius"
            value={classes.find((c) => ROUNDED.includes(c)) || ""}
            options={["", ...ROUNDED]}
            onChange={(v) => {
              ROUNDED.forEach((r) => {
                if (classes.includes(r)) removeClassName(node.id, r);
              });
              if (v) addClassName(node.id, v);
            }}
          />
          <div className="flex items-center gap-2">
            <label className="text-[10px] w-20 flex-shrink-0 text-muted-foreground dark:text-muted-foreground">
              Border
            </label>
            <InspectorInput
              placeholder="border border-border"
              className="flex-1"
              onBlur={(e) => {
                if (e.target.value) {
                  e.target.value
                    .split(" ")
                    .forEach((c) => addClassName(node.id, c));
                  e.target.value = "";
                }
              }}
            />
          </div>
        </Section>

        {/* Background */}
        <Section title="Background" icon={Palette} defaultOpen={false}>
          <div className="flex items-center gap-2">
            <label className="text-[10px] w-20 flex-shrink-0 text-muted-foreground dark:text-muted-foreground">
              Color
            </label>
            <InspectorInput
              placeholder="bg-blue-500"
              className="flex-1"
              onBlur={(e) => {
                if (e.target.value) {
                  addClassName(node.id, e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {[
              "bg-foreground",
              "bg-card",
              "bg-muted",
              "bg-blue-600",
              "bg-primary",
              "bg-purple-600",
              "bg-red-500",
              "bg-orange-500",
              "bg-yellow-400",
              "bg-green-500",
              "bg-teal-500",
              "bg-cyan-500",
            ].map((bg) => (
              <button
                key={bg}
                onClick={() => {
                  const ex = classes.find((c) => c.startsWith("bg-"));
                  if (ex) removeClassName(node.id, ex);
                  addClassName(node.id, bg);
                }}
                className={cn(
                  "w-full aspect-square rounded-md transition-all",
                  bg,
                  classes.includes(bg)
                    ? "ring-2 ring-ring dark:ring-primary scale-110"
                    : "ring-2 ring-transparent",
                )}
                title={bg}
              />
            ))}
          </div>
        </Section>

        {/* Effects */}
        <Section title="Effects" icon={Sliders} defaultOpen={false}>
          {[
            {
              label: "Shadow",
              prefix: "shadow",
              opts: [
                "",
                "shadow-none",
                "shadow-sm",
                "shadow",
                "shadow-md",
                "shadow-lg",
                "shadow-xl",
                "shadow-2xl",
              ],
            },
            {
              label: "Opacity",
              prefix: "opacity-",
              opts: [
                "",
                "opacity-0",
                "opacity-25",
                "opacity-50",
                "opacity-75",
                "opacity-90",
                "opacity-100",
              ],
            },
            {
              label: "Transition",
              prefix: "transition",
              opts: [
                "",
                "transition-none",
                "transition",
                "transition-all",
                "transition-colors",
                "transition-opacity",
                "transition-transform",
              ],
            },
          ].map(({ label, prefix, opts }) => (
            <div key={label} className="flex items-center gap-2">
              <label className="text-[10px] w-20 flex-shrink-0 text-muted-foreground dark:text-muted-foreground">
                {label}
              </label>
              <InspectorSelect
                value={classes.find((c) => c.startsWith(prefix)) || ""}
                onChange={(e) => {
                  const ex = classes.find((c) => c.startsWith(prefix));
                  if (ex) removeClassName(node.id, ex);
                  if (e.target.value) addClassName(node.id, e.target.value);
                }}
              >
                {opts.map((s) => (
                  <option key={s} value={s}>
                    {s || "—"}
                  </option>
                ))}
              </InspectorSelect>
            </div>
          ))}
        </Section>

        {/* Menu — shown for nav/header/footer blocks */}
        {(node.tag === "nav" ||
          node.tag === "header" ||
          node.tag === "footer" ||
          node.type.toLowerCase().includes("nav") ||
          node.type.toLowerCase().includes("menu")) && (
          <MenuSection node={{ id: node.id, props: node.props ?? {} }} />
        )}
      </div>
    </aside>
  );
}
