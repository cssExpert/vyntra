"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { Switch } from "@/components/ui/switch";
import { ImageUploadWithStorage } from "@/components/common/ImageUploadWithStorage";
import { useAuth } from "@/providers/AuthProvider";
import { Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ProductType, ProductStatus, StockStatus } from "../store.types";
import { ProductDescriptionEditor } from "./components/ProductDescriptionEditor";

const inp =
  "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15";
const sel =
  "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15 cursor-pointer";
const ta =
  "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none";
const lbl = "block text-sm font-medium text-foreground mb-1.5";

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: "simple", label: "Simple Product" },
  { value: "variable", label: "Variable Product" },
  { value: "digital", label: "Digital Download" },
  { value: "downloadable", label: "Downloadable" },
  { value: "service", label: "Service" },
  { value: "subscription", label: "Subscription" },
  { value: "bundle", label: "Bundle" },
  { value: "gift_card", label: "Gift Card" },
];

const CATS = [
  { id: "c1", name: "Electronics" },
  { id: "c2", name: "Clothing" },
  { id: "c3", name: "Books" },
  { id: "c4", name: "Home & Garden" },
  { id: "c5", name: "Sports" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: "easeOut" } },
};

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={item}
      className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
    >
      <div className="px-5 py-3.5 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </motion.div>
  );
}

function F({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      {children}
    </div>
  );
}

export function AddProductView() {
  const isLoaded = usePageLoad(700);
  const { user } = useAuth();
  const uploadCompanyId = user?.organizationId || "superadmin";
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [compareAt, setCompareAt] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [taxClass, setTaxClass] = useState("standard");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatus>("in_stock");
  const [threshold, setThreshold] = useState("5");
  const [weight, setWeight] = useState("");
  const [trackInventory, setTrackInventory] = useState(true);
  const [backorder, setBackorder] = useState(false);
  const [type, setType] = useState<ProductType>("simple");
  const [status, setStatus] = useState<ProductStatus>("draft");
  const [publishedAt, setPublishedAt] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [brand, setBrand] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");

  const handleName = (v: string) => {
    setName(v);
    setSlug(
      v
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    );
  };

  const toggleCat = (id: string) =>
    setCategoryIds((p) =>
      p.includes(id) ? p.filter((c) => c !== id) : [...p, id],
    );

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const t = tagInput.trim().replace(/,$/, "");
    if (t && !tags.includes(t)) setTags((p) => [...p, t]);
    setTagInput("");
  };

  const priceInput = (val: string, set: (v: string) => void) => (
    <div className="relative">
      <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground text-[14px] pointer-events-none">
        $
      </span>
      <input
        value={val}
        onChange={(e) => set(e.target.value)}
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        className={`${inp} pl-7`}
      />
    </div>
  );

  if (!isLoaded) {
    return (
      <motion.div
        key="sk"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="space-y-4"
      >
        <div className="h-9 w-64 rounded-sm bg-muted animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {[140, 120, 220, 160, 180].map((h, i) => (
              <div
                key={i}
                style={{ height: h }}
                className="w-full rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
          <div className="space-y-4">
            {[130, 90, 200, 160].map((h, i) => (
              <div
                key={i}
                style={{ height: h }}
                className="w-full rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key="content"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex flex-col gap-4"
      >
        <PageHeader
          title="Add Product"
          description="Create a new product listing"
          breadcrumbs={[
            { label: "Store", href: "/store" },
            { label: "Products", href: "/store/products" },
            { label: "Add Product" },
          ]}
        >
          <button
            onClick={() => router.push("/store/products")}
            className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button className="flex items-center gap-2 rounded-sm border border-border bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer">
            <Save size={14} />
            Save Draft
          </button>
          <button className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all cursor-pointer">
            <Send size={14} />
            Publish
          </button>
        </PageHeader>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start"
        >
          <div className="lg:col-span-2 space-y-5">
            <Card title="Basic Information">
              <F
                label={
                  <>
                    Product Name <span className="text-destructive">*</span>
                  </>
                }
              >
                <input
                  value={name}
                  onChange={(e) => handleName(e.target.value)}
                  placeholder="e.g. Premium Wireless Headphones"
                  className={inp}
                />
              </F>
              <F label="Slug">
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="premium-wireless-headphones"
                  className={inp}
                />
              </F>
              <F label="Short Description">
                <textarea
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  rows={2}
                  placeholder="Brief summary shown on listing page…"
                  className={ta}
                />
              </F>
            </Card>

            <Card title="Description">
              <ProductDescriptionEditor
                value={description}
                onChange={setDescription}
              />
            </Card>

            <Card title="Media">
              <label className={lbl}>Featured Image</label>
              <ImageUploadWithStorage
                value={featuredImage}
                onChange={setFeaturedImage}
                companyId={uploadCompanyId}
                module="store"
                accept="image/png,image/jpeg,image/webp"
                maxSizeMB={5}
                previewShape="wide"
                hint="PNG, JPG, WebP up to 5 MB"
              />
            </Card>

            <Card title="Pricing">
              <div className="grid grid-cols-2 gap-4">
                <F
                  label={
                    <>
                      Regular Price <span className="text-destructive">*</span>
                    </>
                  }
                >
                  {priceInput(price, setPrice)}
                </F>
                <F label="Compare at Price">
                  {priceInput(compareAt, setCompareAt)}
                </F>
                <F label="Cost Price">{priceInput(costPrice, setCostPrice)}</F>
                <F label="Tax Class">
                  <select
                    value={taxClass}
                    onChange={(e) => setTaxClass(e.target.value)}
                    className={sel}
                  >
                    <option value="standard">Standard Rate</option>
                    <option value="reduced">Reduced Rate</option>
                    <option value="zero">Zero Rate</option>
                    <option value="exempt">Tax Exempt</option>
                  </select>
                </F>
              </div>
            </Card>

            <Card title="Inventory">
              <div className="grid grid-cols-2 gap-4">
                <F label="SKU">
                  <input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SKU-001"
                    className={inp}
                  />
                </F>
                <F label="Weight (kg)">
                  <input
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={inp}
                  />
                </F>
                <F label="Stock Status">
                  <select
                    value={stockStatus}
                    onChange={(e) =>
                      setStockStatus(e.target.value as StockStatus)
                    }
                    className={sel}
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="backorder">On Backorder</option>
                  </select>
                </F>
                <F label="Stock Quantity">
                  <input
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    type="number"
                    min="0"
                    placeholder="0"
                    disabled={!trackInventory}
                    className={`${inp} disabled:opacity-50`}
                  />
                </F>
                <F label="Low Stock Threshold">
                  <input
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    type="number"
                    min="0"
                    placeholder="5"
                    className={inp}
                  />
                </F>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Track Inventory
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enable stock quantity management
                  </p>
                </div>
                <Switch
                  checked={trackInventory}
                  onCheckedChange={setTrackInventory}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Allow Backorders
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sell when out of stock
                  </p>
                </div>
                <Switch checked={backorder} onCheckedChange={setBackorder} />
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card title="Publish">
              <F label="Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProductStatus)}
                  className={sel}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </F>
              {status === "scheduled" && (
                <F label="Publish Date">
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className={inp}
                  />
                </F>
              )}
              <div className="flex gap-2 pt-1">
                <button className="flex-1 flex items-center justify-center gap-1.5 rounded-sm border border-border bg-transparent py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer">
                  <Save size={13} />
                  Draft
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 rounded-sm bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all cursor-pointer">
                  <Send size={13} />
                  Publish
                </button>
              </div>
            </Card>

            <Card title="Product Type">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProductType)}
                className={sel}
              >
                {PRODUCT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Card>

            <Card title="Organization">
              <F label="Brand">
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple, Nike…"
                  className={inp}
                />
              </F>
              <div>
                <label className={lbl}>Categories</label>
                <div className="space-y-2">
                  {CATS.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={categoryIds.includes(cat.id)}
                        onChange={() => toggleCat(cat.id)}
                        className="w-4 h-4 rounded-sm accent-primary cursor-pointer"
                      />
                      <span className="text-[14px] text-foreground group-hover:text-primary transition-colors">
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={lbl}>Tags</label>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Type and press Enter…"
                  className={inp}
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-sm"
                      >
                        {tag}
                        <button
                          onClick={() =>
                            setTags((p) => p.filter((t) => t !== tag))
                          }
                          className="ml-0.5 hover:text-destructive transition-colors cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card title="SEO">
              <F label="SEO Title">
                <input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Product SEO title…"
                  className={inp}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {seoTitle.length}/60
                </p>
              </F>
              <F label="Meta Description">
                <textarea
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  rows={3}
                  placeholder="Brief description for search engines…"
                  className={ta}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {seoDesc.length}/160
                </p>
              </F>
              {(seoTitle || name) && (
                <div className="rounded-sm border border-border bg-muted/20 p-3 space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Preview
                  </p>
                  <p className="text-[13px] text-blue-500 font-medium truncate">
                    {seoTitle || name}
                  </p>
                  <p className="text-[11px] text-green-600 dark:text-green-400 truncate">
                    yourstore.com › products › {slug || "product-slug"}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {seoDesc || shortDesc || "No description provided."}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </motion.div>

        <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-background/80 backdrop-blur-md border-t border-border/60 flex items-center justify-between gap-4 z-10">
          <p className="text-xs text-muted-foreground hidden sm:block">
            Unsaved changes will be lost if you navigate away.
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => router.push("/store/products")}
              className="rounded-sm border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button className="flex items-center gap-2 rounded-sm border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer">
              <Save size={14} />
              Save Draft
            </button>
            <button className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all cursor-pointer shadow-sm shadow-primary/20">
              <Send size={14} />
              Publish
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
