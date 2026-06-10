"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Menu,
  Globe,
  FileText,
  BookOpen,
  Search,
  Hash,
  Mail,
  Navigation,
  Rows,
  Zap,
  Share2,
  PanelLeft,
} from "lucide-react";
import {
  cmsMenus,
  cmsPages,
  cmsBlogs,
  type CmsMenu,
  type CmsPageListItem,
  type CmsBlogListItem,
} from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/common/Modal";

// ─── Visibility ────────────────────────────────────────────────────────────────

const DEVICE_OPTIONS = [
  { value: "desktop", label: "Desktop", hint: "≥ 1024px" },
  { value: "tablet", label: "Tablet", hint: "768 – 1023px" },
  { value: "mobile", label: "Mobile", hint: "< 768px" },
];

function VisibilityBadge({ vis }: { vis: string[] }) {
  const isAll = !vis.length || vis.includes("all");
  const labels = isAll
    ? ["All devices"]
    : vis.map((v) => DEVICE_OPTIONS.find((o) => o.value === v)?.label ?? v);
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((l) => (
        <span
          key={l}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary"
        >
          {l}
        </span>
      ))}
    </div>
  );
}

function VisibilityMultiSelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const isAll = !value.length || value.includes("all");

  function toggleAll(checked: boolean) {
    onChange(checked ? ["all"] : ["desktop"]);
  }

  function toggleDevice(device: string, checked: boolean) {
    const current = isAll ? [] : value.filter((v) => v !== "all");
    const next = checked
      ? [...current.filter((v) => v !== device), device]
      : current.filter((v) => v !== device);
    onChange(next.length === 0 ? ["all"] : next);
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative flex-shrink-0">
          <input
            type="checkbox"
            className="sr-only"
            checked={isAll}
            onChange={(e) => toggleAll(e.target.checked)}
          />
          <div
            className={`w-9 h-5 rounded-full transition-colors ${isAll ? "bg-primary" : "bg-muted border border-border"}`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isAll ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-foreground">
            Show on all devices
          </span>
          <p className="text-[11px] text-muted-foreground">
            Visible on desktop, tablet, and mobile
          </p>
        </div>
      </label>

      {!isAll && (
        <div className="ml-1 pl-4 border-l-2 border-border space-y-2.5">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Show on specific devices
          </p>
          {DEVICE_OPTIONS.map((opt) => {
            const checked = value.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors flex-shrink-0
                  ${checked ? "bg-primary border-primary" : "border-border bg-background group-hover:border-primary/50"}`}
                >
                  {checked && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      viewBox="0 0 10 10"
                      fill="none"
                    >
                      <path
                        d="M1.5 5L3.5 7.5L8.5 2.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) => toggleDevice(opt.value, e.target.checked)}
                  />
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground">
                    {opt.label}
                  </span>
                  <span className="ml-2 text-[11px] text-muted-foreground">
                    {opt.hint}
                  </span>
                </div>
              </label>
            );
          })}
          {value.filter((v) => v !== "all").length === 0 && (
            <p className="text-[11px] text-rose-500">
              Select at least one device.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Menu type config ──────────────────────────────────────────────────────────

export const MENU_TYPES: {
  value: string;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    value: "navigation",
    label: "Navigation",
    icon: Navigation,
    description: "Main header nav",
  },
  {
    value: "footer",
    label: "Footer",
    icon: Rows,
    description: "Footer link column",
  },
  {
    value: "utility",
    label: "Utility bar",
    icon: Zap,
    description: "Top bar (account, etc.)",
  },
  {
    value: "social",
    label: "Social",
    icon: Share2,
    description: "Social media links",
  },
  {
    value: "sidebar",
    label: "Sidebar",
    icon: PanelLeft,
    description: "Sidebar navigation",
  },
];

// ─── Link type helpers ─────────────────────────────────────────────────────────

type LinkType = "url" | "page" | "blog" | "anchor" | "email";

function detectLinkType(url: string): LinkType {
  if (url.startsWith("page://")) return "page";
  if (url.startsWith("blog://")) return "blog";
  if (url.startsWith("#")) return "anchor";
  if (url.startsWith("mailto:")) return "email";
  return "url";
}

function extractRef(url: string): string {
  if (url.startsWith("page://")) return url.slice(7);
  if (url.startsWith("blog://")) return url.slice(7);
  if (url.startsWith("#")) return url.slice(1);
  if (url.startsWith("mailto:")) return url.slice(7);
  return url;
}

// ─── Searchable picker list ────────────────────────────────────────────────────

function PickerList<
  T extends { id: string; title: string; slug: string; published: boolean },
>({
  items,
  selectedId,
  onSelect,
  placeholder,
}: {
  items: T[];
  selectedId: string;
  onSelect: (item: T) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = items.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.slug.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
        <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <input
          className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="max-h-48 overflow-y-auto divide-y divide-border">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            No results
          </p>
        ) : (
          filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors hover:bg-muted/60
                ${selectedId === item.id ? "bg-primary/8" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-medium truncate ${selectedId === item.id ? "text-primary" : "text-foreground"}`}
                >
                  {item.title}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono truncate">
                  /{item.slug}
                </p>
              </div>
              {!item.published && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex-shrink-0">
                  Draft
                </span>
              )}
              {selectedId === item.id && (
                <svg
                  className="w-3.5 h-3.5 text-primary flex-shrink-0"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M2 7L5.5 10.5L12 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Item row ─────────────────────────────────────────────────────────────────

interface DraftItem {
  label: string;
  url: string;
  target: string;
  visibility: string[];
}

const LINK_TYPES: {
  value: LinkType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "url", label: "URL", icon: Globe },
  { value: "page", label: "Page", icon: FileText },
  { value: "blog", label: "Blog", icon: BookOpen },
  { value: "anchor", label: "Anchor", icon: Hash },
  { value: "email", label: "Email", icon: Mail },
];

function ItemRow({
  item,
  index,
  total,
  pages,
  blogs,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  item: DraftItem;
  index: number;
  total: number;
  pages: CmsPageListItem[];
  blogs: CmsBlogListItem[];
  onChange: (field: keyof DraftItem, value: string | string[]) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const iCls =
    "w-full rounded-md px-2.5 py-1.5 text-xs border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-colors";
  const linkType = detectLinkType(item.url);
  const ref = extractRef(item.url);

  function setLinkType(type: LinkType) {
    if (type === "url") onChange("url", "");
    else if (type === "page")
      onChange("url", pages[0] ? `page://${pages[0].id}` : "page://");
    else if (type === "blog")
      onChange("url", blogs[0] ? `blog://${blogs[0].id}` : "blog://");
    else if (type === "anchor") onChange("url", "#");
    else if (type === "email") onChange("url", "mailto:");
  }

  function selectPage(page: CmsPageListItem) {
    onChange("url", `page://${page.id}`);
    if (!item.label) onChange("label", page.title);
  }

  function selectBlog(blog: CmsBlogListItem) {
    onChange("url", `blog://${blog.id}`);
    if (!item.label) onChange("label", blog.title);
  }

  const selectedPage =
    linkType === "page" ? pages.find((p) => p.id === ref) : null;
  const selectedBlog =
    linkType === "blog" ? blogs.find((b) => b.id === ref) : null;

  return (
    <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-3">
      {/* Top row: grip + label + move/delete */}
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            Label
          </p>
          <input
            className={iCls}
            placeholder="e.g. Home"
            value={item.label}
            onChange={(e) => onChange("label", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-0.5 flex-shrink-0 mt-4">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded text-muted-foreground hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Link type selector */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground mb-1.5">
          Link to
        </p>
        <div className="flex gap-1">
          {LINK_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setLinkType(value)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-colors flex-1 justify-center
                ${
                  linkType === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/50"
                }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Link content based on type */}
      {linkType === "url" && (
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            URL
          </p>
          <input
            className={iCls}
            placeholder="e.g. /contact or https://example.com"
            value={item.url}
            onChange={(e) => onChange("url", e.target.value)}
          />
        </div>
      )}

      {linkType === "page" && (
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-1.5">
            Select page
            {selectedPage && (
              <span className="ml-2 font-normal text-muted-foreground">
                → <span className="font-mono">/{selectedPage.slug}</span>
              </span>
            )}
          </p>
          {pages.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No pages found.
            </p>
          ) : (
            <PickerList
              items={pages}
              selectedId={ref}
              onSelect={selectPage}
              placeholder="Search pages…"
            />
          )}
        </div>
      )}

      {linkType === "blog" && (
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-1.5">
            Select blog post
            {selectedBlog && (
              <span className="ml-2 font-normal text-muted-foreground">
                → <span className="font-mono">/blog/{selectedBlog.slug}</span>
              </span>
            )}
          </p>
          {blogs.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No blog posts found.
            </p>
          ) : (
            <PickerList
              items={blogs}
              selectedId={ref}
              onSelect={selectBlog}
              placeholder="Search blog posts…"
            />
          )}
        </div>
      )}

      {linkType === "anchor" && (
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            Section ID
          </p>
          <div className="flex items-center rounded-md border border-border bg-background overflow-hidden focus-within:border-primary transition-colors">
            <span className="px-2.5 py-1.5 text-xs text-muted-foreground border-r border-border bg-muted/50 select-none">
              #
            </span>
            <input
              className="flex-1 px-2.5 py-1.5 text-xs text-foreground bg-transparent outline-none"
              placeholder="section-id"
              value={ref}
              onChange={(e) =>
                onChange(
                  "url",
                  `#${e.target.value.replace(/\s+/g, "-").toLowerCase()}`,
                )
              }
            />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Scrolls to an element with this ID on the page.
          </p>
        </div>
      )}

      {linkType === "email" && (
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            Email address
          </p>
          <div className="flex items-center rounded-md border border-border bg-background overflow-hidden focus-within:border-primary transition-colors">
            <span className="px-2.5 py-1.5 text-xs text-muted-foreground border-r border-border bg-muted/50 select-none">
              mailto:
            </span>
            <input
              className="flex-1 px-2.5 py-1.5 text-xs text-foreground bg-transparent outline-none"
              placeholder="hello@example.com"
              type="email"
              value={ref}
              onChange={(e) => onChange("url", `mailto:${e.target.value}`)}
            />
          </div>
        </div>
      )}

      {/* Open in */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground mb-1">
          Open in
        </p>
        <select
          className={iCls}
          value={item.target}
          onChange={(e) => onChange("target", e.target.value)}
        >
          <option value="_self">Same tab</option>
          <option value="_blank">New tab</option>
        </select>
      </div>

      {/* Show on */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground mb-1.5">
          Show on
        </p>
        <VisibilityMultiSelect
          value={item.visibility}
          onChange={(v) => onChange("visibility", v)}
        />
      </div>
    </div>
  );
}

// ─── Create / Edit modal ───────────────────────────────────────────────────────

interface EditState {
  name: string;
  slug: string;
  menuType: string;
  visibility: string[];
  items: DraftItem[];
}

function MenuModal({
  open,
  initial,
  onClose,
  onSave,
  saving,
}: {
  open: boolean;
  initial: EditState | null;
  onClose: () => void;
  onSave: (s: EditState) => void;
  saving: boolean;
}) {
  const isNew = !initial;
  const [form, setForm] = useState<EditState>(
    initial ?? {
      name: "",
      slug: "",
      menuType: "navigation",
      visibility: ["all"],
      items: [],
    },
  );
  const [pages, setPages] = useState<CmsPageListItem[]>([]);
  const [blogs, setBlogs] = useState<CmsBlogListItem[]>([]);

  useEffect(() => {
    if (!open) return;
    setForm(
      initial ?? {
        name: "",
        slug: "",
        menuType: "navigation",
        visibility: ["all"],
        items: [],
      },
    );
    // Fetch pages and blogs once when modal opens
    Promise.all([cmsPages.list(), cmsBlogs.list()])
      .then(([p, b]) => {
        setPages(p);
        setBlogs(b);
      })
      .catch(() => {});
  }, [open, initial]);

  function handleName(name: string) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setForm((f) => ({ ...f, name, ...(isNew ? { slug } : {}) }));
  }
  function addItem() {
    setForm((f) => ({
      ...f,
      items: [
        ...f.items,
        { label: "", url: "", target: "_self", visibility: ["all"] },
      ],
    }));
  }
  function updateItem(
    i: number,
    field: keyof DraftItem,
    val: string | string[],
  ) {
    setForm((f) => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: val };
      return { ...f, items };
    });
  }
  function deleteItem(i: number) {
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  }
  function moveItem(from: number, to: number) {
    setForm((f) => {
      const items = [...f.items];
      const [item] = items.splice(from, 1);
      items.splice(to, 0, item);
      return { ...f, items };
    });
  }

  const inputCls =
    "w-full rounded-lg px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-colors";

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={isNew ? "Create Menu" : "Edit Menu"}
      maxWidth="lg"
    >
      <div className="px-6 py-5 space-y-5">
        {/* Name + Slug */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Menu Name <span className="text-rose-500">*</span>
            </label>
            <input
              className={inputCls}
              placeholder="e.g. Main Navigation"
              value={form.name}
              onChange={(e) => handleName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Slug <span className="text-rose-500">*</span>
            </label>
            <input
              className={inputCls}
              placeholder="e.g. main-nav"
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                }))
              }
            />
          </div>
        </div>

        {/* Menu type */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-2">
            Menu type
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {MENU_TYPES.map(({ value, label, icon: Icon, description }) => {
              const active = form.menuType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, menuType: value }))}
                  title={description}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg border text-center transition-all ${
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-medium leading-tight">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            {MENU_TYPES.find((t) => t.value === form.menuType)?.description}
          </p>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-2">
            Show on
          </label>
          <VisibilityMultiSelect
            value={form.visibility}
            onChange={(v) => setForm((f) => ({ ...f, visibility: v }))}
          />
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Controls which device sizes this menu is visible on in the live
            site.
          </p>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-foreground">
              Menu Items ({form.items.length})
            </label>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
          {form.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed border-border text-center">
              <Menu className="w-6 h-6 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                No items yet. Click &rdquo;Add Item&rdquo; to start.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
              {form.items.map((item, i) => (
                <ItemRow
                  key={i}
                  item={item}
                  index={i}
                  total={form.items.length}
                  pages={pages}
                  blogs={blogs}
                  onChange={(f, v) => updateItem(i, f, v)}
                  onDelete={() => deleteItem(i)}
                  onMoveUp={() => moveItem(i, i - 1)}
                  onMoveDown={() => moveItem(i, i + 1)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(form)}
            disabled={saving || !form.name.trim() || !form.slug.trim()}
            className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving…" : isNew ? "Create Menu" : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Menu card ─────────────────────────────────────────────────────────────────

function MenuCard({
  menu,
  onEdit,
  onDelete,
}: {
  menu: CmsMenu;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const itemCount = menu._count?.items ?? menu.items?.length ?? 0;
  const typeConfig =
    MENU_TYPES.find((t) => t.value === (menu.menuType ?? "navigation")) ??
    MENU_TYPES[0];
  const TypeIcon = typeConfig.icon;
  return (
    <div className="flex items-start justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Menu className="w-4 h-4 text-primary flex-shrink-0" />
          <h3 className="text-sm font-semibold text-foreground truncate">
            {menu.name}
          </h3>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground shrink-0">
            <TypeIcon className="w-2.5 h-2.5" />
            {typeConfig.label}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground font-mono mb-2">
          {menu.slug}
        </p>
        <VisibilityBadge vis={menu.visibility} />
        <p className="mt-2 text-[11px] text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>
      <div className="flex items-center gap-1 ml-3 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main view ─────────────────────────────────────────────────────────────────

export function MenusView() {
  const [menus, setMenus] = useState<CmsMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CmsMenu | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsMenu | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadMenus = useCallback(async () => {
    setLoading(true);
    try {
      setMenus(await cmsMenus.list());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  function openCreate() {
    setEditTarget(null);
    setModalOpen(true);
  }
  function openEdit(menu: CmsMenu) {
    setEditTarget(menu);
    setModalOpen(true);
  }

  async function handleSave(form: EditState) {
    setSaving(true);
    try {
      let menu: CmsMenu;
      if (editTarget) {
        menu = await cmsMenus.update(editTarget.id, {
          name: form.name,
          slug: form.slug,
          menuType: form.menuType,
          visibility: form.visibility,
        });
        menu = await cmsMenus.setItems(menu.id, form.items);
        setMenus((prev) => prev.map((m) => (m.id === menu.id ? menu : m)));
      } else {
        menu = await cmsMenus.create({
          name: form.name,
          slug: form.slug,
          menuType: form.menuType,
          visibility: form.visibility,
        });
        if (form.items.length > 0)
          menu = await cmsMenus.setItems(menu.id, form.items);
        setMenus((prev) => [...prev, menu]);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await cmsMenus.delete(deleteTarget.id);
      setMenus((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const editInitial: EditState | null = editTarget
    ? {
        name: editTarget.name,
        slug: editTarget.slug,
        menuType: editTarget.menuType ?? "navigation",
        visibility: editTarget.visibility,
        items: (editTarget.items ?? []).map((it) => ({
          label: it.label,
          url: it.url,
          target: it.target,
          visibility: it.visibility ?? ["all"],
        })),
      }
    : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Menus"
        description="Create navigation menus and attach them to blocks in the editor."
      >
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Menu
        </button>
      </PageHeader>

      <div className="rounded-2xl border border-border bg-card">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : menus.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Menu className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                No menus yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create a menu and attach it to a nav block in the editor.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create your first menu
            </button>
          </div>
        ) : (
          <div className="p-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {menus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onEdit={() => {
                  cmsMenus.get(menu.id).then((full) => openEdit(full));
                }}
                onDelete={() => setDeleteTarget(menu)}
              />
            ))}
          </div>
        )}
      </div>

      <MenuModal
        open={modalOpen}
        initial={editInitial}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      />

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Menu"
        maxWidth="sm"
        iconVariant="danger"
        icon={<Trash2 className="w-5 h-5" />}
      >
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground mb-6">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.name}
            </span>
            ? All menu items will be removed. This cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-60 transition-colors"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
