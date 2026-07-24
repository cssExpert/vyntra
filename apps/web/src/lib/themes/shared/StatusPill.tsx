"use client";

// Color convention ported from the admin store module's ORDER_STATUS_BADGES
// (apps/web/src/modules/store/store.constants.ts) so order status reads the
// same way here as it does in the admin dashboard — just as literal hex
// values, since storefront theme code doesn't use CSS-var Tailwind tokens.
const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#f3f4f6", text: "#6b7280", label: "Pending" },
  processing: { bg: "#e0f2fe", text: "#0369a1", label: "Processing" },
  shipped: { bg: "#fff1e6", text: "#c2410c", label: "Shipped" },
  delivered: { bg: "#dcfce7", text: "#15803d", label: "Delivered" },
  cancelled: { bg: "#fee2e2", text: "#b91c1c", label: "Cancelled" },
  refunded: { bg: "#fef3c7", text: "#b45309", label: "Refunded" },
  on_hold: { bg: "#f3f4f6", text: "#6b7280", label: "On Hold" },
};

export function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { bg: "#f3f4f6", text: "#6b7280", label: status };
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}
