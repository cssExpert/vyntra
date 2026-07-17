import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storefrontFetch, ApiError } from "@/lib/storefrontApi";
import { getCartToken, setCartToken, clearCartToken } from "@/lib/cartToken";
import { useCustomerAuthStore } from "@/store/customerAuthStore";

export interface CartItemView {
  id: string;
  productId: string;
  variantId: string | null;
  productSlug: string | null;
  quantity: number;
  productName: string;
  sku: string;
  unitPrice: number;
  priceChanged: boolean;
  imageUrl: string | null;
  variantLabel: string | null;
  lineTotal: number;
  available: boolean;
  availableStock: number;
}

export interface CartView {
  id: string | null;
  items: CartItemView[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  currencyCode: string;
  guestToken: string | null;
}

const EMPTY_CART: CartView = {
  id: null,
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  couponCode: null,
  currencyCode: "USD",
  guestToken: null,
};

interface CartState {
  orgId: string | null;
  cart: CartView;
  isOpen: boolean;
  loading: boolean;
  error: string | null;

  init: (orgId: string) => Promise<void>;
  addItem: (orgId: string, item: { productId: string; variantId?: string; quantity: number }) => Promise<void>;
  updateQuantity: (orgId: string, itemId: string, quantity: number) => Promise<void>;
  removeItem: (orgId: string, itemId: string) => Promise<void>;
  clearCart: (orgId: string) => Promise<void>;
  applyCoupon: (orgId: string, code: string) => Promise<void>;
  removeCoupon: (orgId: string) => Promise<void>;
  mergeGuestCartIntoCustomer: (orgId: string) => Promise<void>;
  openDrawer: () => void;
  closeDrawer: () => void;
  clearError: () => void;
}

function afterCartResponse(cart: CartView) {
  // A guest cart mint/roundtrip always echoes the authoritative token back —
  // capture it so subsequent requests carry the right identity.
  if (cart.guestToken && !useCustomerAuthStore.getState().accessToken) {
    setCartToken(cart.guestToken);
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      orgId: null,
      cart: EMPTY_CART,
      isOpen: false,
      loading: false,
      error: null,

      init: async (orgId) => {
        set({ loading: true, error: null });
        try {
          const cart = await storefrontFetch<CartView>(orgId, "/cart");
          afterCartResponse(cart);
          set({ orgId, cart, loading: false });
        } catch (err) {
          set({ loading: false, error: err instanceof ApiError ? err.message : "Failed to load cart" });
        }
      },

      addItem: async (orgId, item) => {
        set({ loading: true, error: null });
        try {
          const cart = await storefrontFetch<CartView>(orgId, "/cart/items", {
            method: "POST",
            body: JSON.stringify(item),
          });
          afterCartResponse(cart);
          set({ orgId, cart, loading: false, isOpen: true });
        } catch (err) {
          set({ loading: false, error: err instanceof ApiError ? err.message : "Failed to add item" });
          throw err;
        }
      },

      updateQuantity: async (orgId, itemId, quantity) => {
        const previous = get().cart;
        // Optimistic local update so the qty stepper feels instant.
        set({
          cart: {
            ...previous,
            items: previous.items.map((i) => (i.id === itemId ? { ...i, quantity, lineTotal: i.unitPrice * quantity } : i)),
          },
        });
        try {
          const cart = await storefrontFetch<CartView>(orgId, `/cart/items/${itemId}`, {
            method: "PATCH",
            body: JSON.stringify({ quantity }),
          });
          set({ cart });
        } catch (err) {
          set({ cart: previous, error: err instanceof ApiError ? err.message : "Failed to update quantity" });
          throw err;
        }
      },

      removeItem: async (orgId, itemId) => {
        const previous = get().cart;
        set({ cart: { ...previous, items: previous.items.filter((i) => i.id !== itemId) } });
        try {
          const cart = await storefrontFetch<CartView>(orgId, `/cart/items/${itemId}`, { method: "DELETE" });
          set({ cart });
        } catch (err) {
          set({ cart: previous, error: err instanceof ApiError ? err.message : "Failed to remove item" });
          throw err;
        }
      },

      clearCart: async (orgId) => {
        set({ loading: true, error: null });
        try {
          const cart = await storefrontFetch<CartView>(orgId, "/cart", { method: "DELETE" });
          set({ cart, loading: false });
        } catch (err) {
          set({ loading: false, error: err instanceof ApiError ? err.message : "Failed to clear cart" });
        }
      },

      applyCoupon: async (orgId, code) => {
        set({ loading: true, error: null });
        try {
          const cart = await storefrontFetch<CartView>(orgId, "/cart/coupon", {
            method: "POST",
            body: JSON.stringify({ code }),
          });
          set({ cart, loading: false });
        } catch (err) {
          set({ loading: false, error: err instanceof ApiError ? err.message : "Invalid coupon" });
          throw err;
        }
      },

      removeCoupon: async (orgId) => {
        set({ loading: true, error: null });
        try {
          const cart = await storefrontFetch<CartView>(orgId, "/cart/coupon", { method: "DELETE" });
          set({ cart, loading: false });
        } catch (err) {
          set({ loading: false, error: err instanceof ApiError ? err.message : "Failed to remove coupon" });
        }
      },

      mergeGuestCartIntoCustomer: async (orgId) => {
        const guestToken = getCartToken();
        if (!guestToken) return;
        try {
          const cart = await storefrontFetch<CartView>(orgId, "/cart/merge", {
            method: "POST",
            body: JSON.stringify({ guestToken }),
          });
          clearCartToken();
          set({ cart });
        } catch {
          // Guest cart may already be empty/converted — not fatal, just re-sync from the server.
          await get().init(orgId);
        }
      },

      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      clearError: () => set({ error: null }),
    }),
    { name: "vyntra_cart", partialize: (state) => ({ cart: state.cart, orgId: state.orgId }) },
  ),
);
