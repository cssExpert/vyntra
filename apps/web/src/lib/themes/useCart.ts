import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cartStore";

/** Ensures the cart store is synced with the server for this org, then exposes cart state + actions. */
export function useCart(orgId: string) {
  const store = useCartStore();
  const initialized = useRef<string | null>(null);

  useEffect(() => {
    if (!orgId || initialized.current === orgId) return;
    initialized.current = orgId;
    store.init(orgId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  return {
    cart: store.cart,
    loading: store.loading,
    error: store.error,
    isOpen: store.isOpen,
    addItem: (item: { productId: string; variantId?: string; quantity: number }) => store.addItem(orgId, item),
    updateQuantity: (itemId: string, quantity: number) => store.updateQuantity(orgId, itemId, quantity),
    removeItem: (itemId: string) => store.removeItem(orgId, itemId),
    clearCart: () => store.clearCart(orgId),
    applyCoupon: (code: string) => store.applyCoupon(orgId, code),
    removeCoupon: () => store.removeCoupon(orgId),
    openDrawer: store.openDrawer,
    closeDrawer: store.closeDrawer,
    clearError: store.clearError,
  };
}
