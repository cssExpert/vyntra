import { useEffect, useRef } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCustomerAuthStore } from "@/store/customerAuthStore";

/** Ensures the wishlist is (re)synced whenever the customer logs in, then exposes wishlist state + actions. */
export function useWishlist(orgId: string) {
  const store = useWishlistStore();
  const customer = useCustomerAuthStore((s) => s.customer);
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!orgId || !customer) return;
    const key = `${orgId}:${customer.id}`;
    if (loadedFor.current === key) return;
    loadedFor.current = key;
    useWishlistStore.setState({ loaded: false, items: [] });
    store.init(orgId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, customer?.id]);

  return {
    items: store.items,
    loading: store.loading,
    error: store.error,
    isLoggedIn: !!customer,
    isSaved: store.isSaved,
    toggle: (productId: string) => store.toggle(orgId, productId),
    remove: (productId: string) => store.remove(orgId, productId),
  };
}
