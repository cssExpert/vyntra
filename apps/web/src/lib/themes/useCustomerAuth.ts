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

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    await store.register(orgId, data);
    await mergeGuestCart(orgId);
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
