"use client";

import { useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { useProductDetail } from "@/lib/themes/useProductDetail";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { useStorefrontToastStore } from "@/store/storefrontToastStore";
import { ApiError } from "@/lib/storefrontApi";

const ORANGE = "#e4611e";

function SkeletonDetail() {
  return (
    <section className="py-8 bg-white dark:bg-[#121214] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-4 w-40 bg-gray-100 dark:bg-[#2a2a2e] animate-pulse rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="aspect-square bg-gray-100 dark:bg-[#2a2a2e] animate-pulse rounded" />
          <div className="space-y-4 pt-2">
            <div className="h-7 w-3/4 bg-gray-100 dark:bg-[#2a2a2e] animate-pulse rounded" />
            <div className="h-5 w-1/3 bg-gray-100 dark:bg-[#2a2a2e] animate-pulse rounded" />
            <div className="h-4 w-full bg-gray-100 dark:bg-[#2a2a2e] animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-gray-100 dark:bg-[#2a2a2e] animate-pulse rounded" />
            <div className="h-12 w-48 bg-gray-200 dark:bg-[#2a2a2e] animate-pulse rounded mt-6" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ProductDetail({
  orgId,
  slug,
}: {
  orgId: string;
  slug?: string;
}) {
  const { product, loading, notFound } = useProductDetail(orgId, slug ?? "");
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useStorefrontToastStore((s) => s.addToast);
  const isSaved = useWishlistStore((s) => (product ? s.isSaved(product.id) : false));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isLoggedIn = useCustomerAuthStore((s) => !!s.customer);
  const openAuthModal = useCustomerAuthStore((s) => s.openAuthModal);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "specification">("description");
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // Attribute options derived from every variant (e.g. { Size: ["S","M"], Color: ["Red","Blue"] })
  const attributeOptions = useMemo(() => {
    if (!product) return {};
    const options: Record<string, Set<string>> = {};
    for (const variant of product.variants) {
      for (const [key, value] of Object.entries(variant.attributes)) {
        if (!options[key]) options[key] = new Set();
        options[key].add(value);
      }
    }
    return Object.fromEntries(Object.entries(options).map(([k, v]) => [k, Array.from(v)]));
  }, [product]);

  const hasVariants = product ? product.variants.length > 0 : false;
  const attributeKeys = Object.keys(attributeOptions);
  const allAttrsSelected = attributeKeys.every((k) => selectedAttrs[k]);

  const selectedVariant = useMemo(() => {
    if (!product || !hasVariants || !allAttrsSelected) return null;
    return (
      product.variants.find((v) => attributeKeys.every((k) => v.attributes[k] === selectedAttrs[k])) ?? null
    );
  }, [product, hasVariants, allAttrsSelected, attributeKeys, selectedAttrs]);

  if (loading) return <SkeletonDetail />;

  if (notFound || !product) {
    return (
      <section className="py-24 bg-white dark:bg-[#121214] min-h-screen flex flex-col items-center justify-center gap-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Product not found</p>
        { }
        <a href="/shop" className="text-sm underline" style={{ color: ORANGE }}>Back to all products</a>
      </section>
    );
  }

  const allImages = product.media.length > 0
    ? product.media.map((m) => ({ url: m.url, alt: m.alt ?? product.name }))
    : product.featuredImage
      ? [{ url: product.featuredImage, alt: product.name }]
      : [];

  const currentImg = allImages[activeImg] ?? null;

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayCompareAt = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const displayStock = selectedVariant?.stock ?? product.stock;

  const discount = displayCompareAt
    ? Math.round(((displayCompareAt - displayPrice) / displayCompareAt) * 100)
    : null;

  const inStock = hasVariants
    ? (selectedVariant ? selectedVariant.stock > 0 : true) // unknown until a variant is picked — don't block the button
    : product.stockStatus !== "out_of_stock";

  const canAddToCart = inStock && (!hasVariants || !!selectedVariant) && displayStock > 0;

  const handleAddToCart = async () => {
    if (!canAddToCart) return;
    setAdding(true);
    try {
      await addItem(orgId, { productId: product.id, variantId: selectedVariant?.id, quantity });
      addToast(`${product.name} added to cart`, "success");
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : "Couldn't add to cart", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isLoggedIn) {
      openAuthModal("login");
      return;
    }
    try {
      await toggleWishlist(orgId, product.id);
      addToast(isSaved ? "Removed from wishlist" : "Added to wishlist", "success");
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : "Couldn't update wishlist", "error");
    }
  };

  return (
    <section className="py-8 bg-white dark:bg-[#121214] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="hover:text-gray-800 dark:hover:text-gray-200">Home</a>
          <span>/</span>
          { }
          <a href="/shop" className="hover:text-gray-800 dark:hover:text-gray-200">Shop</a>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Image Gallery ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative overflow-hidden bg-gray-50 dark:bg-[#1c1c1e] aspect-square">
              {currentImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={currentImg.url}
                  src={currentImg.url}
                  alt={currentImg.alt}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
              {!inStock && (
                <span className="absolute top-3 left-3 text-[11px] font-bold uppercase px-2.5 py-1 text-white bg-gray-500/90 rounded">
                  Sold Out
                </span>
              )}
              {discount !== null && discount > 0 && (
                <span className="absolute top-3 right-3 text-[11px] font-bold uppercase px-2.5 py-1 text-white rounded" style={{ backgroundColor: ORANGE }}>
                  -{discount}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border-2 transition-all ${
                      activeImg === i ? "border-gray-900 dark:border-gray-100" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="space-y-5 pt-1">
            {product.brand && (
              <p className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {product.brand}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold leading-snug text-gray-900 dark:text-gray-100">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">${displayPrice.toFixed(2)}</span>
              {displayCompareAt != null && (
                <span className="text-xl text-gray-400 dark:text-gray-500 line-through">${displayCompareAt.toFixed(2)}</span>
              )}
              {discount !== null && discount > 0 && (
                <span className="text-sm font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: `${ORANGE}20`, color: ORANGE }}>
                  {discount}% off
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {hasVariants && !selectedVariant
                  ? "Select options to check availability"
                  : !inStock
                    ? "Out of Stock"
                    : displayStock <= 10
                      ? "Low Stock"
                      : "In Stock"}
              </span>
            </div>

            {product.shortDescription && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.shortDescription}</p>
            )}

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-gray-400 dark:text-gray-500">SKU: <span className="font-mono">{selectedVariant?.sku ?? product.sku}</span></p>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span key={tag} className="text-[11px] px-2.5 py-1 bg-gray-100 dark:bg-[#2a2a2e] text-gray-600 dark:text-gray-400 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Variant selectors */}
            {attributeKeys.length > 0 && (
              <div className="space-y-4">
                {attributeKeys.map((key) => (
                  <div key={key}>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">{key}</p>
                    <div className="flex flex-wrap gap-2">
                      {attributeOptions[key].map((value) => {
                        const isSelected = selectedAttrs[key] === value;
                        return (
                          <button
                            key={value}
                            onClick={() => setSelectedAttrs((prev) => ({ ...prev, [key]: value }))}
                            className={`px-4 py-2 text-xs font-semibold border rounded transition-colors ${
                              isSelected
                                ? "text-white border-transparent"
                                : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-500"
                            }`}
                            style={isSelected ? { backgroundColor: ORANGE } : undefined}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded px-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(displayStock || 99, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                disabled={!canAddToCart || adding}
                onClick={handleAddToCart}
                className="flex-1 sm:flex-none px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: canAddToCart ? ORANGE : "#9ca3af" }}
              >
                {!inStock
                  ? "Out of Stock"
                  : hasVariants && !selectedVariant
                    ? "Select Options"
                    : adding
                      ? "Adding…"
                      : "Add to Cart"}
              </button>
              <button
                onClick={handleToggleWishlist}
                aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                className={`w-11 h-11 flex items-center justify-center border rounded transition-colors ${
                  isSaved ? "border-red-500 text-red-500" : "border-gray-300 dark:border-gray-700 text-gray-500 hover:text-red-500 hover:border-red-500"
                }`}
              >
                <Heart className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Description / Specification tabs ── */}
        {(product.description || product.specification) && (
          <div className="mt-14 border-t border-gray-200 dark:border-gray-800 pt-10">
            {product.description && product.specification ? (
              <>
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                  {(["description", "specification"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                        activeTab === tab
                          ? "border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div
                  className="prose prose-sm sm:prose max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: activeTab === "description" ? (product.description ?? "") : (product.specification ?? "") }}
                />
              </>
            ) : (
              <div
                className="prose prose-sm sm:prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: product.description ?? product.specification ?? "" }}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
