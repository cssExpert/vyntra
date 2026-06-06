// Thin client for the ERVFlow backend API (NestJS) — handles JWT + errors.

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

export interface OrganizationSettings {
  name: string;
  email: string | null;
  slug: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  emailNotifications: boolean;
  slackNotifications: boolean;
}

export function apiGetOrgSettings() {
  return apiFetch<OrganizationSettings>("/organizations/settings");
}

export function apiUpdateOrgSettings(body: Partial<OrganizationSettings>) {
  return apiFetch<OrganizationSettings>("/organizations/settings", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export interface AdminSettings {
  id: string;
  siteName: string;
  supportEmail: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  maxOrganizations: number;
  maxUsersPerOrganization: number;
  enableRegistration: boolean;
  enableSocialAuth: boolean;
  maintenanceMode: boolean;
  storageProvider?: "local" | "s3" | "uploadthing" | "vercel-blob";
  s3Config?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  } | null;
  uploadthingConfig?: {
    apiKey: string;
  } | null;
  vercelBlobConfig?: {
    token: string;
  } | null;
  emailProvider?: "smtp" | "sendgrid" | "mailgun";
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    fromEmail: string;
    username?: string;
    password?: string;
  } | null;
  sendgridConfig?: {
    apiKey: string;
    fromEmail: string;
  } | null;
  mailgunConfig?: {
    apiKey: string;
    domain: string;
    fromEmail: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export function apiGetAdminSettings() {
  return apiFetch<AdminSettings>("/admin/settings");
}

export function apiUpdateAdminSettings(body: Partial<AdminSettings>) {
  return apiFetch<AdminSettings>("/admin/settings", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ─── Super-admin shapes ──────────────────────────────────
export interface AdminCompany {
  id: string;
  name: string;
  legalName: string | null;
  industry: string | null;
  address: string | null;
  slug: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  isActive: boolean;
  maxUsers: number;
  createdAt: string;
  subscription: {
    status: string;
    package: { name: string; slug: string };
  } | null;
  _count: { users: number };
}

/** Back-compat alias — the entity was renamed Organizations → Companies. */
export type AdminOrganization = AdminCompany;

export interface AdminCompanyUser {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  superAdmin: boolean;
  lastLogin: string | null;
  createdAt: string;
  roles: { role: string; organizationId: string | null }[];
}

export interface AdminCompanyModule {
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
}

/** Full detail returned by GET /admin/companies/:id (View Company page). */
export interface AdminCompanyDetail extends AdminCompany {
  subscription:
    | {
        id: string;
        status: string;
        billingEmail: string | null;
        startDate: string;
        endDate: string | null;
        package: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          priceCents: number;
          billingCycle: string;
          maxUsers: number;
        };
      }
    | null;
  users: AdminCompanyUser[];
  modules: AdminCompanyModule[];
}

export interface CreateCompanyPayload {
  name: string;
  legalName?: string;
  industry?: string;
  website?: string;
  logoUrl?: string;
  address?: string;
  email?: string;
  phone?: string;
  packageSlug: string;
  adminFirstName: string;
  adminLastName?: string;
  adminEmail: string;
  adminPassword: string;
}

export interface UpdateCompanyPayload {
  name?: string;
  legalName?: string;
  industry?: string;
  address?: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  website?: string;
  isActive?: boolean;
  maxUsers?: number;
  packageSlug?: string;
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

// ─── Domain types ────────────────────────────────────────
export interface OrgDomain {
  id: string;
  subdomain: string | null;
  customDomain: string | null;
  customDomainVerified: boolean;
  domainVerificationToken: string | null;
}

export interface DnsRecord {
  type: "A" | "CNAME" | "TXT";
  name: string;
  value: string;
  ttl: number;
  note: string;
}

export interface DnsInfo {
  subdomain: string | null;
  subdomainUrl: string | null;
  platformDomain: string;
  platformIp: string;
  customDomain: string | null;
  customDomainVerified: boolean;
  dnsRecords: DnsRecord[];
}

export interface VerifyDomainResult {
  verified: boolean;
  message: string;
}

// ─── Org admin domain endpoints ──────────────────────────
export const orgDomain = {
  get: () => apiFetch<OrgDomain>("/organizations/me/domain"),
  setCustom: (customDomain: string) =>
    apiFetch<OrgDomain>("/organizations/me/domain/custom", {
      method: "PATCH",
      body: JSON.stringify({ customDomain }),
    }),
  clearCustom: () =>
    apiFetch<OrgDomain>("/organizations/me/domain/custom", {
      method: "DELETE",
    }),
  verify: () =>
    apiFetch<VerifyDomainResult>("/organizations/me/domain/verify", {
      method: "POST",
    }),
  dnsInfo: () => apiFetch<DnsInfo>("/organizations/me/domain/dns-info"),
};

// ─── Super-admin endpoints ───────────────────────────────
export const admin = {
  // Companies (formerly "Organizations")
  listCompanies: () => apiFetch<AdminCompany[]>("/admin/companies"),
  getCompany: (id: string) =>
    apiFetch<AdminCompanyDetail>(`/admin/companies/${id}`),
  createCompany: (body: CreateCompanyPayload) =>
    apiFetch<AdminCompany>("/admin/companies", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateCompany: (id: string, body: UpdateCompanyPayload) =>
    apiFetch<AdminCompany>(`/admin/companies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  assignPackage: (id: string, packageSlug: string) =>
    apiFetch(`/admin/companies/${id}/package`, {
      method: "PUT",
      body: JSON.stringify({ packageSlug }),
    }),
  deleteCompany: (id: string) =>
    apiFetch(`/admin/companies/${id}`, { method: "DELETE" }),

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
  getModule: (id: string) =>
    apiFetch<AdminModule & { companies?: Array<{ id: string; name: string; slug: string }> }>(
      `/admin/modules/${id}`,
    ),
  updateModule: (id: string, body: Record<string, unknown>) =>
    apiFetch<AdminModule>(`/admin/modules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  // Users
  listUsers: () => apiFetch<AdminUser[]>("/admin/users"),
  promoteUser: (id: string) =>
    apiFetch<AdminUser>(`/admin/users/${id}/promote`, { method: "PUT" }),

  // Domains
  getDomain: (id: string) =>
    apiFetch<OrgDomain>(`/admin/companies/${id}/domain`),
  setSubdomain: (id: string, subdomain: string) =>
    apiFetch<OrgDomain>(`/admin/companies/${id}/domain/subdomain`, {
      method: "PATCH",
      body: JSON.stringify({ subdomain }),
    }),
  clearSubdomain: (id: string) =>
    apiFetch<OrgDomain>(`/admin/companies/${id}/domain/subdomain`, {
      method: "DELETE",
    }),
  setCustomDomain: (id: string, customDomain: string) =>
    apiFetch<OrgDomain>(`/admin/companies/${id}/domain/custom`, {
      method: "PATCH",
      body: JSON.stringify({ customDomain }),
    }),
  clearCustomDomain: (id: string) =>
    apiFetch<OrgDomain>(`/admin/companies/${id}/domain/custom`, {
      method: "DELETE",
    }),
  verifyDomain: (id: string) =>
    apiFetch<VerifyDomainResult>(`/admin/companies/${id}/domain/verify`, {
      method: "POST",
    }),
  getDnsInfo: (id: string) =>
    apiFetch<DnsInfo>(`/admin/companies/${id}/domain/dns-info`),
};

// ─── CMS pages ───────────────────────────────────────────
export interface CmsPageData {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  metaDesc: string | null;
  metaKeywords: string | null;
  published: boolean;
  publishedAt: string | null;
  isLandingPage: boolean;
}

export interface CmsPageListItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  isLandingPage: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CmsBlogListItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  author: string | null;
  createdAt: string;
  publishedAt: string | null;
}

export const cmsPages = {
  list: () => apiFetch<CmsPageListItem[]>("/cms/pages"),
  load: (slug: string) => apiFetch<CmsPageData>(`/cms/pages/${slug}`),
  save: (slug: string, content: string, publish = false) =>
    apiFetch<CmsPageData>(`/cms/pages/${slug}`, {
      method: "PATCH",
      body: JSON.stringify({ content, publish }),
    }),
};

export const cmsBlogs = {
  list: () => apiFetch<CmsBlogListItem[]>("/cms/blogs"),
};

// ─── CMS menus ───────────────────────────────────────────
export interface CmsMenuItem {
  id: string;
  label: string;
  url: string;
  target: string;
  visibility: string[];
  order: number;
  menuId: string;
}

export interface CmsMenu {
  id: string;
  name: string;
  slug: string;
  visibility: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { items: number };
  items?: CmsMenuItem[];
}

export const cmsMenus = {
  list: () => apiFetch<CmsMenu[]>("/cms/menus"),
  create: (data: { name: string; slug: string; visibility: string[] }) =>
    apiFetch<CmsMenu>("/cms/menus", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => apiFetch<CmsMenu>(`/cms/menus/${id}`),
  update: (id: string, data: Partial<Pick<CmsMenu, "name" | "slug" | "visibility">>) =>
    apiFetch<CmsMenu>(`/cms/menus/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<{ ok: boolean }>(`/cms/menus/${id}`, { method: "DELETE" }),
  setItems: (id: string, items: Pick<CmsMenuItem, "label" | "url" | "target" | "visibility">[]) =>
    apiFetch<CmsMenu>(`/cms/menus/${id}/items`, {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),
};
