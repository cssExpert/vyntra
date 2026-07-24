import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StorefrontCustomer } from "@vyntra/types";
import { storefrontFetch, ApiError } from "@/lib/storefrontApi";

interface CustomerAuthResponseShape {
  customer: StorefrontCustomer;
  accessToken: string;
  refreshToken: string;
}

interface CustomerAuthState {
  customer: StorefrontCustomer | null;
  accessToken: string | null;
  refreshToken: string | null;
  orgId: string | null;
  loading: boolean;
  error: string | null;
  authModalOpen: boolean;
  authModalMode: "login" | "register";
  /** True once zustand's persist middleware has finished reading localStorage. Gate any "is the customer logged in?" UI decision on this — otherwise there's a flash of the logged-out state on every fresh page load before rehydration completes. */
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  register: (orgId: string, data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  login: (orgId: string, data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  /** Adopts the session the API auto-issues right after a guest checkout, so the confirmation page is authenticated. */
  adoptSession: (orgId: string, session: CustomerAuthResponseShape) => void;
  clearError: () => void;
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set) => ({
      customer: null,
      accessToken: null,
      refreshToken: null,
      orgId: null,
      loading: false,
      error: null,
      authModalOpen: false,
      authModalMode: "login",
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      register: async (orgId, data) => {
        set({ loading: true, error: null });
        try {
          const res = await storefrontFetch<CustomerAuthResponseShape>(orgId, "/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
          });
          set({
            customer: res.customer,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            orgId,
            loading: false,
          });
        } catch (err) {
          set({ loading: false, error: err instanceof ApiError ? err.message : "Registration failed" });
          throw err;
        }
      },

      login: async (orgId, data) => {
        set({ loading: true, error: null });
        try {
          const res = await storefrontFetch<CustomerAuthResponseShape>(orgId, "/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
          });
          set({
            customer: res.customer,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            orgId,
            loading: false,
          });
        } catch (err) {
          set({ loading: false, error: err instanceof ApiError ? err.message : "Login failed" });
          throw err;
        }
      },

      logout: () => set({ customer: null, accessToken: null, refreshToken: null, orgId: null }),

      adoptSession: (orgId, session) =>
        set({ customer: session.customer, accessToken: session.accessToken, refreshToken: session.refreshToken, orgId }),

      clearError: () => set({ error: null }),

      openAuthModal: (mode = "login") => set({ authModalOpen: true, authModalMode: mode }),
      closeAuthModal: () => set({ authModalOpen: false }),
    }),
    {
      name: "vyntra_customer_auth",
      partialize: (state) => ({
        customer: state.customer,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        orgId: state.orgId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
