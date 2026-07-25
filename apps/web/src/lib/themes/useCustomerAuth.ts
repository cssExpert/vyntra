import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { useCartStore } from "@/store/cartStore";

/** Storefront customer auth + the guest-cart-merge-on-login handshake. */
export function useCustomerAuth(orgId: string) {
  const store = useCustomerAuthStore();
  const mergeGuestCart = useCartStore((s) => s.mergeGuestCartIntoCustomer);

  const login = async (data: { email: string; password: string }) => {
    await store.login(orgId, data);
    await mergeGuestCart(orgId);
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    customerGroupId?: string;
    address?: { line1?: string; line2?: string; city?: string; state?: string; country?: string; zip?: string };
  }) => {
    const result = await store.register(orgId, data);
    // A pending (requires-approval) registration issues no session — nothing to merge the guest cart into yet.
    if (!result.pending) await mergeGuestCart(orgId);
    return result;
  };

  return {
    customer: store.customer,
    isLoggedIn: !!store.customer,
    loading: store.loading,
    error: store.error,
    login,
    register,
    logout: store.logout,
    clearError: store.clearError,
  };
}
