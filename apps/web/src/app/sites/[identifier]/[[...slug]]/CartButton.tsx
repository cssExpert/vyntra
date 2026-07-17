"use client";

import { useCartStore } from "@/store/cartStore";

/** Cart icon + live item-count badge — replaces the static markup previously hardcoded in each navbar variant. */
export function CartButton({ orgId, className }: { orgId: string; className?: string }) {
  const items = useCartStore((s) => s.cart.items);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <button
      onClick={() => openDrawer()}
      className={className ?? "p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"}
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      data-org-id={orgId}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
      {count > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#e4611e] text-white flex items-center justify-center text-[9px] font-bold">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
