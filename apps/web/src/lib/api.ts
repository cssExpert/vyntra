// Thin client for the Vyntra backend API (NestJS) — handles JWT + errors.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

const TOKEN_KEY = "vyntra_token";
const REFRESH_KEY = "vyntra_refresh";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const raw = data?.message;
    const message = Array.isArray(raw)
      ? raw.join(", ")
      : (raw ?? res.statusText ?? "Request failed");
    throw new ApiError(message, res.status);
  }
  return data as T;
}

// ─── Auth shapes (mirror @vyntra/types) ──────────────────
export interface ApiAuthUser {
  id: string;
  email: string;
  name: string | null;
  superAdmin: boolean;
  organizationId: string | null;
  roles: string[];
}

export interface ApiAuthResponse {
  user: ApiAuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface ApiCurrentOrg {
  id: string;
  name: string;
  slug: string;
  modules: string[];
  subscription: {
    status: string;
    packageName: string;
    billingCycle: string;
  } | null;
}

// ─── Endpoints ───────────────────────────────────────────
export function apiLogin(email: string, password: string) {
  return apiFetch<ApiAuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function apiGetMe() {
  return apiFetch<ApiAuthUser>("/auth/me");
}

export function apiGetMyOrg() {
  return apiFetch<ApiCurrentOrg>("/organizations/me");
}

// ─── Super-admin shapes ──────────────────────────────────
export interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  isActive: boolean;
  maxUsers: number;
  createdAt: string;
  subscription: { status: string; package: { name: string; slug: string } } | null;
  _count: { users: number };
}

export interface AdminPackage {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  billingCycle: string;
  maxUsers: number;
  isActive: boolean;
  isPublic: boolean;
  modules: string[];
}

export interface AdminModule {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  superAdmin: boolean;
  isActive: boolean;
  organizationId: string | null;
  roles: { role: string; organizationId: string | null }[];
  organization?: { id: string; name: string } | null;
}

// ─── Super-admin endpoints ───────────────────────────────
export const admin = {
  // Organizations
  listOrganizations: () =>
    apiFetch<AdminOrganization[]>("/admin/organizations"),
  createOrganization: (body: {
    name: string;
    email?: string;
    packageSlug: string;
  }) =>
    apiFetch<AdminOrganization>("/admin/organizations", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  assignPackage: (id: string, packageSlug: string) =>
    apiFetch(`/admin/organizations/${id}/package`, {
      method: "PUT",
      body: JSON.stringify({ packageSlug }),
    }),
  deleteOrganization: (id: string) =>
    apiFetch(`/admin/organizations/${id}`, { method: "DELETE" }),

  // Packages
  listPackages: () => apiFetch<AdminPackage[]>("/admin/packages"),
  createPackage: (body: Partial<AdminPackage> & { name: string; moduleKeys?: string[] }) =>
    apiFetch<AdminPackage>("/admin/packages", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updatePackage: (id: string, body: Record<string, unknown>) =>
    apiFetch<AdminPackage>(`/admin/packages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deletePackage: (id: string) =>
    apiFetch(`/admin/packages/${id}`, { method: "DELETE" }),

  // Modules
  listModules: () => apiFetch<AdminModule[]>("/admin/modules"),
  createModule: (body: { key: string; name: string; description?: string }) =>
    apiFetch<AdminModule>("/admin/modules", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateModule: (id: string, body: Record<string, unknown>) =>
    apiFetch<AdminModule>(`/admin/modules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  // Users
  listUsers: () => apiFetch<AdminUser[]>("/admin/users"),
  promoteUser: (id: string) =>
    apiFetch<AdminUser>(`/admin/users/${id}/promote`, { method: "PUT" }),
};
