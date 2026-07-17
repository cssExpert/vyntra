import { useCallback, useEffect, useState } from "react";
import { storefrontFetch, ApiError } from "@/lib/storefrontApi";

export interface AccountProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  rewardPoints: number;
  storeCredit: number;
  rewardTier: string;
  totalOrders: number;
  totalSpent: number;
}

export interface AccountOrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl: string | null;
  variantLabel: string | null;
}

export interface AccountOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  currencyCode: string;
  createdAt: string;
  items: AccountOrderItem[];
  shippingAddress?: Record<string, unknown> | null;
  billingAddress?: Record<string, unknown> | null;
  timeline?: { status: string; message: string; createdAt: string }[];
}

export interface AccountAddress {
  id: string;
  label: string | null;
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  zip: string;
  phone: string | null;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export function useAccountProfile(orgId: string, enabled: boolean) {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await storefrontFetch<AccountProfile>(orgId, "/account/me");
      setProfile(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [orgId, enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateProfile = async (data: { name?: string; phone?: string }) => {
    const updated = await storefrontFetch<AccountProfile>(orgId, "/account/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    setProfile(updated);
  };

  return { profile, loading, error, refetch, updateProfile };
}

export function useAccountOrders(orgId: string, enabled: boolean) {
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await storefrontFetch<{ data: AccountOrder[]; total: number }>(orgId, "/account/orders?take=50");
      setOrders(data.data);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [orgId, enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { orders, total, loading, error, refetch };
}

export function useAccountOrder(orgId: string, orderId: string | null) {
  const [order, setOrder] = useState<AccountOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    storefrontFetch<AccountOrder>(orgId, `/account/orders/${orderId}`)
      .then((data) => !cancelled && setOrder(data))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Failed to load order"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [orgId, orderId]);

  return { order, loading, error };
}

export function useAccountAddresses(orgId: string, enabled: boolean) {
  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await storefrontFetch<AccountAddress[]>(orgId, "/account/addresses");
      setAddresses(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }, [orgId, enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createAddress = async (data: Omit<AccountAddress, "id">) => {
    await storefrontFetch(orgId, "/account/addresses", { method: "POST", body: JSON.stringify(data) });
    await refetch();
  };

  const updateAddress = async (id: string, data: Partial<Omit<AccountAddress, "id">>) => {
    await storefrontFetch(orgId, `/account/addresses/${id}`, { method: "PATCH", body: JSON.stringify(data) });
    await refetch();
  };

  const deleteAddress = async (id: string) => {
    await storefrontFetch(orgId, `/account/addresses/${id}`, { method: "DELETE" });
    await refetch();
  };

  return { addresses, loading, error, refetch, createAddress, updateAddress, deleteAddress };
}
