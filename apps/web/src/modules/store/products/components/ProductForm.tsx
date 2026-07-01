"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { StoreImagePicker } from "./StoreImagePicker";
import { ProductDescriptionEditor } from "./ProductDescriptionEditor";
import Link from "next/link";
import {
  Save, X, Plus, Trash2, RefreshCw, Package, Zap, Download,
  Layers, Gift, Repeat, Wrench, ExternalLink, ChevronDown, Search, Check,
} from "lucide-react";
import Image from "next/image";
import type { ProductType, ProductStatus, StockStatus, StoreProduct, StoreAttribute, StoreCategory } from "../../store.types";
import { SAMPLE_PRODUCTS } from "../../store.data";
import { storeCategories, storeAttributes } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AttributeOption = {
  id: string;
  name: string;
  colorHex?: string;
};

// A "selected attribute" on a product — references a global attribute, picks which option values apply
export type ProductAttribute = {
  attributeId: string;       // references StoreAttribute.id
  name: string;              // denormalized for display
  usedInVariation: boolean;  // from global attribute (can be overridden)
  selectedOptionIds: string[]; // which option IDs from the global attribute are active on this product
};

export type ProductVariantRow = {
  id: string;
  attrs: Record<string, string>;
  price: string;
  sku: string;
  stock: string;
  enabled: boolean;
};

export type DownloadFile = {
  id: string;
  name: string;
  url: string;
};

export type BundleItem = {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
};

export type ProductFormData = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  specification: string;
  featuredImage: string | null;
  type: ProductType;
  status: ProductStatus;
  publishedAt: string;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  taxClass: string;
  sku: string;
  stock: string;
  stockStatus: StockStatus;
  lowStockThreshold: string;
  weight: string;
  trackInventory: boolean;
  backorderEnabled: boolean;
  downloadFiles: DownloadFile[];
  downloadLimit: string;
  downloadExpiry: string;
  attributes: ProductAttribute[];
  variants: ProductVariantRow[];
  billingPeriod: string;
  billingInterval: string;
  trialPeriod: string;
  signupFee: string;
  bundleItems: BundleItem[];
  giftCardAmounts: string[];
  allowCustomAmount: boolean;
  giftCardExpiry: string;
  categoryIds: string[];
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const inp = "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15";
const sel = "w-full h-9 rounded-sm border border-border bg-background px-3 text-[14px] text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15 cursor-pointer";
const ta  = "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none";
const lbl = "block text-sm font-medium text-foreground mb-1.5";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const cardAnim  = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } } };

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODUCT_TYPES: { value: ProductType; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: "simple",       label: "Simple Product",    desc: "Single physical product with inventory",  icon: <Package   size={14} /> },
  { value: "variable",     label: "Variable Product",  desc: "Product with variants (size, color…)",    icon: <Layers    size={14} /> },
  { value: "digital",      label: "Digital Download",  desc: "Downloadable file — PDF, software, music, etc.", icon: <Download  size={14} /> },
  { value: "service",      label: "Service",           desc: "A service you offer to customers",        icon: <Wrench    size={14} /> },
  { value: "subscription", label: "Subscription",      desc: "Recurring billing product",               icon: <Repeat    size={14} /> },
  { value: "bundle",       label: "Bundle",            desc: "Group of products sold together",         icon: <Zap       size={14} /> },
  { value: "gift_card",    label: "Gift Card",         desc: "Store gift card / voucher",               icon: <Gift      size={14} /> },
];


function buildCategoryPath(id: string, all: StoreCategory[]): string {
  const cat = all.find((c) => c.id === id);
  if (!cat) return "";
  if (!cat.parentId) return cat.name;
  const parent = buildCategoryPath(cat.parentId, all);
  return parent ? `${parent} → ${cat.name}` : cat.name;
}

// ─── CategoryDropdown ─────────────────────────────────────────────────────────

function CategoryDropdown({
  selectedIds,
  onChange,
  allCats,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  allCats: StoreCategory[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const paths = allCats.map((c) => ({ ...c, path: buildCategoryPath(c.id, allCats) }));
  const filtered = search.trim()
    ? paths.filter((c) => c.path.toLowerCase().includes(search.toLowerCase()))
    : paths.sort((a, b) => a.path.localeCompare(b.path));

  const toggle = (id: string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter((s) => s !== id) : [...selectedIds, id]);

  const selectedLabels = selectedIds.map((id) => {
    const found = paths.find((c) => c.id === id);
    return found ? found.path : id;
  });

  return (
    <div className="relative">
      {/* Selected chips */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedIds.map((id, i) => (
            <span key={id} className="flex items-center gap-1 bg-primary/10 text-primary text-[12px] font-medium px-2.5 py-1 rounded-md border border-primary/20 max-w-[200px]">
              <span className="truncate">{selectedLabels[i]}</span>
              <button type="button" onClick={() => toggle(id)} className="ml-0.5 text-primary/60 hover:text-destructive cursor-pointer shrink-0">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 rounded-md border px-3 h-9 text-[13px] transition-colors cursor-pointer ${
          open ? "border-primary bg-background text-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/50"
        }`}
      >
        <span className={selectedIds.length > 0 ? "text-foreground" : ""}>
          {selectedIds.length === 0 ? "Select categories…" : `${selectedIds.length} categor${selectedIds.length === 1 ? "y" : "ies"} selected`}
        </span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <Search size={13} className="text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories…"
                className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
            {/* List */}
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-[13px] text-muted-foreground text-center py-4">No categories found</p>
              ) : (
                filtered.map((cat) => {
                  const isSelected = selectedIds.includes(cat.id);
                  const depth = (cat.path.match(/→/g) || []).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggle(cat.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[13px] transition-colors cursor-pointer hover:bg-muted/50 ${
                        isSelected ? "bg-primary/5 text-primary" : "text-foreground"
                      }`}
                      style={{ paddingLeft: `${12 + depth * 12}px` }}
                    >
                      <span className={`flex items-center justify-center w-4 h-4 rounded-sm border shrink-0 transition-colors ${
                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border"
                      }`}>
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </span>
                      <span className="flex-1 min-w-0">
                        {depth > 0 ? (
                          <>
                            <span className="text-muted-foreground">{cat.path.substring(0, cat.path.lastIndexOf("→") + 1)} </span>
                            <span className={isSelected ? "text-primary font-semibold" : "font-medium"}>{cat.name}</span>
                          </>
                        ) : (
                          <span className={`font-semibold ${isSelected ? "text-primary" : ""}`}>{cat.name}</span>
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Card({ title, badge, children, action }: { title: string; badge?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <motion.div variants={cardAnim} className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground flex-1">{title}</h3>
        {badge && <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{badge}</span>}
        {action}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </motion.div>
  );
}

function Field({ label, hint, children }: { label: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function PriceInput({ value, onChange, prefix = "$" }: { value: string; onChange: (v: string) => void; prefix?: string }) {
  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground text-[14px] pointer-events-none">{prefix}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" className={`${inp} pl-7`} />
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductFormProps {
  mode: "add" | "edit";
  initialData?: Partial<ProductFormData>;
  productName?: string;
  breadcrumbs: { label: string; href?: string }[];
  onSave: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProductForm({
  mode, initialData, productName, breadcrumbs, onSave, onCancel, isSaving,
}: ProductFormProps) {
  const t = useTranslations("store.products");

  // Core
  const [name,        setName]        = useState(initialData?.name        ?? "");
  const [slug,        setSlug]        = useState(initialData?.slug        ?? "");
  const [shortDesc,     setShortDesc]     = useState(initialData?.shortDescription ?? "");
  const [description,   setDescription]   = useState(initialData?.description    ?? "");
  const [specification, setSpecification] = useState(initialData?.specification  ?? "");
  const [descTab,       setDescTab]       = useState<"description" | "specification">("description");
  const [featuredImg, setFeaturedImg] = useState<string | null>(initialData?.featuredImage ?? null);
  const [type,        setType]        = useState<ProductType>(initialData?.type   ?? "simple");
  const [status,      setStatus]      = useState<ProductStatus>(initialData?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(initialData?.publishedAt ?? "");

  // Pricing
  const [price,     setPrice]     = useState(initialData?.price          ?? "");
  const [compareAt, setCompareAt] = useState(initialData?.compareAtPrice ?? "");
  const [costPrice, setCostPrice] = useState(initialData?.costPrice      ?? "");
  const [taxClass,  setTaxClass]  = useState(initialData?.taxClass       ?? "standard");

  // Inventory
  const [sku,            setSku]            = useState(initialData?.sku            ?? "");
  const [stock,          setStock]          = useState(initialData?.stock          ?? "");
  const [stockStatus,    setStockStatus]    = useState<StockStatus>(initialData?.stockStatus    ?? "in_stock");
  const [threshold,      setThreshold]      = useState(initialData?.lowStockThreshold ?? "5");
  const [weight,         setWeight]         = useState(initialData?.weight         ?? "");
  const [trackInventory, setTrackInventory] = useState(initialData?.trackInventory ?? true);
  const [backorder,      setBackorder]      = useState(initialData?.backorderEnabled ?? false);

  // Downloads
  const [downloadFiles,  setDownloadFiles]  = useState<DownloadFile[]>(initialData?.downloadFiles ?? []);
  const [downloadLimit,  setDownloadLimit]  = useState(initialData?.downloadLimit  ?? "");
  const [downloadExpiry, setDownloadExpiry] = useState(initialData?.downloadExpiry ?? "");

  // Selected product attributes (references to global attributes)
  const [attributes, setAttributes] = useState<ProductAttribute[]>(
    (initialData?.attributes ?? []).filter((a) => "attributeId" in a),
  );
  const [variants, setVariants] = useState<ProductVariantRow[]>(initialData?.variants ?? []);

  // Live list of global attributes (fetched from API on mount)
  const [globalAttrs, setGlobalAttrs] = useState<StoreAttribute[]>([]);

  // Subscription
  const [billingPeriod,   setBillingPeriod]   = useState(initialData?.billingPeriod   ?? "month");
  const [billingInterval, setBillingInterval] = useState(initialData?.billingInterval ?? "1");
  const [trialPeriod,     setTrialPeriod]     = useState(initialData?.trialPeriod     ?? "");
  const [signupFee,       setSignupFee]       = useState(initialData?.signupFee       ?? "");

  // Bundle
  const [bundleItems,  setBundleItems]  = useState<BundleItem[]>(initialData?.bundleItems ?? []);
  const [bundleSearch, setBundleSearch] = useState("");

  // Gift Card
  const [giftAmounts,       setGiftAmounts]       = useState<string[]>(initialData?.giftCardAmounts ?? ["25", "50", "100"]);
  const [giftAmountInput,   setGiftAmountInput]   = useState("");
  const [allowCustomAmount, setAllowCustomAmount] = useState(initialData?.allowCustomAmount ?? false);
  const [giftCardExpiry,    setGiftCardExpiry]    = useState(initialData?.giftCardExpiry    ?? "365");

  // Organisation & SEO
  const [allCats,     setAllCats]     = useState<StoreCategory[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>(initialData?.categoryIds ?? []);
  const [tagInput,    setTagInput]    = useState("");
  const [tags,        setTags]        = useState<string[]>(initialData?.tags ?? []);
  const [seoTitle,    setSeoTitle]    = useState(initialData?.seoTitle   ?? "");
  const [seoDesc,     setSeoDesc]     = useState(initialData?.seoDescription ?? "");
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seoKeywords ?? "");

  useEffect(() => {
    storeCategories.list({ take: 500 }).then((res) => {
      setAllCats(res.data.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parentId: c.parentId ?? undefined,
        description: c.description ?? undefined,
        imageUrl: c.imageUrl ?? undefined,
        status: (c.status === "active" ? "active" : "inactive") as "active" | "inactive",
        featured: c.featured ?? false,
        sortOrder: c.sortOrder,
        productCount: 0,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })));
    }).catch(() => {});

    storeAttributes.list().then((res) => {
      setGlobalAttrs(res.data.map((a) => ({
        id:              a.id,
        name:            a.name,
        attributeType:   a.attributeType as StoreAttribute["attributeType"],
        fieldType:       a.fieldType     as StoreAttribute["fieldType"],
        usedInVariation: a.usedInVariation,
        options:         a.values.map((v) => ({
          id:       v.id,
          name:     v.name,
          colorHex: v.colorHex ?? undefined,
          sortOrder: v.sortOrder,
        })),
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })));
    }).catch(() => {});
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleName = (v: string) => {
    setName(v);
    setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const tag = tagInput.trim().replace(/,$/, "");
    if (tag && !tags.includes(tag)) setTags((p) => [...p, tag]);
    setTagInput("");
  };


  // ── Attributes (select from global) ─────────────────────────────────────────

  const isAttrSelected = (attrId: string) => attributes.some((a) => a.attributeId === attrId);

  const toggleAttribute = (globalAttr: StoreAttribute) => {
    if (isAttrSelected(globalAttr.id)) {
      setAttributes((p) => p.filter((a) => a.attributeId !== globalAttr.id));
    } else {
      setAttributes((p) => [
        ...p,
        {
          attributeId:       globalAttr.id,
          name:              globalAttr.name,
          usedInVariation:   globalAttr.usedInVariation,
          selectedOptionIds: globalAttr.options.map((o) => o.id), // all options selected by default
        },
      ]);
    }
  };

  const toggleOption = (attrId: string, optionId: string) => {
    setAttributes((p) =>
      p.map((a) => {
        if (a.attributeId !== attrId) return a;
        const ids = a.selectedOptionIds.includes(optionId)
          ? a.selectedOptionIds.filter((id) => id !== optionId)
          : [...a.selectedOptionIds, optionId];
        return { ...a, selectedOptionIds: ids };
      }),
    );
  };

  const toggleAttrVariation = (attrId: string) => {
    setAttributes((p) => p.map((a) => a.attributeId === attrId ? { ...a, usedInVariation: !a.usedInVariation } : a));
  };

  // ── Variants ──────────────────────────────────────────────────────────────────

  const generateVariants = useCallback(() => {
    const variationSelected = attributes.filter((sa) => sa.usedInVariation && sa.selectedOptionIds.length > 0);
    if (variationSelected.length === 0) { setVariants([]); return; }

    const combos = variationSelected.reduce<Record<string, string>[]>((acc, sa) => {
      const globalAttr = globalAttrs.find((g) => g.id === sa.attributeId);
      if (!globalAttr) return acc;
      const selectedOpts = globalAttr.options.filter((o) => sa.selectedOptionIds.includes(o.id));
      if (acc.length === 0) return selectedOpts.map((o) => ({ [sa.name]: o.name }));
      return acc.flatMap((existing) => selectedOpts.map((o) => ({ ...existing, [sa.name]: o.name })));
    }, []);

    setVariants((prev) =>
      combos.map((attrMap, i) => {
        const key = Object.values(attrMap).join("|");
        const existing = prev.find((v) => Object.values(v.attrs).join("|") === key);
        return existing ?? { id: `var_${i}_${Date.now()}`, attrs: attrMap, price: price || "", sku: "", stock: "", enabled: true };
      }),
    );
  }, [attributes, globalAttrs, price]);

  const updateVariant = (id: string, field: keyof ProductVariantRow, value: string | boolean) =>
    setVariants((p) => p.map((v) => v.id === id ? { ...v, [field]: value } : v));

  // ── Downloads ─────────────────────────────────────────────────────────────────

  const addDownloadFile = () =>
    setDownloadFiles((p) => [...p, { id: Date.now().toString(), name: "", url: "" }]);

  const updateDownloadFile = (id: string, field: "name" | "url", value: string) =>
    setDownloadFiles((p) => p.map((f) => f.id === id ? { ...f, [field]: value } : f));

  const removeDownloadFile = (id: string) =>
    setDownloadFiles((p) => p.filter((f) => f.id !== id));

  // ── Bundle ────────────────────────────────────────────────────────────────────

  const bundleResults = SAMPLE_PRODUCTS.filter(
    (p) => !bundleItems.find((b) => b.productId === p.id) &&
      bundleSearch.trim() &&
      p.name.toLowerCase().includes(bundleSearch.toLowerCase()),
  );

  const addBundleItem = (p: StoreProduct) => {
    setBundleItems((prev) => [...prev, { id: Date.now().toString(), productId: p.id, productName: p.name, price: p.price, quantity: 1 }]);
    setBundleSearch("");
  };

  const removeBundleItem = (id: string) => setBundleItems((p) => p.filter((b) => b.id !== id));

  // ── Gift Card ─────────────────────────────────────────────────────────────────

  const addGiftAmount = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = giftAmountInput.trim();
    if (val && !isNaN(Number(val)) && !giftAmounts.includes(val))
      setGiftAmounts((p) => [...p, val].sort((a, b) => Number(a) - Number(b)));
    setGiftAmountInput("");
  };

  // ── Conditionals ─────────────────────────────────────────────────────────────

  const isSimple       = type === "simple";
  const isVariable     = type === "variable";
  const isDownloadable = type === "digital" || type === "downloadable";
  const isSubscription = type === "subscription";
  const isBundle       = type === "bundle";
  const isGiftCard     = type === "gift_card";
  const showPricing    = !isVariable;
  const showInventory  = isSimple;

  const variationAttrs = attributes.filter((a) => a.usedInVariation && a.selectedOptionIds.length > 0);

  // ── Save ──────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    await onSave({
      name, slug, shortDescription: shortDesc, description, specification, featuredImage: featuredImg,
      type, status, publishedAt,
      price, compareAtPrice: compareAt, costPrice, taxClass,
      sku, stock, stockStatus, lowStockThreshold: threshold, weight, trackInventory, backorderEnabled: backorder,
      downloadFiles, downloadLimit, downloadExpiry,
      attributes, variants,
      billingPeriod, billingInterval, trialPeriod, signupFee,
      bundleItems,
      giftCardAmounts: giftAmounts, allowCustomAmount, giftCardExpiry,
      categoryIds, tags, seoTitle, seoDescription: seoDesc, seoKeywords,
    });
  };

  const currentType  = PRODUCT_TYPES.find((pt) => pt.value === type);
  const bundleTotal  = bundleItems.reduce((s, b) => s + b.price * b.quantity, 0);

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex flex-col gap-4"
    >
      {/* Header */}
      <PageHeader
        title={productName ?? (mode === "add" ? "Add Product" : "Edit Product")}
        description={currentType ? `${currentType.label} — ${currentType.desc}` : ""}
        breadcrumbs={breadcrumbs}
      >
        <Button variant="outline" size="lg" onClick={onCancel}>
          <X size={16} /> {t("cancel")}
        </Button>
        <Button size="lg" onClick={handleSave} disabled={isSaving}>
          <Save size={16} /> {isSaving ? "Saving…" : t("save")}
        </Button>
      </PageHeader>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* 1. Basic Information — FIRST */}
          <Card title="Basic Information">
            <Field label={<>Product Name <span className="text-destructive">*</span></>}>
              <Input value={name} onChange={(e) => handleName(e.target.value)} placeholder="e.g. Premium Wireless Headphones" className={inp} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SKU" hint="Unique product identifier">
                <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU-001" className={inp} />
              </Field>
              <Field label="Slug">
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="premium-wireless-headphones" className={inp} />
              </Field>
            </div>
            <Field label="Short Description">
              <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} rows={2} placeholder="Brief summary shown on listing page…" className={ta} />
            </Field>
          </Card>

          {/* 2. Product Type — SECOND */}
          <Card title="Product Type">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRODUCT_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setType(pt.value)}
                  className={`flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-all cursor-pointer ${
                    type === pt.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <span className={type === pt.value ? "text-primary" : "text-muted-foreground"}>{pt.icon}</span>
                  <span className="text-[12px] font-semibold leading-tight">{pt.label}</span>
                </button>
              ))}
            </div>
            {currentType && (
              <p className="text-xs text-muted-foreground border border-border bg-muted/30 rounded-sm px-3 py-2">
                <span className="font-semibold text-foreground">{currentType.label}:</span> {currentType.desc}
              </p>
            )}
          </Card>

          {/* 3. Type-specific sections — right after Product Type */}

          {/* Downloads — digital / downloadable */}
          {isDownloadable && (
            <Card title="Downloadable Files">
              <div className="space-y-3">
                {downloadFiles.map((f) => (
                  <div key={f.id} className="flex gap-2 items-center">
                    <Input value={f.name} onChange={(e) => updateDownloadFile(f.id, "name", e.target.value)} placeholder="File name (e.g. ebook.pdf)" className={`${inp} flex-1`} />
                    <Input value={f.url} onChange={(e) => updateDownloadFile(f.id, "url", e.target.value)} placeholder="File URL or path" className={`${inp} flex-1`} />
                    <button onClick={() => removeDownloadFile(f.id)} className="p-2 text-muted-foreground hover:text-destructive cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {downloadFiles.length === 0 && <p className="text-xs text-muted-foreground">No files yet. Add downloadable files below.</p>}
              </div>
              <Button variant="outline" size="sm" onClick={addDownloadFile}>
                <Plus size={14} /> Add File
              </Button>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                <Field label="Download Limit" hint="Max downloads per purchase (blank = unlimited)">
                  <Input value={downloadLimit} onChange={(e) => setDownloadLimit(e.target.value)} type="number" min="0" placeholder="Unlimited" className={inp} />
                </Field>
                <Field label="Expiry (days after purchase)" hint="Blank = no expiry">
                  <Input value={downloadExpiry} onChange={(e) => setDownloadExpiry(e.target.value)} type="number" min="0" placeholder="No expiry" className={inp} />
                </Field>
              </div>
            </Card>
          )}

          {/* Subscription */}
          {isSubscription && (
            <Card title="Subscription Settings">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Billing Interval">
                  <Input value={billingInterval} onChange={(e) => setBillingInterval(e.target.value)} type="number" min="1" placeholder="1" className={inp} />
                </Field>
                <Field label="Billing Period">
                  <select value={billingPeriod} onChange={(e) => setBillingPeriod(e.target.value)} className={sel}>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </Field>
                <Field label="Trial Period (days)">
                  <Input value={trialPeriod} onChange={(e) => setTrialPeriod(e.target.value)} type="number" min="0" placeholder="0 (no trial)" className={inp} />
                </Field>
                <Field label="Signup Fee">
                  <PriceInput value={signupFee} onChange={setSignupFee} />
                </Field>
              </div>
              <div className="rounded-sm bg-info/10 border border-info/20 px-3 py-2 text-xs text-info">
                Customers will be charged <strong>${price || "0.00"}</strong> every <strong>{billingInterval} {billingPeriod}{Number(billingInterval) > 1 ? "s" : ""}</strong>
                {trialPeriod ? ` after a ${trialPeriod}-day free trial` : ""}.
              </div>
            </Card>
          )}

          {/* Bundle */}
          {isBundle && (
            <Card title="Bundle Items">
              <Field label="Search and Add Products">
                <div className="relative">
                  <Input value={bundleSearch} onChange={(e) => setBundleSearch(e.target.value)} placeholder="Search products…" className={inp} />
                  {bundleResults.length > 0 && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                      {bundleResults.map((p) => (
                        <button key={p.id} type="button" onClick={() => addBundleItem(p)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors cursor-pointer">
                          {p.featuredImage && <Image src={p.featuredImage} alt="" width={28} height={28} className="h-7 w-7 rounded-sm object-cover" unoptimized />}
                          <div>
                            <p className="text-[13px] font-medium text-foreground">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground">${p.price}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
              {bundleItems.length > 0 ? (
                <>
                  {bundleItems.map((b) => (
                    <div key={b.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{b.productName}</p>
                        <p className="text-[11px] text-muted-foreground">${b.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">Qty</label>
                        <Input
                          value={b.quantity}
                          onChange={(e) => setBundleItems((p) => p.map((bi) => bi.id === b.id ? { ...bi, quantity: Math.max(1, Number(e.target.value)) } : bi))}
                          type="number" min="1"
                          className="w-16 h-8 text-[13px] rounded-sm border-border px-2"
                        />
                      </div>
                      <button onClick={() => removeBundleItem(b.id)} className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                    <span className="text-muted-foreground">Bundle Total (reference)</span>
                    <span className="text-foreground">${bundleTotal.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No products added to bundle yet. Search above.</p>
              )}
            </Card>
          )}

          {/* Gift Card */}
          {isGiftCard && (
            <Card title="Gift Card Settings">
              <Field label="Predefined Amounts" hint="Press Enter to add each amount">
                <Input value={giftAmountInput} onChange={(e) => setGiftAmountInput(e.target.value)} onKeyDown={addGiftAmount} placeholder="e.g. 25 (press Enter)" className={inp} type="number" min="1" />
                {giftAmounts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {giftAmounts.map((amt) => (
                      <span key={amt} className="flex items-center gap-1 bg-primary/10 text-primary text-sm font-bold px-3 py-1 rounded-sm">
                        ${amt}
                        <button onClick={() => setGiftAmounts((p) => p.filter((a) => a !== amt))} className="hover:text-destructive cursor-pointer ml-1">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Allow Custom Amount</p>
                  <p className="text-xs text-muted-foreground">Customers can enter any amount</p>
                </div>
                <Switch checked={allowCustomAmount} onCheckedChange={setAllowCustomAmount} />
              </div>
              <Field label="Expiry (days after purchase)" hint="Blank = never expires">
                <Input value={giftCardExpiry} onChange={(e) => setGiftCardExpiry(e.target.value)} type="number" min="0" placeholder="365" className={inp} />
              </Field>
            </Card>
          )}

          {/* 4. Product Attributes — only for variable products */}
          {isVariable && <Card
            title="Product Attributes"
            badge={attributes.length > 0 ? `${attributes.length} selected` : undefined}
            action={
              <Link
                href="/store/attributes"
                target="_blank"
                className="flex items-center gap-1 text-[12px] text-primary hover:underline"
              >
                <ExternalLink size={11} /> Manage Attributes
              </Link>
            }
          >
            {globalAttrs.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-2">No global attributes defined yet.</p>
                <Link href="/store/attributes/add" className="text-sm text-primary hover:underline font-medium">
                  + Create your first attribute
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[12px] text-muted-foreground">Select attributes that apply to this product. For Variable products, check which to use for variant generation.</p>
                {globalAttrs.map((globalAttr) => {
                  const sel = attributes.find((a) => a.attributeId === globalAttr.id);
                  const isSelected = !!sel;
                  const showOptions = isSelected && globalAttr.options.length > 0 &&
                    globalAttr.fieldType !== "text" && globalAttr.fieldType !== "textarea";

                  return (
                    <div key={globalAttr.id} className={`rounded-lg border transition-all ${isSelected ? "border-primary/40 bg-primary/3" : "border-border bg-background"}`}>
                      {/* Attribute header */}
                      <label className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAttribute(globalAttr)}
                          className="w-4 h-4 accent-primary cursor-pointer shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[14px] font-semibold text-foreground">{globalAttr.name}</span>
                            <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-sm capitalize">
                              {globalAttr.attributeType === "color" ? "Color" : globalAttr.fieldType}
                            </span>
                            {globalAttr.usedInVariation && (
                              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">
                                Variation
                              </span>
                            )}
                          </div>
                          {globalAttr.options.length > 0 && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {globalAttr.options.map((o) => o.name).join(", ")}
                            </p>
                          )}
                        </div>
                        {/* Toggle used-in-variation for this product */}
                        {isSelected && isVariable && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); toggleAttrVariation(globalAttr.id); }}
                            className={`shrink-0 text-[11px] font-semibold px-2 py-1 rounded-sm border transition-all cursor-pointer ${
                              sel!.usedInVariation
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-border hover:border-primary/50"
                            }`}
                          >
                            {sel!.usedInVariation ? "✓ For Variants" : "Use for Variants"}
                          </button>
                        )}
                      </label>

                      {/* Option checkboxes */}
                      {showOptions && (
                        <div className="px-4 pb-3 pt-0 border-t border-border/50">
                          <p className="text-[11px] text-muted-foreground mb-2 mt-2">Select values to use on this product:</p>
                          <div className="flex flex-wrap gap-2">
                            {globalAttr.options.map((opt) => {
                              const isOptSelected = sel!.selectedOptionIds.includes(opt.id);
                              return (
                                <label key={opt.id} className={`flex items-center gap-1.5 cursor-pointer rounded-sm border px-2.5 py-1.5 text-[12px] font-medium transition-all ${
                                  isOptSelected ? "bg-primary/10 border-primary/40 text-primary" : "bg-background border-border text-foreground hover:border-primary/30"
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={isOptSelected}
                                    onChange={() => toggleOption(globalAttr.id, opt.id)}
                                    className="sr-only"
                                  />
                                  {opt.colorHex && (
                                    <span className="inline-block w-3 h-3 rounded-full border border-border/50" style={{ background: opt.colorHex }} />
                                  )}
                                  {opt.name}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>}

          {/* 4. Product Variants — only for variable, right after attributes */}
          {isVariable && (
            <Card
              title="Product Variants"
              badge={variants.length > 0 ? `${variants.length} variants` : undefined}
            >
              {variationAttrs.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-1">No variation attributes selected.</p>
                  <p className="text-xs text-muted-foreground">Select attributes above and enable &ldquo;Use for Variants&rdquo;, then generate variants here.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground font-medium">Variation Attributes:</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {variationAttrs.map((a) => {
                          const globalAttr = globalAttrs.find((g) => g.id === a.attributeId);
                          const opts = globalAttr?.options.filter((o) => a.selectedOptionIds.includes(o.id)) ?? [];
                          return (
                            <span key={a.attributeId} className="text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-sm">
                              {a.name}: {opts.map((o) => o.name).join(", ")}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <Button size="sm" onClick={generateVariants} className="shrink-0 ml-2">
                      <RefreshCw size={13} /> Generate
                    </Button>
                  </div>

                  {variants.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[13px] border-collapse">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground text-left">
                            <th className="py-2 px-2 font-semibold">Variant</th>
                            <th className="py-2 px-2 font-semibold w-28">Price ($)</th>
                            <th className="py-2 px-2 font-semibold w-28">SKU</th>
                            <th className="py-2 px-2 font-semibold w-24">Stock</th>
                            <th className="py-2 px-2 w-16 text-center font-semibold">On</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {variants.map((v) => (
                            <tr key={v.id} className={!v.enabled ? "opacity-40" : ""}>
                              <td className="py-2 px-2 font-medium text-foreground">{Object.values(v.attrs).join(" / ")}</td>
                              <td className="py-2 px-2">
                                <Input value={v.price} onChange={(e) => updateVariant(v.id, "price", e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" className="h-8 text-[13px] rounded-sm border-border px-2" />
                              </td>
                              <td className="py-2 px-2">
                                <Input value={v.sku} onChange={(e) => updateVariant(v.id, "sku", e.target.value)} placeholder="SKU" className="h-8 text-[13px] rounded-sm border-border px-2" />
                              </td>
                              <td className="py-2 px-2">
                                <Input value={v.stock} onChange={(e) => updateVariant(v.id, "stock", e.target.value)} type="number" min="0" placeholder="0" className="h-8 text-[13px] rounded-sm border-border px-2" />
                              </td>
                              <td className="py-2 px-2 text-center">
                                <Switch checked={v.enabled} onCheckedChange={(val) => updateVariant(v.id, "enabled", val)} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </Card>
          )}

          {isVariable && (
            <div className="rounded-sm border border-warning/30 bg-warning/5 px-4 py-3 text-[13px] text-warning-foreground flex items-start gap-2">
              <span className="shrink-0 mt-0.5">ℹ️</span>
              <span>Variable products use <strong>per-variant pricing</strong>. Set the price for each variant in the table above.</span>
            </div>
          )}

          {/* 5. Description & Specification */}
          <motion.div variants={cardAnim} className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Tab header */}
            <div className="flex border-b border-border bg-muted/30">
              {(["description", "specification"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setDescTab(tab)}
                  className={`px-5 py-3 text-sm font-semibold capitalize transition-colors cursor-pointer border-b-2 -mb-px ${
                    descTab === tab
                      ? "border-primary text-primary bg-card"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "description" ? "Description" : "Specification"}
                </button>
              ))}
            </div>
            <div className="p-5">
              <div className={descTab === "description" ? "block" : "hidden"}>
                <ProductDescriptionEditor value={description} onChange={setDescription} />
              </div>
              <div className={descTab === "specification" ? "block" : "hidden"}>
                <ProductDescriptionEditor value={specification} onChange={setSpecification} />
              </div>
            </div>
          </motion.div>

          {/* 5. Media */}
          <Card title="Media">
            <label className={lbl}>Featured Image</label>
            <StoreImagePicker
              value={featuredImg}
              onChange={setFeaturedImg}
              subtype="products"
              hint="PNG, JPG, WebP · Stored via configured provider"
            />
          </Card>

          {/* 6. Pricing — after attributes, hidden for variable */}
          {showPricing && (
            <Card title="Pricing" badge={isSubscription ? "Per billing period" : undefined}>
              <div className="grid grid-cols-2 gap-4">
                <Field label={<>Regular Price <span className="text-destructive">*</span></>}>
                  <PriceInput value={price} onChange={setPrice} />
                </Field>
                {!isGiftCard && (
                  <Field label="Compare at Price" hint="Shows as crossed-out original price">
                    <PriceInput value={compareAt} onChange={setCompareAt} />
                  </Field>
                )}
                <Field label="Cost Price" hint="For profit margin calculations">
                  <PriceInput value={costPrice} onChange={setCostPrice} />
                </Field>
                <Field label="Tax Class">
                  <select value={taxClass} onChange={(e) => setTaxClass(e.target.value)} className={sel}>
                    <option value="standard">Standard Rate</option>
                    <option value="reduced">Reduced Rate</option>
                    <option value="zero">Zero Rate</option>
                    <option value="exempt">Tax Exempt</option>
                  </select>
                </Field>
              </div>
            </Card>
          )}

          {/* 7. Inventory — simple only */}
          {showInventory && (
            <Card title="Inventory">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Weight (kg)">
                  <Input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" className={inp} />
                </Field>
                <Field label="Stock Status">
                  <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value as StockStatus)} className={sel}>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="backorder">On Backorder</option>
                  </select>
                </Field>
                <Field label="Stock Quantity">
                  <Input
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    type="number" min="0" placeholder="0"
                    disabled={!trackInventory}
                    className={`${inp} disabled:opacity-50`}
                  />
                </Field>
                <Field label="Low Stock Threshold">
                  <Input value={threshold} onChange={(e) => setThreshold(e.target.value)} type="number" min="0" placeholder="5" className={inp} />
                </Field>
              </div>
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Track Inventory</p>
                    <p className="text-xs text-muted-foreground">Manage stock quantity</p>
                  </div>
                  <Switch checked={trackInventory} onCheckedChange={setTrackInventory} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Allow Backorders</p>
                    <p className="text-xs text-muted-foreground">Sell when out of stock</p>
                  </div>
                  <Switch checked={backorder} onCheckedChange={setBackorder} />
                </div>
              </div>
            </Card>
          )}

        </div>

        {/* ── RIGHT SIDEBAR ────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Publish */}
          <Card title="Publish">
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} className={sel}>
                <option value="draft">Draft</option>
                <option value="active">Active (Published)</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            {status === "scheduled" && (
              <Field label="Publish Date & Time">
                <Input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={inp} />
              </Field>
            )}
          </Card>

          {/* Categories & Tags */}
          <Card title="Categories & Tags">
            <div>
              <label className={lbl}>Product Categories</label>
              <CategoryDropdown selectedIds={categoryIds} onChange={setCategoryIds} allCats={allCats} />
            </div>
            <div>
              <label className={lbl}>Tags</label>
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Type and press Enter…" className={inp} />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-sm">
                      {tag}
                      <button onClick={() => setTags((p) => p.filter((t) => t !== tag))} className="hover:text-destructive cursor-pointer">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* SEO */}
          <Card title="SEO">
            <Field label="SEO Title" hint={`${seoTitle.length}/60`}>
              <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Product SEO title…" className={inp} maxLength={60} />
            </Field>
            <Field label="Meta Description" hint={`${seoDesc.length}/160`}>
              <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={3} placeholder="Brief description for search engines…" className={ta} maxLength={160} />
            </Field>
            <Field label="Meta Keywords" hint="Comma-separated. Used by some search engines.">
              <textarea
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                rows={2}
                placeholder="e.g. shoes, running shoes, sports footwear"
                className={ta}
              />
            </Field>
            {(seoTitle || name) && (
              <div className="rounded-sm border border-border bg-muted/20 p-3 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Preview</p>
                <p className="text-[13px] text-blue-500 font-medium truncate">{seoTitle || name}</p>
                <p className="text-[11px] text-green-600 dark:text-green-400 truncate">yourstore.com › products › {slug || "product-slug"}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{seoDesc || shortDesc || "No description."}</p>
              </div>
            )}
          </Card>
        </div>
      </motion.div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-background/80 backdrop-blur-md border-t border-border/60 flex items-center justify-between gap-4 z-10">
        <p className="text-xs text-muted-foreground hidden sm:block">Unsaved changes will be lost if you navigate away.</p>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" onClick={onCancel}>{t("cancel")}</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save size={14} /> {isSaving ? "Saving…" : t("save")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
