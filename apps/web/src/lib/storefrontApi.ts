// Thin fetch client for the new public/sites/:orgId/... storefront endpoints
// (cart, checkout, storefront customer auth/account). Kept separate from
// lib/api.ts (the JWT-authenticated admin dashboard client) since the auth
// model is entirely different here — a guest cart token or a storefront
// customer JWT, never the staff token.

import { getCartToken } from "./cartToken";
import { useCustomerAuthStore } from "@/store/customerAuthStore";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function storefrontFetch<T>(
  orgId: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const customerToken = useCustomerAuthStore.getState().accessToken;
  const cartToken = getCartToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
    ...(cartToken ? { "X-Cart-Token": cartToken } : {}),
    ...((options.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${API_BASE}/public/sites/${orgId}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const raw = data?.message;
    const message = Array.isArray(raw) ? raw.join(", ") : (raw ?? res.statusText ?? "Request failed");
    throw new ApiError(message, res.status);
  }
  return data as T;
}
