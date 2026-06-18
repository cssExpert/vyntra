"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Pencil, Share2, Loader2, Tag, Package, Star, TrendingUp,
  ShoppingCart, DollarSign, Calendar, Clock, Hash,
  AlertTriangle, CheckCircle2, Box, ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { StoreProduct } from "../store.types";
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES } from "../store.data";
import {
  PRODUCT_STATUS_BADGES,
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPE_COLORS,
  STOCK_STATUS_BADGES,
} from "../store.constants";
import { formatStorePrice } from "../store.utils";

interface ProductDetailsViewProps {
  productId: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.25 } }),
};

function Section({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-3.5 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function DataRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-[12px] text-muted-foreground shrink-0 min-w-[110px]">{label}</span>
      <span className={`text-[13px] text-foreground text-right ${mono ? "font-mono" : "font-medium"}`}>{value}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = "text-primary" }: {
  icon: React.ElementType; label: string; value: React.ReactNode; sub?: string; color?: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
      <div className={`mt-0.5 p-2 rounded-lg bg-muted/60 ${color}`}>
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <p className="text-[18px] font-bold text-foreground leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function ProductDetailsView({ productId }: ProductDetailsViewProps) {
  const t = useTranslations("store.products");
  const router = useRouter();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedEdits = JSON.parse(typeof window !== "undefined" ? localStorage.getItem("store_products_edited") || "{}" : "{}");
    const found = SAMPLE_PRODUCTS.find((p) => p.id === productId);
    setProduct(found ? { ...found, ...savedEdits[productId] } : null);
    setIsLoading(false);
  }, [productId]);

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </motion.div>
    );
  }

  if (!product) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 min-h-96">
        <p className="text-muted-foreground">{t("noProducts")}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </motion.div>
    );
  }

  const statusBadge  = PRODUCT_STATUS_BADGES[product.status];
  const stockBadge   = STOCK_STATUS_BADGES[product.stockStatus];
  const typeColor    = PRODUCT_TYPE_COLORS[product.type];
  const typeLabel    = PRODUCT_TYPE_LABELS[product.type];
  const margin       = product.costPrice && product.price
    ? (((product.price - product.costPrice) / product.price) * 100).toFixed(1)
    : null;
  const discount     = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  const categoryNames = SAMPLE_CATEGORIES
    .filter((c) => product.categoryIds?.includes(c.id))
    .map((c) => c.name);

  const statusColors: Record<string, string> = {
    success:     "bg-emerald-500/10 text-emerald-600",
    muted:       "bg-muted text-muted-foreground",
    warning:     "bg-amber-500/10 text-amber-600",
    destructive: "bg-red-500/10 text-red-600",
    info:        "bg-blue-500/10 text-blue-600",
    secondary:   "bg-secondary text-secondary-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title={product.name}
        description={product.shortDescription}
        breadcrumbs={[
          { label: t("store"), href: "/store" },
          { label: t("title"), href: "/store/products" },
          { label: product.name },
        ]}
      >
        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={() => router.push(`/store/products/${productId}/edit`)}>
            <Pencil size={16} /> {t("edit")}
          </Button>
          <Button variant="outline" size="lg">
            <Share2 size={16} /> {t("share")}
          </Button>
        </div>
      </PageHeader>

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Price" value={formatStorePrice(product.price)} sub={discount ? `${discount}% off ${formatStorePrice(product.compareAtPrice!)}` : undefined} color="text-emerald-600" />
        <StatCard icon={TrendingUp}  label="Total Sales"  value={product.totalSales?.toLocaleString() ?? "—"} sub="units sold" color="text-blue-600" />
        <StatCard icon={Star}        label="Rating"       value={product.rating ? `${product.rating} / 5` : "—"} sub={product.reviewCount ? `${product.reviewCount} reviews` : undefined} color="text-amber-500" />
        <StatCard icon={Box}         label="Stock"        value={product.stock === 9999 ? "Unlimited" : product.stock} sub={`Threshold: ${product.lowStockThreshold}`} color="text-purple-600" />
      </motion.div>

      {/* ── Main layout ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — main content */}
        <div className="lg:col-span-2 space-y-5">

          {/* Hero image + badges */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show">
            <Section>
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl border border-border bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden">
                  {product.featuredImage ? (
                    <Image src={product.featuredImage} alt={product.name} width={96} height={96} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <Package size={32} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${typeColor}`}>
                      {t(typeLabel)}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[statusBadge.variant] ?? "bg-muted text-muted-foreground"}`}>
                      {t(statusBadge.label)}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[stockBadge.variant] ?? "bg-muted text-muted-foreground"}`}>
                      {t(stockBadge.label)}
                    </span>
                    {discount && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-600">
                        -{discount}% OFF
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-foreground leading-snug">{product.name}</h2>
                  {product.shortDescription && (
                    <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">{product.shortDescription}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-3 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Hash size={11} /> {product.sku}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} /> Created {product.createdAt}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> Updated {product.updatedAt}</span>
                  </div>
                </div>
              </div>
            </Section>
          </motion.div>

          {/* Description */}
          {product.description && (
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
              <Section title="Description">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-[14px] leading-relaxed text-foreground"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </Section>
            </motion.div>
          )}

          {/* Specification */}
          {product.specification && (
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show">
              <Section title="Specification">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-[14px] leading-relaxed text-foreground"
                  dangerouslySetInnerHTML={{ __html: product.specification }}
                />
              </Section>
            </motion.div>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show">
              <Section title={`Variants (${product.variants.length})`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-left">
                        <th className="pb-2.5 font-semibold">Variant</th>
                        <th className="pb-2.5 font-semibold">SKU</th>
                        <th className="pb-2.5 font-semibold">Price</th>
                        <th className="pb-2.5 font-semibold">Stock</th>
                        <th className="pb-2.5 font-semibold text-center">Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {product.variants.map((v) => (
                        <tr key={v.id}>
                          <td className="py-2.5 font-medium text-foreground">{Object.values(v.attributes ?? {}).join(" / ") || "—"}</td>
                          <td className="py-2.5 font-mono text-muted-foreground">{v.sku || "—"}</td>
                          <td className="py-2.5 text-foreground">{v.price ? formatStorePrice(Number(v.price)) : "—"}</td>
                          <td className="py-2.5 text-foreground">{v.stock ?? "—"}</td>
                          <td className="py-2.5 text-center">
                            <CheckCircle2 size={14} className="inline text-emerald-500" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            </motion.div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show">
              <Section title="Tags">
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium bg-muted rounded-md text-foreground">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              </Section>
            </motion.div>
          )}

          {/* SEO */}
          {(product.seoTitle || product.seoDescription) && (
            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="show">
              <Section title="SEO">
                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-1.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <ExternalLink size={10} /> Search Preview
                  </p>
                  <p className="text-[15px] font-semibold text-blue-600 leading-tight">
                    {product.seoTitle || product.name}
                  </p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    {product.seoDescription || product.shortDescription || "No meta description."}
                  </p>
                  <p className="text-[11px] text-green-600 truncate">
                    yourstore.com/products/{product.slug}
                  </p>
                </div>
              </Section>
            </motion.div>
          )}
        </div>

        {/* RIGHT sidebar */}
        <div className="space-y-5">

          {/* Pricing */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show">
            <Section title="Pricing">
              <DataRow label="Regular Price" value={<span className="text-emerald-600 font-bold text-[15px]">{formatStorePrice(product.price)}</span>} />
              {product.compareAtPrice && product.compareAtPrice > 0 && (
                <DataRow label="Compare At" value={<span className="line-through text-muted-foreground">{formatStorePrice(product.compareAtPrice)}</span>} />
              )}
              {product.costPrice && product.costPrice > 0 && (
                <DataRow label="Cost Price" value={formatStorePrice(product.costPrice)} />
              )}
              {margin && (
                <DataRow
                  label="Margin"
                  value={
                    <span className={Number(margin) >= 50 ? "text-emerald-600" : Number(margin) >= 20 ? "text-amber-600" : "text-red-500"}>
                      {margin}%
                    </span>
                  }
                />
              )}
              {product.taxClass && (
                <DataRow label="Tax Class" value={<span className="capitalize">{product.taxClass.replace(/_/g, " ")}</span>} />
              )}
            </Section>
          </motion.div>

          {/* Inventory */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
            <Section title="Inventory">
              <DataRow label="SKU" value={product.sku} mono />
              <DataRow label="Stock Qty" value={product.stock === 9999 ? "Unlimited" : product.stock} />
              <DataRow label="Low Stock At" value={product.lowStockThreshold} />
              <DataRow
                label="Stock Status"
                value={
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColors[stockBadge.variant] ?? "bg-muted text-muted-foreground"}`}>
                    {t(stockBadge.label)}
                  </span>
                }
              />
              {product.weight && product.weight > 0 && (
                <DataRow label="Weight" value={`${product.weight} kg`} />
              )}
            </Section>
          </motion.div>

          {/* Organisation */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show">
            <Section title="Organisation">
              {categoryNames.length > 0 && (
                <DataRow
                  label="Categories"
                  value={
                    <div className="flex flex-wrap gap-1 justify-end">
                      {categoryNames.map((c) => (
                        <span key={c} className="text-[11px] bg-muted text-foreground px-2 py-0.5 rounded-sm font-medium">{c}</span>
                      ))}
                    </div>
                  }
                />
              )}
              {product.publishedAt && (
                <DataRow label="Published" value={product.publishedAt.replace("T", " ").slice(0, 16)} />
              )}
              <DataRow label="Created" value={product.createdAt} />
              <DataRow label="Updated" value={product.updatedAt} />
              <DataRow label="Slug" value={<span className="font-mono text-[11px] text-muted-foreground">/{product.slug}</span>} />
            </Section>
          </motion.div>

          {/* Performance */}
          {(product.totalSales || product.rating) && (
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show">
              <Section title="Performance">
                {product.totalSales !== undefined && (
                  <DataRow
                    label="Total Sales"
                    value={
                      <span className="flex items-center gap-1">
                        <ShoppingCart size={12} className="text-muted-foreground" />
                        {product.totalSales.toLocaleString()} units
                      </span>
                    }
                  />
                )}
                {product.rating !== undefined && (
                  <DataRow
                    label="Rating"
                    value={
                      <span className="flex items-center gap-1">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        {product.rating} / 5
                        {product.reviewCount && <span className="text-muted-foreground text-[11px]">({product.reviewCount})</span>}
                      </span>
                    }
                  />
                )}
                {product.costPrice && product.totalSales && (
                  <DataRow
                    label="Est. Revenue"
                    value={<span className="text-emerald-600">{formatStorePrice(product.price * product.totalSales)}</span>}
                  />
                )}
              </Section>
            </motion.div>
          )}

          {/* Low stock alert */}
          {product.stockStatus === "low_stock" && (
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show">
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30 px-4 py-3">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-semibold text-amber-700 dark:text-amber-500">Low Stock</p>
                  <p className="text-[12px] text-amber-600/80 dark:text-amber-500/70 mt-0.5">
                    Only {product.stock} units left. Threshold is {product.lowStockThreshold}.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </motion.div>
  );
}
