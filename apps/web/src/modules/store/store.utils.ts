/**
 * Store Module Utilities
 * Shared formatting functions, helpers, and common patterns
 */

import { formatCurrency as libFormatCurrency, formatDate as libFormatDate } from "@/lib/utils";
import type { StoreCoupon, StoreCustomer } from "./store.types";

// ─── Currency & Price Formatting ───────────────────────────────────────────

export function formatStorePrice(price: number): string {
  return libFormatCurrency(price, "USD", "en-US");
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

export function pageWindow(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const window: (number | string)[] = [1];

  if (currentPage > 3) {
    window.push("…");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    if (!window.includes(i)) {
      window.push(i);
    }
  }

  if (currentPage < totalPages - 2) {
    window.push("…");
  }

  window.push(totalPages);

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
