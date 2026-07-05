/**
 * Store Module Utilities
 * Shared formatting functions, helpers, and common patterns
 */

import { formatCurrency as libFormatCurrency, formatDate as libFormatDate } from "@/lib/utils";
import type { ApiInventoryItem, ApiOrderAddress, ApiStoreCoupon, ApiStoreCustomer, ApiStoreOrder } from "@/lib/api";
import type { CustomerCredit, CustomerReward, InventoryItem, OrderAddress, ProductType, StockStatus, StoreCoupon, StoreCustomer, StoreOrder } from "./store.types";
import { REWARD_TIER_THRESHOLDS } from "./store.constants";

// ─── Currency & Price Formatting ───────────────────────────────────────────

export function formatStorePrice(price: number): string {
  return libFormatCurrency(price, "USD", "en-US");
}

// ─── API → View Model Mapping ──────────────────────────────────────────────

export function toStoreCustomer(c: ApiStoreCustomer): StoreCustomer {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone ?? undefined,
    avatarUrl: c.avatarUrl ?? undefined,
    status: c.status as StoreCustomer["status"],
    tags: c.tags,
    totalOrders: c.totalOrders,
    totalSpent: c.totalSpent,
    averageOrderValue: c.averageOrderValue,
    rewardPoints: c.rewardPoints,
    storeCredit: c.storeCredit,
    lastOrderDate: c.lastOrderDate ?? undefined,
    registeredAt: c.registeredAt,
    isVip: c.isVip,
    segment: (c.segment ?? undefined) as StoreCustomer["segment"],
  };
}

function toStoreOrderAddress(a: ApiOrderAddress): OrderAddress {
  return {
    name: a.name,
    line1: a.line1,
    line2: a.line2 ?? undefined,
    city: a.city,
    state: a.state,
    country: a.country,
    zip: a.zip,
    phone: a.phone ?? undefined,
  };
}

export function toStoreOrder(o: ApiStoreOrder): StoreOrder {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerId: o.customerId,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    status: o.status as StoreOrder["status"],
    paymentStatus: o.paymentStatus as StoreOrder["paymentStatus"],
    items: o.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      sku: i.sku,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.totalPrice,
      imageUrl: i.imageUrl ?? undefined,
      variantLabel: i.variantLabel ?? undefined,
    })),
    subtotal: o.subtotal,
    discount: o.discountAmount,
    shipping: o.shippingCost,
    tax: o.taxAmount,
    total: o.total,
    currencyCode: o.currencyCode,
    couponCode: o.couponCode ?? undefined,
    notes: o.notes ?? undefined,
    shippingAddress: o.shippingAddress ? toStoreOrderAddress(o.shippingAddress) : undefined,
    billingAddress: o.billingAddress ? toStoreOrderAddress(o.billingAddress) : undefined,
    shippingMethod: o.shippingMethod ?? undefined,
    trackingNumber: o.trackingNumber ?? undefined,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    paidAt: o.paidAt ?? undefined,
    shippedAt: o.shippedAt ?? undefined,
    deliveredAt: o.deliveredAt ?? undefined,
  };
}

export function toStoreCoupon(c: ApiStoreCoupon): StoreCoupon {
  return {
    id: c.id,
    code: c.code,
    type: c.type as StoreCoupon["type"],
    value: c.value,
    minimumSpend: c.minimumSpend ?? undefined,
    maximumDiscount: c.maximumDiscount ?? undefined,
    usageLimit: c.usageLimit ?? undefined,
    usageCount: c.usageCount,
    usageLimitPerUser: c.usageLimitPerUser ?? undefined,
    productIds: c.productIds,
    categoryIds: c.categoryIds,
    startsAt: c.startsAt ?? undefined,
    expiresAt: c.expiresAt ?? undefined,
    status: c.status as StoreCoupon["status"],
    freeShipping: c.freeShipping,
    createdAt: c.createdAt,
  };
}

export function toInventoryItem(i: ApiInventoryItem): InventoryItem {
  return {
    id: i.id,
    productId: i.productId,
    productName: i.product.name,
    sku: i.product.sku,
    featuredImage: i.product.featuredImage ?? undefined,
    type: i.product.type as ProductType,
    stock: i.stock,
    lowStockThreshold: i.product.lowStockThreshold,
    stockStatus: i.product.stockStatus as StockStatus,
    lastUpdated: i.lastUpdated,
    warehouseLocation: i.warehouseLocation ?? undefined,
  };
}

export function toCustomerCredit(c: ApiStoreCustomer): CustomerCredit {
  return {
    customerId: c.id,
    customerName: c.name,
    customerEmail: c.email,
    balance: c.storeCredit,
  };
}

const REWARD_TIERS: CustomerReward["tier"][] = ["platinum", "gold", "silver", "bronze"];

export function rewardTierForPoints(points: number): CustomerReward["tier"] {
  for (const tier of REWARD_TIERS) {
    if (points >= REWARD_TIER_THRESHOLDS[tier]) return tier;
  }
  return "bronze";
}

export function toCustomerReward(c: ApiStoreCustomer): CustomerReward {
  const tier = rewardTierForPoints(c.rewardPoints);
  const tierIndex = REWARD_TIERS.indexOf(tier);
  const nextTier = tierIndex > 0 ? REWARD_TIERS[tierIndex - 1] : null;
  return {
    customerId: c.id,
    customerName: c.name,
    customerEmail: c.email,
    points: c.rewardPoints,
    tier,
    pointsToNextTier: nextTier ? REWARD_TIER_THRESHOLDS[nextTier] - c.rewardPoints : 0,
  };
}

export function formatStorePriceWithCurrency(
  price: number,
  currencyCode: string = "USD"
): string {
  return libFormatCurrency(price, currencyCode, "en-US");
}

// ─── Discount & Coupon Formatting ──────────────────────────────────────────

export function formatCouponDiscount(coupon: StoreCoupon): string {
  if (coupon.freeShipping && coupon.value === 0) {
    return "Free Shipping";
  }

  if (coupon.type === "percent") {
    return `${coupon.value}% off`;
  }

  if (coupon.type === "fixed_cart") {
    return `${formatStorePrice(coupon.value)} off cart`;
  }

  if (coupon.type === "fixed_product") {
    return `${formatStorePrice(coupon.value)} off product`;
  }

  return `${coupon.value}`;
}

export function formatCouponValue(
  value: number,
  type: "percent" | "fixed_cart" | "fixed_product"
): string {
  if (type === "percent") {
    return `${value}%`;
  }
  return formatStorePrice(value);
}

// ─── Date & Time Formatting ───────────────────────────────────────────────

export function formatStoreDate(date: string | Date, format: "short" | "long" | "relative" = "short"): string {
  return libFormatDate(date, format);
}

export function getDaysSince(date: string | Date): number {
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDaysSince(date: string | Date): string {
  const days = getDaysSince(date);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Pagination & Page Window ─────────────────────────────────────────────

export function pageWindow(currentPage: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const window: (number | "…")[] = [];
  const add = (n: number) => {
    if (!window.includes(n)) window.push(n);
  };

  add(0);
  if (currentPage > 2) window.push("…");

  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages - 2, currentPage + 1);
  for (let i = start; i <= end; i++) add(i);

  if (currentPage < totalPages - 3) window.push("…");
  add(totalPages - 1);

  return window;
}

// ─── Text Formatting ──────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatCustomerName(customer: StoreCustomer): string {
  return customer.name || "Unknown";
}

export function formatOrderNumber(orderNumber: string): string {
  return `#${orderNumber}`;
}

// ─── Stock & Inventory Formatting ──────────────────────────────────────────

export function formatStockQuantity(quantity: number): string {
  if (quantity === 0) return "0 (Out)";
  if (quantity < 10) return `${quantity} (Low)`;
  return quantity.toString();
}

export function formatInventoryValue(quantity: number, costPrice: number): string {
  const value = quantity * costPrice;
  return formatStorePrice(value);
}

// ─── Percentage & Metrics ─────────────────────────────────────────────────

export function formatMetricPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function formatConversionRate(completed: number, total: number): string {
  if (total === 0) return "0%";
  const rate = (completed / total) * 100;
  return `${rate.toFixed(1)}%`;
}

// ─── Common Utility Functions ──────────────────────────────────────────────

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural || `${singular}s`;
}

export function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

// ─── React Table Column Helpers ────────────────────────────────────────────

import type { Column } from "@tanstack/react-table";

export function getCommonPinningStyles(
  column: Column<any>
): React.CSSProperties {
  const isPinned = column.getIsPinned();
  return {
    boxShadow:
      isPinned === "left"
        ? "-4px 0 4px -2px rgb(0 0 0 / 0.1), inset -1px 0 0 0 rgba(0,0,0,0.1)"
        : isPinned === "right"
          ? "4px 0 4px -2px rgb(0 0 0 / 0.1), inset 1px 0 0 0 rgba(0,0,0,0.1)"
          : "",
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
    backgroundColor: isPinned ? "hsl(var(--background))" : undefined,
  };
}
