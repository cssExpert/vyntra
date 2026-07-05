"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Save, X, Search, Check } from "lucide-react";
import { RadioChips } from "@/components/common/RadioChips";
import {
  storeCustomerGroups,
  storeCategories,
  cmsPages,
  type ApiCustomerGroup,
  type ApiCustomerGroupRestrictions,
  type CustomerGroupRestrictionMode,
  type ApiGroupProductSummary,
} from "@/lib/api";

const inp = "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15";

const STARTER_PAYMENT_METHODS = ["card", "paypal", "cod", "bank_transfer"];
const STARTER_SHIPPING_METHODS = ["standard", "express", "pickup"];
const STARTER_ONLINE_GATEWAYS = ["stripe", "paypal", "razorpay"];

const TABS = ["categories", "products", "pages", "payment", "shipping", "gateways", "purchasing"] as const;
type TabKey = (typeof TABS)[number];
type ProductChip = Omit<ApiGroupProductSummary, "price">;

function ModeSelector({
  value,
  onChange,
  t,
}: {
  value: CustomerGroupRestrictionMode;
  onChange: (v: CustomerGroupRestrictionMode) => void;
  t: any;
}) {
  return (
    <RadioChips
      value={value}
      onChange={onChange}
      options={[
        { value: "all", label: t("modeAll", { defaultValue: "Everyone" }) },
        { value: "only_selected", label: t("modeOnlySelected", { defaultValue: "Only Selected" }) },
        { value: "except_selected", label: t("modeExceptSelected", { defaultValue: "Everyone Except Selected" }) },
      ]}
    />
  );
}

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
                isSelected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
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

interface RestrictionsViewProps {
  groupId: string;
}

export function RestrictionsView({ groupId }: RestrictionsViewProps) {
  const router = useRouter();
  const t = useTranslations("store.customerGroups.restrictions");

  const [group, setGroup] = useState<ApiCustomerGroup | null>(null);
  const [restrictions, setRestrictions] = useState<ApiCustomerGroupRestrictions | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [pages, setPages] = useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("categories");
  const [savingTab, setSavingTab] = useState<TabKey | null>(null);

  const [productSubTab, setProductSubTab] = useState<"manual" | "pattern">("manual");
  const [productSearch, setProductSearch] = useState("");
  const [productSearchResults, setProductSearchResults] = useState<ApiGroupProductSummary[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductChip[]>([]);
  const [patternInput, setPatternInput] = useState("");
  const [patternPreview, setPatternPreview] = useState<{ count: number; matches: ApiGroupProductSummary[] } | null>(null);
  const [patternError, setPatternError] = useState<string | null>(null);

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
      setCategories(catRes.data.map((c) => ({ id: c.id, name: c.name })));
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
    const handle = setTimeout(() => {
      storeCustomerGroups.restrictions.searchProducts(productSearch).then(setProductSearchResults).catch(() => {});
    }, 250);
    return () => clearTimeout(handle);
  }, [productSearch]);

  if (isLoading || !restrictions || !group) {
    return (
      <div className="space-y-4">
        <div className="h-9 w-64 rounded-sm bg-muted animate-pulse" />
        <div className="h-96 w-full rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  const update = <K extends keyof ApiCustomerGroupRestrictions>(key: K, value: ApiCustomerGroupRestrictions[K]) => {
    setRestrictions((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

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

  const toggleProduct = (product: ProductChip) => {
    setSelectedProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      const next = exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
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

  const toggleCategory = (id: string) => {
    const next = restrictions.categoryIds.includes(id)
      ? restrictions.categoryIds.filter((c) => c !== id)
      : [...restrictions.categoryIds, id];
    update("categoryIds", next);
  };

  const togglePage = (id: string) => {
    const next = restrictions.pageIds.includes(id)
      ? restrictions.pageIds.filter((p) => p !== id)
      : [...restrictions.pageIds, id];
    update("pageIds", next);
  };

  const summaryItems: { key: TabKey; label: string; mode: CustomerGroupRestrictionMode | null }[] = [
    { key: "categories", label: t("categories", { defaultValue: "Categories" }), mode: restrictions.categoriesMode },
    { key: "products", label: t("products", { defaultValue: "Products" }), mode: restrictions.productsMode },
    { key: "pages", label: t("pages", { defaultValue: "Pages" }), mode: restrictions.pagesMode },
    { key: "payment", label: t("payment", { defaultValue: "Payment" }), mode: restrictions.paymentMethodsMode },
    { key: "shipping", label: t("shipping", { defaultValue: "Shipping" }), mode: restrictions.shippingMethodsMode },
    { key: "gateways", label: t("gateways", { defaultValue: "Online Gateways" }), mode: restrictions.onlineGatewaysMode },
    { key: "purchasing", label: t("purchasing", { defaultValue: "Purchasing" }), mode: null },
  ];

  const MODE_BADGE: Record<CustomerGroupRestrictionMode, string> = {
    all: "text-muted-foreground",
    only_selected: "text-primary",
    except_selected: "text-amber-600 dark:text-amber-400",
  };
  const MODE_LABEL: Record<CustomerGroupRestrictionMode, string> = {
    all: t("modeAll", { defaultValue: "Everyone" }),
    only_selected: t("modeOnlySelected", { defaultValue: "Only Selected" }),
    except_selected: t("modeExceptSelected", { defaultValue: "Except Selected" }),
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="flex flex-col gap-4">
      <PageHeader
        title={t("title", { defaultValue: `Manage Restrictions — ${group.name}`, name: group.name })}
        description={t("description", { defaultValue: "Control product, category, page, and payment visibility for customers in this group." })}
        breadcrumbs={[
          { label: "Store", href: "/store" },
          { label: "Customer Groups", href: "/store/customer-groups" },
          { label: group.name, href: `/store/customer-groups/${groupId}/edit` },
          { label: "Restrictions" },
        ]}
      >
        <Button variant="outline" size="lg" onClick={() => router.push("/store/customer-groups")}>
          <X size={16} /> {t("done", { defaultValue: "Done" })}
        </Button>
      </PageHeader>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {summaryItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`glass-card p-2.5 text-left transition-all cursor-pointer ${activeTab === item.key ? "ring-2 ring-primary" : ""}`}
          >
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
            <p className={`text-[12px] font-semibold ${item.mode ? MODE_BADGE[item.mode] : "text-muted-foreground"}`}>
              {item.mode ? MODE_LABEL[item.mode] : "—"}
            </p>
          </button>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
        <TabsList className="flex-wrap h-auto">
          {summaryItems.map((item) => (
            <TabsTrigger key={item.key} value={item.key}>{item.label}</TabsTrigger>
          ))}
        </TabsList>

        {/* Categories */}
        <TabsContent value="categories">
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <ModeSelector value={restrictions.categoriesMode} onChange={(v) => update("categoriesMode", v)} t={t} />
            {restrictions.categoriesMode !== "all" && (
              <>
                {categories.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t("categoriesCount", { defaultValue: `${categories.length} categories — scroll for more`, count: categories.length })}
                  </p>
                )}
                <div className="max-h-72 overflow-y-auto border border-border rounded-md divide-y divide-border">
                {categories.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">{t("noCategories", { defaultValue: "No categories found." })}</p>
                ) : categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/40">
                    <Checkbox checked={restrictions.categoryIds.includes(cat.id)} onCheckedChange={() => toggleCategory(cat.id)} />
                    <span className="text-[13px] text-foreground">{cat.name}</span>
                  </label>
                ))}
                </div>
              </>
            )}
            <div className="flex justify-end">
              <Button
                onClick={() => saveTab("categories", { categoriesMode: restrictions.categoriesMode, categoryIds: restrictions.categoryIds })}
                disabled={savingTab === "categories"}
              >
                <Save size={14} /> {savingTab === "categories" ? t("saving", { defaultValue: "Saving…" }) : t("save", { defaultValue: "Save" })}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Products */}
        <TabsContent value="products">
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <ModeSelector value={restrictions.productsMode} onChange={(v) => update("productsMode", v)} t={t} />

            <div className="flex gap-2 border-b border-border">
              {(["manual", "pattern"] as const).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setProductSubTab(sub)}
                  className={`px-3 py-2 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                    productSubTab === sub ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sub === "manual" ? t("manual", { defaultValue: "Manual" }) : t("pattern", { defaultValue: "Pattern" })}
                </button>
              ))}
            </div>

            {restrictions.productsMode !== "all" && productSubTab === "manual" && (
              <div className="space-y-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder={t("searchProducts", { defaultValue: "Search products by name or SKU…" })} className="pl-9" />
                </div>
                {productSearchResults.length > 0 && (
                  <div className="border border-border rounded-md divide-y divide-border max-h-48 overflow-y-auto">
                    {productSearchResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => toggleProduct(p)}
                        className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-muted/40 cursor-pointer"
                      >
                        <span className="text-[13px] text-foreground">{p.name} <span className="text-muted-foreground text-[11px]">({p.sku})</span></span>
                        {selectedProducts.some((sp) => sp.id === p.id) && <Check size={14} className="text-primary" />}
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
              </div>
            )}

            {productSubTab === "pattern" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">{t("patternLabel", { defaultValue: "Regex pattern (matched against product name and SKU)" })}</label>
                <div className="flex gap-2">
                  <Input value={patternInput} onChange={(e) => setPatternInput(e.target.value)} placeholder="^SUB-" className={`${inp} flex-1`} />
                  <Button variant="outline" onClick={testPattern} disabled={!patternInput.trim()}>{t("testPattern", { defaultValue: "Test Pattern" })}</Button>
                </div>
                {patternError && <p className="text-[12px] text-destructive">{patternError}</p>}
                {patternPreview && (
                  <div className="text-[13px] text-muted-foreground">
                    {t("matchCount", { defaultValue: `${patternPreview.count} product(s) match`, count: patternPreview.count })}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {patternPreview.matches.map((p) => (
                        <span key={p.id} className="text-[12px] bg-muted px-2.5 py-1 rounded-full text-foreground">{p.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => saveTab("products", {
                  productsMode: restrictions.productsMode,
                  productIds: restrictions.productIds,
                  productPattern: patternInput || undefined,
                })}
                disabled={savingTab === "products"}
              >
                <Save size={14} /> {savingTab === "products" ? t("saving", { defaultValue: "Saving…" }) : t("save", { defaultValue: "Save" })}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Pages */}
        <TabsContent value="pages">
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <ModeSelector value={restrictions.pagesMode} onChange={(v) => update("pagesMode", v)} t={t} />
            {restrictions.pagesMode !== "all" && (
              <>
                {pages.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t("pagesCount", { defaultValue: `${pages.length} pages — scroll for more`, count: pages.length })}
                  </p>
                )}
                <div className="max-h-72 overflow-y-auto border border-border rounded-md divide-y divide-border">
                  {pages.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">{t("noPages", { defaultValue: "No pages found." })}</p>
                  ) : pages.map((page) => (
                    <label key={page.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/40">
                      <Checkbox checked={restrictions.pageIds.includes(page.id)} onCheckedChange={() => togglePage(page.id)} />
                      <span className="text-[13px] text-foreground">{page.title}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
            <div className="flex justify-end">
              <Button
                onClick={() => saveTab("pages", { pagesMode: restrictions.pagesMode, pageIds: restrictions.pageIds })}
                disabled={savingTab === "pages"}
              >
                <Save size={14} /> {savingTab === "pages" ? t("saving", { defaultValue: "Saving…" }) : t("save", { defaultValue: "Save" })}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Payment */}
        <TabsContent value="payment">
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <ModeSelector value={restrictions.paymentMethodsMode} onChange={(v) => update("paymentMethodsMode", v)} t={t} />
            {restrictions.paymentMethodsMode !== "all" && (
              <SlugMultiSelect
                starter={STARTER_PAYMENT_METHODS}
                selected={restrictions.paymentMethodSlugs}
                onToggle={(slug) => update("paymentMethodSlugs", restrictions.paymentMethodSlugs.includes(slug) ? restrictions.paymentMethodSlugs.filter((s) => s !== slug) : [...restrictions.paymentMethodSlugs, slug])}
                onAddCustom={(slug) => update("paymentMethodSlugs", [...new Set([...restrictions.paymentMethodSlugs, slug])])}
              />
            )}
            <div className="flex justify-end">
              <Button
                onClick={() => saveTab("payment", { paymentMethodsMode: restrictions.paymentMethodsMode, paymentMethodSlugs: restrictions.paymentMethodSlugs })}
                disabled={savingTab === "payment"}
              >
                <Save size={14} /> {savingTab === "payment" ? t("saving", { defaultValue: "Saving…" }) : t("save", { defaultValue: "Save" })}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Shipping */}
        <TabsContent value="shipping">
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <ModeSelector value={restrictions.shippingMethodsMode} onChange={(v) => update("shippingMethodsMode", v)} t={t} />
            {restrictions.shippingMethodsMode !== "all" && (
              <SlugMultiSelect
                starter={STARTER_SHIPPING_METHODS}
                selected={restrictions.shippingMethodSlugs}
                onToggle={(slug) => update("shippingMethodSlugs", restrictions.shippingMethodSlugs.includes(slug) ? restrictions.shippingMethodSlugs.filter((s) => s !== slug) : [...restrictions.shippingMethodSlugs, slug])}
                onAddCustom={(slug) => update("shippingMethodSlugs", [...new Set([...restrictions.shippingMethodSlugs, slug])])}
              />
            )}
            <div className="flex justify-end">
              <Button
                onClick={() => saveTab("shipping", { shippingMethodsMode: restrictions.shippingMethodsMode, shippingMethodSlugs: restrictions.shippingMethodSlugs })}
                disabled={savingTab === "shipping"}
              >
                <Save size={14} /> {savingTab === "shipping" ? t("saving", { defaultValue: "Saving…" }) : t("save", { defaultValue: "Save" })}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Online Gateways */}
        <TabsContent value="gateways">
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <ModeSelector value={restrictions.onlineGatewaysMode} onChange={(v) => update("onlineGatewaysMode", v)} t={t} />
            {restrictions.onlineGatewaysMode !== "all" && (
              <SlugMultiSelect
                starter={STARTER_ONLINE_GATEWAYS}
                selected={restrictions.onlineGatewaySlugs}
                onToggle={(slug) => update("onlineGatewaySlugs", restrictions.onlineGatewaySlugs.includes(slug) ? restrictions.onlineGatewaySlugs.filter((s) => s !== slug) : [...restrictions.onlineGatewaySlugs, slug])}
                onAddCustom={(slug) => update("onlineGatewaySlugs", [...new Set([...restrictions.onlineGatewaySlugs, slug])])}
              />
            )}
            <div className="flex justify-end">
              <Button
                onClick={() => saveTab("gateways", { onlineGatewaysMode: restrictions.onlineGatewaysMode, onlineGatewaySlugs: restrictions.onlineGatewaySlugs })}
                disabled={savingTab === "gateways"}
              >
                <Save size={14} /> {savingTab === "gateways" ? t("saving", { defaultValue: "Saving…" }) : t("save", { defaultValue: "Save" })}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Purchasing (read-only — edited on the main group form) */}
        <TabsContent value="purchasing">
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <p className="text-[13px] text-muted-foreground">
              {t("purchasingHint", { defaultValue: "These toggles live on the group's main form." })}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-md border border-border p-3">
                <p className="text-[11px] text-muted-foreground">{t("requiresApproval", { defaultValue: "Requires Approval" })}</p>
                <p className="text-[14px] font-semibold text-foreground">{group.requiresApproval ? t("yes", { defaultValue: "Yes" }) : t("no", { defaultValue: "No" })}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-[11px] text-muted-foreground">{t("minOrderValue", { defaultValue: "Min Order Value" })}</p>
                <p className="text-[14px] font-semibold text-foreground">{group.minOrderValue ?? "—"}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-[11px] text-muted-foreground">{t("maxOrderValue", { defaultValue: "Max Order Value" })}</p>
                <p className="text-[14px] font-semibold text-foreground">{group.maxOrderValue ?? "—"}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push(`/store/customer-groups/${groupId}/edit`)}>{t("editOnMainForm", { defaultValue: "Edit on Group Form" })}</Button>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
