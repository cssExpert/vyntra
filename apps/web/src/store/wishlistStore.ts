import { create } from "zustand";
import { storefrontFetch, ApiError } from "@/lib/storefrontApi";

export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  featuredImage: string | null;
  stockStatus: string;
}

export interface WishlistItemView {
  id: string;
  createdAt: string;
  product: WishlistProduct;
}

interface WishlistState {
  items: WishlistItemView[];
  loaded: boolean;
  loading: boolean;
  error: string | null;

  init: (orgId: string) => Promise<void>;
  toggle: (orgId: string, productId: string) => Promise<void>;
  remove: (orgId: string, productId: string) => Promise<void>;
  isSaved: (productId: string) => boolean;
}

/** Wishlist requires a logged-in customer (unlike cart, no guest token) — storefrontFetch already attaches the customer JWT if present. */
export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loaded: false,
  loading: false,
  error: null,

  init: async (orgId) => {
    if (get().loaded || get().loading) return;
    set({ loading: true, error: null });
    try {
      const items = await storefrontFetch<WishlistItemView[]>(orgId, "/account/wishlist");
      set({ items, loaded: true, loading: false });
    } catch {
      // Not logged in, or a transient error — leave the list empty rather than surfacing an error banner for guests.
      set({ loading: false });
    }
  },

  toggle: async (orgId, productId) => {
    const alreadySaved = get().isSaved(productId);
    set({ loading: true, error: null });
    try {
      const items = alreadySaved
        ? await storefrontFetch<WishlistItemView[]>(orgId, `/account/wishlist/${productId}`, { method: "DELETE" })
        : await storefrontFetch<WishlistItemView[]>(orgId, "/account/wishlist", {
            method: "POST",
            body: JSON.stringify({ productId }),
          });
      set({ items, loaded: true, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof ApiError ? err.message : "Couldn't update wishlist" });
      throw err;
    }
  },

  remove: async (orgId, productId) => {
    set({ loading: true });
    try {
      const items = await storefrontFetch<WishlistItemView[]>(orgId, `/account/wishlist/${productId}`, { method: "DELETE" });
      set({ items, loaded: true, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof ApiError ? err.message : "Couldn't remove item" });
    }
  },

  isSaved: (productId) => get().items.some((i) => i.product.id === productId),
}));
