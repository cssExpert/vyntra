"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Save, X, Search, Check,
  Globe, CheckCircle2, XCircle,
  Folder, Tag, FileText, CreditCard, Truck, ShoppingCart, Loader2,
} from "lucide-react";
import {
  storeCustomerGroups,
  storeCategories,
  cmsPages,
  type ApiCustomerGroup,
  type ApiCustomerGroupRestrictions,
  type CustomerGroupRestrictionMode,
  type ApiGroupProductSummary,
} from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const inp = "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15";

const STARTER_PAYMENT_METHODS  = ["card", "paypal", "cod", "bank_transfer"];
const STARTER_SHIPPING_METHODS = ["standard", "express", "pickup"];
const STARTER_ONLINE_GATEWAYS  = ["stripe", "paypal", "razorpay"];

type TabKey = "categories" | "products" | "pages" | "payment" | "shipping" | "gateways" | "purchasing";
type ProductChip  = Omit<ApiGroupProductSummary, "price">;
type CategoryNode = { id: string; name: string; parentId?: string };

const NAV_ITEMS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "categories", label: "Categories", icon: <Folder      size={15} /> },
  { key: "products",   label: "Products",   icon: <Tag         size={15} /> },
  { key: "pages",      label: "CMS Pages",  icon: <FileText    size={15} /> },
  { key: "payment",    label: "Payments",   icon: <CreditCard  size={15} /> },
  { key: "shipping",   label: "Shipping",   icon: <Truck       size={15} /> },
  { key: "gateways",   label: "Online Pay", icon: <Globe       size={15} /> },
  { key: "purchasing", label: "Purchasing", icon: <ShoppingCart size={15} /> },
];

const MODE_SHORT: Record<CustomerGroupRestrictionMode, string> = {
  all:             "All",
  only_selected:   "WL",
  except_selected: "BL",
};

const MODE_DOT: Record<CustomerGroupRestrictionMode, string> = {
  all:             "bg-muted-foreground/30",
  only_selected:   "bg-primary",
  except_selected: "bg-amber-500",
};

const MODE_TEXT: Record<CustomerGroupRestrictionMode, string> = {
  all:             "text-muted-foreground",
  only_selected:   "text-primary",
  except_selected: "text-amber-600 dark:text-amber-400",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMode(key: TabKey, r: ApiCustomerGroupRestrictions): CustomerGroupRestrictionMode | null {
  switch (key) {
    case "categories": return r.categoriesMode;
    case "products":   return r.productsMode;
    case "pages":      return r.pagesMode;
    case "payment":    return r.paymentMethodsMode;
    case "shipping":   return r.shippingMethodsMode;
    case "gateways":   return r.onlineGatewaysMode;
    case "purchasing": return null;
  }
}

function getCount(key: TabKey, r: ApiCustomerGroupRestrictions): number {
  switch (key) {
    case "categories": return r.categoryIds.length;
    case "products":   return r.productIds.length;
    case "pages":      return r.pageIds.length;
    case "payment":    return r.paymentMethodSlugs.length;
    case "shipping":   return r.shippingMethodSlugs.length;
    case "gateways":   return r.onlineGatewaySlugs.length;
    case "purchasing": return 0;
  }
}

// ─── Mode Cards ───────────────────────────────────────────────────────────────

const MODE_OPTIONS: { value: CustomerGroupRestrictionMode; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: "all",             label: "All",       desc: "All items visible",        icon: <Globe        size={18} /> },
  { value: "only_selected",   label: "Whitelist", desc: "Only checked visible",     icon: <CheckCircle2 size={18} /> },
  { value: "except_selected", label: "Blacklist", desc: "Checked items are hidden", icon: <XCircle      size={18} /> },
];

function ModeCards({
  value,
  onChange,
}: {
  value: CustomerGroupRestrictionMode;
  onChange: (v: CustomerGroupRestrictionMode) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {MODE_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`relative flex flex-col gap-3 rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
              active
                ? "border-primary bg-primary/5"
                : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
            }`}
          >
            <div className="flex items-start justify-between">
              <span className={active ? "text-primary" : "text-muted-foreground"}>{opt.icon}</span>
              {/* Radio circle */}
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                active ? "border-primary" : "border-border"
              }`}>
                {active && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
            </div>
            <div>
              <p className={`text-[13px] font-semibold ${active ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{opt.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Category Tree Panel ──────────────────────────────────────────────────────

function CategoryPanel({
  categories,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearAll,
}: {
  categories: CategoryNode[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}) {
  const [search, setSearch] = useState("");

  const parents  = categories.filter((c) => !c.parentId);
  const getKids  = (pid: string) => categories.filter((c) => c.parentId === pid);

  const filtered = search.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" type="button" onClick={onSelectAll}>Select all</Button>
        <Button variant="outline" size="sm" type="button" onClick={onClearAll}>Clear all</Button>
      </div>

      <div className="max-h-80 overflow-y-auto rounded-lg border border-border divide-y divide-border">
        {filtered ? (
          filtered.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">No categories match your search.</p>
          ) : (
            filtered.map((c) => (
              <label key={c.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/40">
                <Checkbox checked={selectedIds.includes(c.id)} onCheckedChange={() => onToggle(c.id)} />
                <span className="text-[13px] text-foreground">{c.name}</span>
              </label>
            ))
          )
        ) : parents.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground text-center">No categories found.</p>
        ) : (
          parents.map((parent) => {
            const kids = getKids(parent.id);
            return (
              <div key={parent.id}>
                {/* Parent row */}
                <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 bg-muted/20">
                  <Checkbox checked={selectedIds.includes(parent.id)} onCheckedChange={() => onToggle(parent.id)} />
                  <Folder size={14} className="text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground">{parent.name}</p>
                    {kids.length > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        {kids.length} sub-categor{kids.length === 1 ? "y" : "ies"}
                      </p>
                    )}
                  </div>
                </label>
                {/* Children rows */}
                {kids.map((kid) => (
                  <label
                    key={kid.id}
                    className="flex items-center gap-3 pl-10 pr-4 py-2.5 cursor-pointer hover:bg-muted/40 border-t border-border/40"
                  >
                    <Checkbox checked={selectedIds.includes(kid.id)} onCheckedChange={() => onToggle(kid.id)} />
                    <div className="w-3.5 h-3.5 rounded-full border border-border flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] text-foreground truncate">{kid.name}</p>
                      <p className="text-[11px] text-muted-foreground">sub-category of {parent.name}</p>
                    </div>
                  </label>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Slug Multi-Select ────────────────────────────────────────────────────────

function SlugMultiSelect({
  starter,
  selected,
  onToggle,
  onAddCustom,
}: {
  starter: string[];
  selected: string[];
  onToggle: (slug: string) => void;
  onAddCustom: (slug: string) => void;
}) {
  const [customInput, setCustomInput] = useState("");
  const allSlugs = [...new Set([...starter, ...selected])];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {allSlugs.map((slug) => {
          const isSelected = selected.includes(slug);
          return (
            <button
              key={slug}
              type="button"
              onClick={() => onToggle(slug)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium border transition-all cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {isSelected && <Check size={12} />}
              {slug}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Add custom slug…"
          className={`${inp} flex-1`}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const v = customInput.trim();
            if (!v) return;
            onAddCustom(v);
            setCustomInput("");
          }}
        />
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            const v = customInput.trim();
            if (!v) return;
            onAddCustom(v);
            setCustomInput("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

// ─── Save Bar ─────────────────────────────────────────────────────────────────

function SaveBar({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div className="flex justify-end pt-4 border-t border-border mt-2">
      <Button onClick={onSave} disabled={saving} size="sm">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface RestrictionsViewProps {
  groupId: string;
}

export function RestrictionsView({ groupId }: RestrictionsViewProps) {
  const router = useRouter();

  const [group,        setGroup]        = useState<ApiCustomerGroup | null>(null);
  const [restrictions, setRestrictions] = useState<ApiCustomerGroupRestrictions | null>(null);
  const [categories,   setCategories]   = useState<CategoryNode[]>([]);
  const [pages,        setPages]        = useState<{ id: string; title: string }[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [activeTab,    setActiveTab]    = useState<TabKey>("categories");
  const [savingTab,    setSavingTab]    = useState<TabKey | null>(null);

  // Products sub-state
  const [productSubTab,          setProductSubTab]          = useState<"manual" | "pattern">("manual");
  const [productSearch,          setProductSearch]          = useState("");
  const [productSearchResults,   setProductSearchResults]   = useState<ApiGroupProductSummary[]>([]);
  const [selectedProducts,       setSelectedProducts]       = useState<ProductChip[]>([]);
  const [patternInput,           setPatternInput]           = useState("");
  const [patternPreview,         setPatternPreview]         = useState<{ count: number; matches: ApiGroupProductSummary[] } | null>(null);
  const [patternError,           setPatternError]           = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [g, r, catRes, pageRes] = await Promise.all([
        storeCustomerGroups.get(groupId),
        storeCustomerGroups.restrictions.get(groupId),
        storeCategories.list({ take: 500 }).catch(() => ({ data: [], total: 0 })),
        cmsPages.list().catch(() => []),
      ]);
      setGroup(g);
      setRestrictions(r);
      setSelectedProducts(r.productItems);
      setCategories(catRes.data.map((c) => ({ id: c.id, name: c.name, parentId: c.parentId ?? undefined })));
      setPages(pageRes.map((p) => ({ id: p.id, title: p.title })));
      setPatternInput(r.productPattern ?? "");
    } catch {
      // keep empty
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!productSearch.trim()) { setProductSearchResults([]); return; }
    const h = setTimeout(() => {
      storeCustomerGroups.restrictions.searchProducts(productSearch)
        .then(setProductSearchResults)
        .catch(() => {});
    }, 250);
    return () => clearTimeout(h);
  }, [productSearch]);

  if (isLoading || !restrictions || !group) {
    return (
      <div className="space-y-4">
        <div className="h-9 w-64 rounded-sm bg-muted animate-pulse" />
        <div className="flex gap-2">
          {[...Array(7)].map((_, i) => <div key={i} className="h-8 w-28 rounded-full bg-muted animate-pulse" />)}
        </div>
        <div className="flex gap-5 mt-4">
          <div className="w-52 shrink-0 space-y-1">
            {[...Array(7)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}
          </div>
          <div className="flex-1 h-96 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  // ── State helpers ──────────────────────────────────────────────────────────

  const update = <K extends keyof ApiCustomerGroupRestrictions>(key: K, value: ApiCustomerGroupRestrictions[K]) =>
    setRestrictions((prev) => (prev ? { ...prev, [key]: value } : prev));

  const saveTab = async (tab: TabKey, patch: Partial<ApiCustomerGroupRestrictions>) => {
    setSavingTab(tab);
    try {
      const updated = await storeCustomerGroups.restrictions.update(groupId, patch);
      setRestrictions(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save restrictions");
    } finally {
      setSavingTab(null);
    }
  };

  // Categories
  const toggleCategory = (id: string) => {
    const kids = categories.filter((c) => c.parentId === id).map((c) => c.id);
    if (restrictions.categoryIds.includes(id)) {
      const toRemove = new Set([id, ...kids]);
      update("categoryIds", restrictions.categoryIds.filter((c) => !toRemove.has(c)));
    } else {
      update("categoryIds", [...new Set([...restrictions.categoryIds, id, ...kids])]);
    }
  };

  // Pages
  const togglePage = (id: string) => {
    const next = restrictions.pageIds.includes(id)
      ? restrictions.pageIds.filter((p) => p !== id)
      : [...restrictions.pageIds, id];
    update("pageIds", next);
  };

  // Products
  const toggleProduct = (product: ProductChip) => {
    setSelectedProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      const next   = exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
      update("productIds", next.map((p) => p.id));
      return next;
    });
  };

  const testPattern = async () => {
    setPatternError(null);
    setPatternPreview(null);
    try {
      const res = await storeCustomerGroups.restrictions.previewPattern(groupId, patternInput);
      setPatternPreview(res);
    } catch (err) {
      setPatternError(err instanceof Error ? err.message : "Invalid pattern");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const selectedCatCount = restrictions.categoryIds.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex flex-col gap-4"
    >
      <PageHeader
        title={`Manage Permissions — ${group.name}`}
        description="Control product, category, page, and payment visibility for customers in this group."
        breadcrumbs={[
          { label: "Store", href: "/store" },
          { label: "Customer Groups", href: "/store/customer-groups" },
          { label: group.name, href: `/store/customer-groups/${groupId}/edit` },
          { label: "Restrictions" },
        ]}
      >
        <Button variant="outline" size="lg" onClick={() => router.push("/store/customer-groups")}>
          <X size={16} /> Done
        </Button>
      </PageHeader>

      {/* ── Top status chips ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {NAV_ITEMS.map((item) => {
          const mode  = getMode(item.key, restrictions);
          const count = mode && mode !== "all" ? getCount(item.key, restrictions) : null;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all cursor-pointer ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${mode ? MODE_DOT[mode] : "bg-muted-foreground/30"}`} />
              <span className={isActive ? "text-primary" : "text-muted-foreground"}>{item.icon}</span>
              <span>{item.label}</span>
              <span className={`font-semibold ${mode ? (isActive ? "text-primary" : MODE_TEXT[mode]) : "text-muted-foreground"}`}>
                {mode
                  ? mode === "all"
                    ? MODE_SHORT[mode]
                    : `${MODE_SHORT[mode]}: ${count}`
                  : "—"}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="flex gap-5 items-start">

        {/* Sidebar */}
        <nav className="w-52 shrink-0 bg-card rounded-xl border border-border overflow-hidden">
          {NAV_ITEMS.map((item) => {
            const mode     = getMode(item.key, restrictions);
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all cursor-pointer border-l-[3px] ${
                  isActive
                    ? "border-l-primary bg-primary/5 text-primary"
                    : "border-l-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <span className={`shrink-0 ${isActive ? "text-primary" : ""}`}>{item.icon}</span>
                <span className="flex-1 text-[13px] font-medium">{item.label}</span>
                {mode && mode !== "all" ? (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    mode === "only_selected"
                      ? "bg-primary/15 text-primary"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  }`}>
                    {mode === "only_selected" ? "WL" : "BL"}
                  </span>
                ) : (
                  <span className="text-[13px] text-muted-foreground/40">—</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Content panel */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-card rounded-xl border border-border p-5 space-y-4"
            >

              {/* ── Categories ── */}
              {activeTab === "categories" && (
                <>
                  <div className="flex items-center gap-2">
                    <Folder size={16} className="text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Categories</h3>
                    {restrictions.categoriesMode !== "all" && (
                      <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {selectedCatCount} {restrictions.categoriesMode === "only_selected" ? "whitelisted" : "blacklisted"}
                      </span>
                    )}
                  </div>
                  <ModeCards value={restrictions.categoriesMode} onChange={(v) => update("categoriesMode", v)} />
                  {restrictions.categoriesMode !== "all" && (
                    <>
                      <p className="text-[12px] text-muted-foreground border border-border/60 bg-muted/20 rounded-sm px-3 py-2">
                        {restrictions.categoriesMode === "only_selected"
                          ? "Only checked categories are visible to this group. Selecting a parent auto-selects its children."
                          : "Checked categories are hidden from this group. Selecting a parent auto-hides its children."}
                      </p>
                      <CategoryPanel
                        categories={categories}
                        selectedIds={restrictions.categoryIds}
                        onToggle={toggleCategory}
                        onSelectAll={() => update("categoryIds", categories.map((c) => c.id))}
                        onClearAll={() => update("categoryIds", [])}
                      />
                    </>
                  )}
                  <SaveBar
                    onSave={() => saveTab("categories", { categoriesMode: restrictions.categoriesMode, categoryIds: restrictions.categoryIds })}
                    saving={savingTab === "categories"}
                  />
                </>
              )}

              {/* ── Products ── */}
              {activeTab === "products" && (
                <>
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Products</h3>
                    {restrictions.productsMode !== "all" && restrictions.productIds.length > 0 && (
                      <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {restrictions.productIds.length} selected
                      </span>
                    )}
                  </div>
                  <ModeCards value={restrictions.productsMode} onChange={(v) => update("productsMode", v)} />

                  {restrictions.productsMode !== "all" && (
                    <>
                      {/* Sub-tabs: Manual / Pattern */}
                      <div className="flex gap-0 border-b border-border">
                        {(["manual", "pattern"] as const).map((sub) => (
                          <button
                            key={sub}
                            onClick={() => setProductSubTab(sub)}
                            className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
                              productSubTab === sub
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {sub === "manual" ? "Manual Selection" : "Pattern (Regex)"}
                          </button>
                        ))}
                      </div>

                      {productSubTab === "manual" && (
                        <div className="space-y-3">
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              placeholder="Search products by name or SKU…"
                              className="pl-9"
                            />
                          </div>
                          {productSearchResults.length > 0 && (
                            <div className="border border-border rounded-lg divide-y divide-border max-h-48 overflow-y-auto">
                              {productSearchResults.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => toggleProduct(p)}
                                  className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-muted/40 cursor-pointer transition-colors"
                                >
                                  <span className="text-[13px] text-foreground">
                                    {p.name}{" "}
                                    <span className="text-muted-foreground text-[11px]">({p.sku})</span>
                                  </span>
                                  {selectedProducts.some((sp) => sp.id === p.id) && (
                                    <Check size={14} className="text-primary shrink-0" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                          {selectedProducts.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {selectedProducts.map((p) => (
                                <span key={p.id} className="flex items-center gap-1.5 text-[12px] bg-muted px-2.5 py-1 rounded-full text-foreground">
                                  {p.name}
                                  <button onClick={() => toggleProduct(p)} className="text-muted-foreground hover:text-destructive cursor-pointer">
                                    <X size={12} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          {selectedProducts.length === 0 && !productSearch && (
                            <p className="text-[12px] text-muted-foreground">Search and select products above.</p>
                          )}
                        </div>
                      )}

                      {productSubTab === "pattern" && (
                        <div className="space-y-3">
                          <label className="block text-[13px] font-medium text-foreground">
                            Regex pattern — matched against product name and SKU
                          </label>
                          <div className="flex gap-2">
                            <Input
                              value={patternInput}
                              onChange={(e) => setPatternInput(e.target.value)}
                              placeholder="e.g. ^SUB-"
                              className={`${inp} flex-1 font-mono text-[13px]`}
                            />
                            <Button variant="outline" onClick={testPattern} disabled={!patternInput.trim()}>
                              Test Pattern
                            </Button>
                          </div>
                          {patternError && <p className="text-[12px] text-destructive">{patternError}</p>}
                          {patternPreview && (
                            <div className="space-y-2">
                              <p className="text-[13px] text-muted-foreground">
                                <span className="font-semibold text-foreground">{patternPreview.count}</span> product(s) match this pattern
                              </p>
                              {patternPreview.matches.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {patternPreview.matches.map((p) => (
                                    <span key={p.id} className="text-[12px] bg-muted px-2.5 py-1 rounded-full text-foreground">{p.name}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <SaveBar
                    onSave={() => saveTab("products", {
                      productsMode: restrictions.productsMode,
                      productIds:   restrictions.productIds,
                      productPattern: patternInput || undefined,
                    })}
                    saving={savingTab === "products"}
                  />
                </>
              )}

              {/* ── CMS Pages ── */}
              {activeTab === "pages" && (
                <>
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">CMS Pages</h3>
                    {restrictions.pagesMode !== "all" && restrictions.pageIds.length > 0 && (
                      <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {restrictions.pageIds.length} selected
                      </span>
                    )}
                  </div>
                  <ModeCards value={restrictions.pagesMode} onChange={(v) => update("pagesMode", v)} />
                  {restrictions.pagesMode !== "all" && (
                    <div className="max-h-72 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                      {pages.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground text-center">No pages found.</p>
                      ) : (
                        pages.map((page) => (
                          <label key={page.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/40">
                            <Checkbox
                              checked={restrictions.pageIds.includes(page.id)}
                              onCheckedChange={() => togglePage(page.id)}
                            />
                            <span className="text-[13px] text-foreground">{page.title}</span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                  <SaveBar
                    onSave={() => saveTab("pages", { pagesMode: restrictions.pagesMode, pageIds: restrictions.pageIds })}
                    saving={savingTab === "pages"}
                  />
                </>
              )}

              {/* ── Payments ── */}
              {activeTab === "payment" && (
                <>
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Payment Methods</h3>
                  </div>
                  <ModeCards value={restrictions.paymentMethodsMode} onChange={(v) => update("paymentMethodsMode", v)} />
                  {restrictions.paymentMethodsMode !== "all" && (
                    <SlugMultiSelect
                      starter={STARTER_PAYMENT_METHODS}
                      selected={restrictions.paymentMethodSlugs}
                      onToggle={(slug) =>
                        update("paymentMethodSlugs",
                          restrictions.paymentMethodSlugs.includes(slug)
                            ? restrictions.paymentMethodSlugs.filter((s) => s !== slug)
                            : [...restrictions.paymentMethodSlugs, slug],
                        )}
                      onAddCustom={(slug) =>
                        update("paymentMethodSlugs", [...new Set([...restrictions.paymentMethodSlugs, slug])])
                      }
                    />
                  )}
                  <SaveBar
                    onSave={() => saveTab("payment", { paymentMethodsMode: restrictions.paymentMethodsMode, paymentMethodSlugs: restrictions.paymentMethodSlugs })}
                    saving={savingTab === "payment"}
                  />
                </>
              )}

              {/* ── Shipping ── */}
              {activeTab === "shipping" && (
                <>
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Shipping Methods</h3>
                  </div>
                  <ModeCards value={restrictions.shippingMethodsMode} onChange={(v) => update("shippingMethodsMode", v)} />
                  {restrictions.shippingMethodsMode !== "all" && (
                    <SlugMultiSelect
                      starter={STARTER_SHIPPING_METHODS}
                      selected={restrictions.shippingMethodSlugs}
                      onToggle={(slug) =>
                        update("shippingMethodSlugs",
                          restrictions.shippingMethodSlugs.includes(slug)
                            ? restrictions.shippingMethodSlugs.filter((s) => s !== slug)
                            : [...restrictions.shippingMethodSlugs, slug],
                        )}
                      onAddCustom={(slug) =>
                        update("shippingMethodSlugs", [...new Set([...restrictions.shippingMethodSlugs, slug])])
                      }
                    />
                  )}
                  <SaveBar
                    onSave={() => saveTab("shipping", { shippingMethodsMode: restrictions.shippingMethodsMode, shippingMethodSlugs: restrictions.shippingMethodSlugs })}
                    saving={savingTab === "shipping"}
                  />
                </>
              )}

              {/* ── Online Gateways ── */}
              {activeTab === "gateways" && (
                <>
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Online Payment Gateways</h3>
                  </div>
                  <ModeCards value={restrictions.onlineGatewaysMode} onChange={(v) => update("onlineGatewaysMode", v)} />
                  {restrictions.onlineGatewaysMode !== "all" && (
                    <SlugMultiSelect
                      starter={STARTER_ONLINE_GATEWAYS}
                      selected={restrictions.onlineGatewaySlugs}
                      onToggle={(slug) =>
                        update("onlineGatewaySlugs",
                          restrictions.onlineGatewaySlugs.includes(slug)
                            ? restrictions.onlineGatewaySlugs.filter((s) => s !== slug)
                            : [...restrictions.onlineGatewaySlugs, slug],
                        )}
                      onAddCustom={(slug) =>
                        update("onlineGatewaySlugs", [...new Set([...restrictions.onlineGatewaySlugs, slug])])
                      }
                    />
                  )}
                  <SaveBar
                    onSave={() => saveTab("gateways", { onlineGatewaysMode: restrictions.onlineGatewaysMode, onlineGatewaySlugs: restrictions.onlineGatewaySlugs })}
                    saving={savingTab === "gateways"}
                  />
                </>
              )}

              {/* ── Purchasing ── */}
              {activeTab === "purchasing" && (
                <>
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={16} className="text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Purchasing Rules</h3>
                  </div>
                  <p className="text-[13px] text-muted-foreground">
                    These settings are managed on the group&apos;s main form.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-[11px] text-muted-foreground mb-1">Requires Approval</p>
                      <p className="text-[15px] font-semibold text-foreground">{group.requiresApproval ? "Yes" : "No"}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-[11px] text-muted-foreground mb-1">Min Order Value</p>
                      <p className="text-[15px] font-semibold text-foreground">{group.minOrderValue ?? "—"}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-[11px] text-muted-foreground mb-1">Max Order Value</p>
                      <p className="text-[15px] font-semibold text-foreground">{group.maxOrderValue ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button variant="outline" onClick={() => router.push(`/store/customer-groups/${groupId}/edit`)}>
                      Edit on Group Form
                    </Button>
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
