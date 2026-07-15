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
  maxUsers: number;
  modules: string[];
  /** Module key → display name, for dynamic nav labels. */
  moduleNames: Record<string, string>;
  subscription: {
    status: string;
    packageName: string;
    billingCycle: string;
  } | null;
}

export interface ApiPackage {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  billingCycle: string;
  maxUsers: number;
  modules: string[];
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

/** Update the current user's own profile (name only for now). */
export function apiUpdateProfile(body: { name: string }) {
  return apiFetch<{ id: string; email: string; name: string | null }>(
    "/users/me",
    { method: "PUT", body: JSON.stringify(body) },
  );
}

/** Change your own password (verifies the current one server-side). */
export function apiChangePassword(body: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiFetch<{ success: boolean }>("/users/me/password", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export interface ApiActivityLog {
  id: string;
  action: string;
  resourceType: string | null;
  statusCode: number | null;
  ipAddress: string | null;
  createdAt: string;
  user: { name: string | null; email: string } | null;
}

/** Recent audit-log activity for the current organization. */
export function apiGetActivity() {
  return apiFetch<ApiActivityLog[]>("/organizations/activity");
}

export function apiGetMyOrg() {
  return apiFetch<ApiCurrentOrg>("/organizations/me");
}

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function apiGetOrgMembers() {
  return apiFetch<OrgMember[]>("/organizations/me/members");
}

/** Public plan catalog (active, public packages). */
export function apiGetPackages() {
  return apiFetch<ApiPackage[]>("/packages");
}

export interface OrganizationSettings {
  name: string;
  email: string | null;
  slug: string;
  logoUrl: string | null;
  darkLogoUrl: string | null;
  faviconUrl: string | null;
  themeSwitcherEnabled: boolean;
  blogCommentsEnabled: boolean;
  blogFeaturedEnabled: boolean;
  blogPinToTopEnabled: boolean;
  siteLanguages: string[];
  defaultSiteLanguage: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  emailNotifications: boolean;
  slackNotifications: boolean;
  googleAnalyticsId: string | null;
  googleSiteVerification: string | null;
  recaptchaEnabled: boolean;
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

export interface StorageMigrationReport {
  provider: string;
  total: number;
  migrated: number;
  failed: number;
  details: Array<{
    model: string;
    id: string;
    field: string;
    from: string;
    to?: string;
    error?: string;
  }>;
}

export function apiMigrateStorageToCloud() {
  return apiFetch<StorageMigrationReport>("/upload/migrate", {
    method: "POST",
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
  setUserPassword: (id: string, password: string) =>
    apiFetch<{ success: boolean }>(`/admin/users/${id}/password`, {
      method: "PUT",
      body: JSON.stringify({ password }),
    }),
  setUserActive: (id: string, isActive: boolean) =>
    apiFetch<AdminUser>(`/admin/users/${id}/lock`, {
      method: "PUT",
      body: JSON.stringify({ isActive }),
    }),

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

  // Global Themes
  listThemes: () => apiFetch<DbTheme[]>("/admin/themes"),
  createTheme: (body: { name: string; description?: string; thumbnail?: string; identifier: string }) =>
    apiFetch<DbTheme>("/admin/themes", { method: "POST", body: JSON.stringify(body) }),
  updateTheme: (id: string, body: Partial<{ name: string; description: string; thumbnail: string; identifier: string }>) =>
    apiFetch<DbTheme>(`/admin/themes/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteTheme: (id: string) =>
    apiFetch<{ ok: boolean }>(`/admin/themes/${id}`, { method: "DELETE" }),
};

// ─── CMS pages ───────────────────────────────────────────
export interface CmsPageData {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  metaDesc: string | null;
  metaKeywords: string | null;
  noIndex: boolean;
  published: boolean;
  publishedAt: string | null;
  isLandingPage: boolean;
  layoutId: string | null;
  themeId: string | null;
  themeIdentifier: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogType: string;
  ogUrl: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  twitterCardSize: string;
  faviconUrl: string | null;
  headScript: string | null;
  bodyScript: string | null;
  customCss: string | null;
}

export interface CmsPageSettingsDto {
  title?: string;
  metaDesc?: string;
  metaKeywords?: string;
  noIndex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogUrl?: string;
  ogImage?: string | null;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string | null;
  twitterCardSize?: string;
  faviconUrl?: string | null;
  headScript?: string;
  bodyScript?: string;
  customCss?: string;
}

export interface CmsPageListItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  isLandingPage: boolean;
  layoutId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CmsBlogListItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  author: string | null;
  excerpt?: string | null;
  coverImage?: string | null;
  category?: string | null;
  createdAt: string;
  publishedAt: string | null;
}

export interface CmsBlogDetail {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  body: string | null;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  author: string | null;
  category: string | null;
  seoTitle: string | null;
  metaDesc: string | null;
  keywords: string | null;
  published: boolean;
  publishedAt: string | null;
  visibility: string;
  allowComments: boolean;
  isFeatured: boolean;
  pinToTop: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CmsBlogSaveDto {
  title: string;
  subtitle?: string;
  slug: string;
  body?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  author?: string;
  category?: string;
  seoTitle?: string;
  metaDesc?: string;
  keywords?: string;
  published?: boolean;
  publishedAt?: string | null;
  visibility?: string;
  allowComments?: boolean;
  isFeatured?: boolean;
  pinToTop?: boolean;
}

export interface PageTranslation {
  id: string;
  pageId: string;
  lang: string;
  title: string;
  content: string | null;
  metaDesc: string | null;
  metaKeywords: string | null;
}

export const cmsPages = {
  list: () => apiFetch<CmsPageListItem[]>("/cms/pages"),
  load: (slug: string) => apiFetch<CmsPageData>(`/cms/pages/${slug}`),
  save: (slug: string, body: { content: string; publish?: boolean; layoutId?: string | null; themeId?: string | null }) =>
    apiFetch<CmsPageData>(`/cms/pages/${slug}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  saveSettings: (slug: string, body: CmsPageSettingsDto) =>
    apiFetch<CmsPageData>(`/cms/pages/${slug}/settings`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: (pageId: string) =>
    apiFetch<{ ok: boolean }>(`/cms/pages/${pageId}`, { method: "DELETE" }),
  bulkUpdateLayout: (pageIds: string[], layoutId: string | null) =>
    apiFetch<{ ok: boolean; updated: number }>("/cms/pages/bulk-layout", {
      method: "PUT",
      body: JSON.stringify({ pageIds, layoutId }),
    }),
  listTranslations: (pageId: string) =>
    apiFetch<PageTranslation[]>(`/cms/pages/${pageId}/translations`),
  upsertTranslation: (
    pageId: string,
    lang: string,
    body: { title: string; content?: string | null; metaDesc?: string | null; metaKeywords?: string | null },
  ) =>
    apiFetch<PageTranslation>(`/cms/pages/${pageId}/translations/${lang}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteTranslation: (pageId: string, lang: string) =>
    apiFetch<{ ok: boolean }>(`/cms/pages/${pageId}/translations/${lang}`, {
      method: "DELETE",
    }),
};

// ─── CMS dashboard stats ─────────────────────────────────
export interface CmsDashboardStats {
  totalBlogs: number;
  published: number;
  drafts: number;
  scheduled: number;
  featured: number;
  totalCategories: number;
  totalTags: number;
  totalPages: number;
  publishedPages: number;
  totalMedia: number;
  recentBlogs: {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    publishedAt: string | null;
    coverImage: string | null;
    author: string | null;
    createdAt: string;
  }[];
  topCategories: { name: string; count: number }[];
  topTags: { name: string; count: number }[];
}

export const cmsDashboard = {
  stats: () => apiFetch<CmsDashboardStats>("/cms/dashboard"),
};

export const cmsBlogs = {
  list: (params?: {
    category?: string;
    sort?: "newest" | "oldest";
    take?: number;
    published?: boolean;
  }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.sort) qs.set("sort", params.sort);
    if (params?.take !== undefined) qs.set("take", String(params.take));
    if (params?.published !== undefined) qs.set("published", String(params.published));
    const q = qs.toString();
    return apiFetch<CmsBlogListItem[]>(`/cms/blogs${q ? `?${q}` : ""}`);
  },
  get: (id: string) => apiFetch<CmsBlogDetail>(`/cms/blogs/${id}`),
  create: (dto: CmsBlogSaveDto) =>
    apiFetch<CmsBlogDetail>("/cms/blogs", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  update: (id: string, dto: Partial<CmsBlogSaveDto>) =>
    apiFetch<CmsBlogDetail>(`/cms/blogs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),
  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/cms/blogs/${id}`, { method: "DELETE" }),
};

// ─── CMS blog categories ─────────────────────────────────
export interface CmsBlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export const cmsBlogCategories = {
  list: () => apiFetch<CmsBlogCategory[]>("/cms/blog-categories"),
  create: (dto: { name: string; slug: string; description?: string }) =>
    apiFetch<CmsBlogCategory>("/cms/blog-categories", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  update: (id: string, dto: { name?: string; slug?: string; description?: string }) =>
    apiFetch<CmsBlogCategory>(`/cms/blog-categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),
  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/cms/blog-categories/${id}`, { method: "DELETE" }),
};

// ─── Media assets ────────────────────────────────────────
export interface MediaAsset {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  size: number | null;
  module: string;
  subtype: string | null;
  provider: string;
  uploadedById: string | null;
  organizationId: string;
  createdAt: string;
}

export interface MediaAssetsPage {
  items: MediaAsset[];
  total: number;
  hasMore: boolean;
}

const toAbsoluteUrl = (url: string) => {
  if (url && url.startsWith("/medias/")) {
    const base = API_BASE.replace(/\/api$/, "");
    return `${base}${url}`;
  }
  return url;
};

export const mediaAssets = {
  list: async (params?: { module?: string; subtype?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.module) qs.set("module", params.module);
    if (params?.subtype) qs.set("subtype", params.subtype);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    const page = await apiFetch<MediaAssetsPage>(`/upload/assets${q ? `?${q}` : ""}`);
    return {
      ...page,
      items: page.items.map((a) => ({ ...a, url: toAbsoluteUrl(a.url) })),
    };
  },
  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/upload/assets/${id}`, { method: "DELETE" }),
};

// ─── System page settings (SEO/OG/Favicon/Scripts/Styles for app-driven
// storefront pages like the product listing — keyed by pageType, not a slug) ──
export interface SystemPageSettingsData {
  metaTitle?: string | null;
  metaDesc?: string | null;
  metaKeywords?: string | null;
  noIndex?: boolean;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogType?: string;
  ogUrl?: string | null;
  ogImage?: string | null;
  faviconUrl?: string | null;
  /** Free-form, pageType-specific settings — e.g. { productsPerPage } for "product-listing". */
  customSettings?: Record<string, unknown> | null;
  headScript?: string | null;
  bodyScript?: string | null;
  customCss?: string | null;
}

export const systemPageSettings = {
  get: (pageType: string) =>
    apiFetch<SystemPageSettingsData>(`/cms/system-pages/${pageType}`),
  update: (pageType: string, body: SystemPageSettingsData) =>
    apiFetch<SystemPageSettingsData>(`/cms/system-pages/${pageType}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

// ─── Shared tag catalog (blogs, products, and any future taggable feature) ───
export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export const tags = {
  list: () => apiFetch<Tag[]>("/tags"),
  findOrCreate: (name: string) =>
    apiFetch<Tag>("/tags", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/tags/${id}`, { method: "DELETE" }),
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
  menuType: string;
  visibility: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { items: number };
  items?: CmsMenuItem[];
}

export interface CmsLayout {
  id: string;
  name: string;
  isDefault: boolean;
  navMenuId: string | null;
  footerColumns: { title: string; menuId: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicLayoutData {
  id: string | null;
  navMenuId: string | null;
  footerColumns: { title: string; menuId: string }[];
}

export const cmsLayouts = {
  list: () => apiFetch<CmsLayout[]>("/cms/layouts"),
  create: (body: { name: string; isDefault?: boolean; navMenuId?: string | null; footerColumns?: { title: string; menuId: string }[] }) =>
    apiFetch<CmsLayout>("/cms/layouts", { method: "POST", body: JSON.stringify(body) }),
  get: (id: string) => apiFetch<CmsLayout>(`/cms/layouts/${id}`),
  update: (id: string, body: Partial<Omit<CmsLayout, "id" | "createdAt" | "updatedAt">>) =>
    apiFetch<CmsLayout>(`/cms/layouts/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id: string) => apiFetch<{ ok: boolean }>(`/cms/layouts/${id}`, { method: "DELETE" }),
};

export interface DbTheme {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  identifier: string;
  isGlobal: boolean;
  orgId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeListResponse {
  activeThemeId: string | null;
  global: DbTheme[];
}

export interface ThemeInstallPagePreview {
  slug: string;
  title: string;
  metaDesc: string;
  isLandingPage: boolean;
  exists: boolean;
}

export interface ThemeInstallMenuPreview {
  slug: string;
  name: string;
  menuType: string;
  role: string;
  itemCount: number;
  exists: boolean;
}

export interface ThemeInstallPreview {
  pages: ThemeInstallPagePreview[];
  menus: ThemeInstallMenuPreview[];
  layout: { name: string; exists: boolean };
}

export interface ThemeInstallResult {
  pages: { installed: string[]; skipped: string[] };
  menus: { installed: string[]; skipped: string[] };
  layout: string | null;
}

export const cmsThemes = {
  list: () => apiFetch<ThemeListResponse>("/cms/themes"),
  activate: (id: string) => apiFetch<{ ok: boolean; activeThemeId: string }>(`/cms/themes/${id}/activate`, { method: "POST" }),
  deactivate: () => apiFetch<{ ok: boolean; activeThemeId: null }>("/cms/themes/active/clear", { method: "DELETE" }),
  installPreview: (identifier: string) =>
    apiFetch<ThemeInstallPreview>(`/cms/themes/${encodeURIComponent(identifier)}/install-preview`),
  install: (
    identifier: string,
    body: { pageSlugs: string[]; installMenus: boolean; installLayout: boolean; overwrite: boolean },
  ) =>
    apiFetch<ThemeInstallResult>(`/cms/themes/${encodeURIComponent(identifier)}/install`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ─── CMS Forms ───────────────────────────────────────────
export interface CmsFormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options: string[];
}

export interface CmsFormItem {
  id: string;
  name: string;
  description: string;
  slug: string;
  status: string;
  fields: CmsFormField[];
  captchaEnabled: boolean;
  responses: number;
  createdAt: string;
  updatedAt: string;
}

export interface CmsFormSaveDto {
  name: string;
  description?: string;
  slug: string;
  status?: string;
  fields?: CmsFormField[];
  captchaEnabled?: boolean;
}

export const cmsForms = {
  list: () => apiFetch<CmsFormItem[]>("/cms/forms"),
  get: (id: string) => apiFetch<CmsFormItem>(`/cms/forms/${id}`),
  create: (dto: CmsFormSaveDto) =>
    apiFetch<CmsFormItem>("/cms/forms", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  update: (id: string, dto: Partial<CmsFormSaveDto>) =>
    apiFetch<CmsFormItem>(`/cms/forms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),
  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/cms/forms/${id}`, { method: "DELETE" }),
  duplicate: (id: string) =>
    apiFetch<CmsFormItem>(`/cms/forms/${id}/duplicate`, { method: "POST" }),
  verifyCaptcha: (token: string) =>
    apiFetch<{ success: boolean; errorCodes?: string[] }>("/cms/forms/verify-captcha", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
};

// ─── CMS Contact Requests ────────────────────────────────────────────────────

export interface ContactSubmission {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export const contactRequests = {
  list: () => apiFetch<ContactSubmission[]>("/cms/contact-requests"),
  updateStatus: (id: string, status: string) =>
    apiFetch<ContactSubmission>(`/cms/contact-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/cms/contact-requests/${id}`, { method: "DELETE" }),
};

// ─── Store: Products ─────────────────────────────────────────────────────────

export interface ApiProductVariant {
  id: string;
  productId: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  stock: number;
  weight?: number | null;
  imageUrl?: string | null;
}

export interface ApiProductMedia {
  id: string;
  url: string;
  alt?: string | null;
  type: "image" | "video";
  isPrimary: boolean;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  type: string;
  status: string;
  shortDescription?: string | null;
  description?: string | null;
  specification?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  featuredImage?: string | null;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  stock: number;
  stockStatus: string;
  lowStockThreshold: number;
  weight?: number | null;
  taxClass?: string | null;
  brand?: string | null;
  categoryIds: string[];
  tags: string[];
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  variants?: ApiProductVariant[];
  media?: ApiProductMedia[];
  _count?: { orderItems: number; reviews: number };
}

export interface ApiProductsPage {
  data: ApiProduct[];
  total: number;
  skip: number;
  take: number;
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  sku: string;
  type: string;
  status?: string;
  shortDescription?: string;
  description?: string;
  specification?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock?: number;
  stockStatus?: string;
  weight?: number;
  taxClass?: string;
  brand?: string;
  featuredImage?: string;
  categoryIds?: string[];
  tags?: string[];
  publishedAt?: string;
}

export const storeProductMedia = {
  add: (productId: string, dto: { url: string; type?: string; alt?: string; isPrimary?: boolean; sortOrder?: number }) =>
    apiFetch<ApiProductMedia>(`/store/products/${productId}/media`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  remove: (productId: string, mediaId: string) =>
    apiFetch<{ id: string }>(`/store/products/${productId}/media/${mediaId}`, { method: "DELETE" }),
  setPrimary: (productId: string, mediaId: string) =>
    apiFetch<ApiProductMedia>(`/store/products/${productId}/media/${mediaId}/primary`, { method: "PATCH" }),
  reorder: (productId: string, orderedIds: string[]) =>
    apiFetch<{ ok: boolean }>(`/store/products/${productId}/media/reorder`, {
      method: "PUT",
      body: JSON.stringify({ orderedIds }),
    }),
};

export const storeProducts = {
  list: (params?: {
    skip?: number;
    take?: number;
    status?: string;
    categoryId?: string;
    type?: string;
    sort?: "newest" | "price_asc" | "price_desc";
  }) => {
    const qs = new URLSearchParams();
    if (params?.skip !== undefined) qs.set("skip", String(params.skip));
    if (params?.take !== undefined) qs.set("take", String(params.take));
    if (params?.status) qs.set("status", params.status);
    if (params?.categoryId) qs.set("categoryId", params.categoryId);
    if (params?.type) qs.set("type", params.type);
    if (params?.sort) qs.set("sort", params.sort);
    const q = qs.toString();
    return apiFetch<ApiProductsPage>(`/store/products${q ? `?${q}` : ""}`);
  },
  get: (id: string) => apiFetch<ApiProduct>(`/store/products/${id}`),
  create: (dto: CreateProductPayload) =>
    apiFetch<ApiProduct>("/store/products", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  update: (id: string, dto: Partial<CreateProductPayload>) =>
    apiFetch<ApiProduct>(`/store/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),
  remove: (id: string) =>
    apiFetch<{ id: string }>(`/store/products/${id}`, { method: "DELETE" }),
};

// ─── Store: Categories ────────────────────────────────────────────────────────

export interface ApiProductCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  status: string;
  sortOrder: number;
  featured?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  parentId?: string;
  description?: string;
  imageUrl?: string;
  status?: string;
  sortOrder?: number;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export const storeCategories = {
  list: (params?: { skip?: number; take?: number; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.skip !== undefined) qs.set("skip", String(params.skip));
    if (params?.take !== undefined) qs.set("take", String(params.take));
    if (params?.status) qs.set("status", params.status);
    const q = qs.toString();
    return apiFetch<{ data: ApiProductCategory[]; total: number }>(
      `/store/categories${q ? `?${q}` : ""}`,
    );
  },
  get: (id: string) => apiFetch<ApiProductCategory>(`/store/categories/${id}`),
  create: (dto: CreateCategoryPayload) =>
    apiFetch<ApiProductCategory>("/store/categories", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  update: (id: string, dto: Partial<CreateCategoryPayload>) =>
    apiFetch<ApiProductCategory>(`/store/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),
  remove: (id: string) =>
    apiFetch<{ id: string }>(`/store/categories/${id}`, { method: "DELETE" }),
};

// ─── Store: Attributes ───────────────────────────────────────────────────────

export interface ApiAttributeValue {
  id: string;
  name: string;
  colorHex?: string | null;
  sortOrder: number;
}

export interface ApiAttribute {
  id: string;
  organizationId: string;
  name: string;
  attributeType: string;
  fieldType: string;
  usedInVariation: boolean;
  values: ApiAttributeValue[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttributePayload {
  name: string;
  attributeType?: string;
  fieldType?: string;
  usedInVariation?: boolean;
  options?: { name: string; colorHex?: string; sortOrder?: number }[];
}

export const storeAttributes = {
  list: () =>
    apiFetch<{ data: ApiAttribute[]; total: number }>("/store/attributes"),
  get: (id: string) => apiFetch<ApiAttribute>(`/store/attributes/${id}`),
  create: (dto: CreateAttributePayload) =>
    apiFetch<ApiAttribute>("/store/attributes", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  update: (id: string, dto: Partial<CreateAttributePayload>) =>
    apiFetch<ApiAttribute>(`/store/attributes/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),
  remove: (id: string) =>
    apiFetch<{ id: string }>(`/store/attributes/${id}`, { method: "DELETE" }),
};

// ─── Customer Groups ──────────────────────────────────────────────────────────

export type CustomerGroupRestrictionMode = "all" | "only_selected" | "except_selected";

export interface ApiCustomerGroup {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  discountType: "percentage" | "fixed" | null;
  discountValue: number | null;
  categoriesMode: CustomerGroupRestrictionMode;
  productsMode: CustomerGroupRestrictionMode;
  pagesMode: CustomerGroupRestrictionMode;
  paymentMethodsMode: CustomerGroupRestrictionMode;
  shippingMethodsMode: CustomerGroupRestrictionMode;
  onlineGatewaysMode: CustomerGroupRestrictionMode;
  productPattern: string | null;
  requiresApproval: boolean;
  minOrderValue: number | null;
  maxOrderValue: number | null;
  createdAt: string;
  updatedAt: string;
  _count: { customers: number; tierPrices: number };
}

export interface CreateCustomerGroupPayload {
  name: string;
  // `undefined` = omit (create: no value; update: leave untouched). `null` = explicit clear (update only).
  description?: string | null;
  discountType?: "percentage" | "fixed" | null;
  discountValue?: number | null;
  requiresApproval?: boolean;
  minOrderValue?: number | null;
  maxOrderValue?: number | null;
}

export interface ApiCustomerGroupRestrictions {
  categoriesMode: CustomerGroupRestrictionMode;
  categoryIds: string[];
  productsMode: CustomerGroupRestrictionMode;
  productIds: string[];
  // Full summaries for the currently-selected products (not capped like searchProducts) —
  // lets the Manual picker render chips for all selections, not just the first 20.
  productItems: Omit<ApiGroupProductSummary, "price">[];
  productPattern: string | null;
  pagesMode: CustomerGroupRestrictionMode;
  pageIds: string[];
  paymentMethodsMode: CustomerGroupRestrictionMode;
  paymentMethodSlugs: string[];
  shippingMethodsMode: CustomerGroupRestrictionMode;
  shippingMethodSlugs: string[];
  onlineGatewaysMode: CustomerGroupRestrictionMode;
  onlineGatewaySlugs: string[];
}

export interface ApiTierPriceRow {
  id: string;
  productId: string;
  customerGroupId: string | null;
  minQty: number;
  price: number;
}

export interface ApiGroupProductSummary {
  id: string;
  name: string;
  sku: string;
  price: number;
}

export const storeCustomerGroups = {
  list: () =>
    apiFetch<{ data: ApiCustomerGroup[]; total: number }>("/store/customer-groups"),
  get: (id: string) => apiFetch<ApiCustomerGroup>(`/store/customer-groups/${id}`),
  create: (dto: CreateCustomerGroupPayload) =>
    apiFetch<ApiCustomerGroup>("/store/customer-groups", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  update: (id: string, dto: Partial<CreateCustomerGroupPayload>) =>
    apiFetch<ApiCustomerGroup>(`/store/customer-groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),
  remove: (id: string) =>
    apiFetch<{ id: string }>(`/store/customer-groups/${id}`, { method: "DELETE" }),
  restrictions: {
    get: (id: string) =>
      apiFetch<ApiCustomerGroupRestrictions>(`/store/customer-groups/${id}/restrictions`),
    update: (id: string, dto: Partial<ApiCustomerGroupRestrictions>) =>
      apiFetch<ApiCustomerGroupRestrictions>(`/store/customer-groups/${id}/restrictions`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),
    searchProducts: (q: string) =>
      apiFetch<ApiGroupProductSummary[]>(
        `/store/customer-groups/products/search?q=${encodeURIComponent(q)}`,
      ),
    previewPattern: (id: string, pattern: string) =>
      apiFetch<{ count: number; matches: ApiGroupProductSummary[] }>(
        `/store/customer-groups/${id}/restrictions/preview-pattern`,
        { method: "POST", body: JSON.stringify({ pattern }) },
      ),
  },
  tierPrices: {
    list: (productId: string) =>
      apiFetch<ApiTierPriceRow[]>(`/store/customer-groups/${productId}/tier-prices`),
    update: (productId: string, rows: { customerGroupId: string | null; minQty: number; price: number }[]) =>
      apiFetch<ApiTierPriceRow[]>(`/store/customer-groups/${productId}/tier-prices`, {
        method: "PUT",
        body: JSON.stringify({ rows }),
      }),
  },
};

// ─── Store Customers ───────────────────────────────────────────────────────

export interface ApiStoreCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  tags: string[];
  segment: string | null;
  isVip: boolean;
  rewardPoints: number;
  storeCredit: number;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
  registeredAt: string;
  customerGroupId: string | null;
}

export const storeCustomers = {
  list: (params?: { skip?: number; take?: number; status?: string; segment?: string; isVip?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.skip !== undefined) qs.set("skip", String(params.skip));
    if (params?.take !== undefined) qs.set("take", String(params.take));
    if (params?.status) qs.set("status", params.status);
    if (params?.segment) qs.set("segment", params.segment);
    if (params?.isVip !== undefined) qs.set("isVip", String(params.isVip));
    const q = qs.toString();
    return apiFetch<{ data: ApiStoreCustomer[]; total: number }>(
      `/store/customers${q ? `?${q}` : ""}`,
    );
  },
  get: (id: string) => apiFetch<ApiStoreCustomer>(`/store/customers/${id}`),
  update: (id: string, dto: Partial<Pick<ApiStoreCustomer, "name" | "email" | "phone" | "status" | "isVip">>) =>
    apiFetch<ApiStoreCustomer>(`/store/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),
  updateGroup: (id: string, customerGroupId: string | null) =>
    apiFetch<ApiStoreCustomer>(`/store/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify({ customerGroupId }),
    }),
  remove: (id: string) => apiFetch<{ id: string }>(`/store/customers/${id}`, { method: "DELETE" }),
};

// ─── Store Orders ──────────────────────────────────────────────────────────

export interface ApiOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl: string | null;
  variantLabel: string | null;
}

export interface ApiOrderAddress {
  id: string;
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  zip: string;
  phone: string | null;
}

export interface ApiStoreOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  items: ApiOrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  currencyCode: string;
  couponCode: string | null;
  notes: string | null;
  shippingAddress?: ApiOrderAddress | null;
  billingAddress?: ApiOrderAddress | null;
  shippingMethod: string | null;
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export const storeOrders = {
  list: (params?: { skip?: number; take?: number; status?: string; customerId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.skip !== undefined) qs.set("skip", String(params.skip));
    if (params?.take !== undefined) qs.set("take", String(params.take));
    if (params?.status) qs.set("status", params.status);
    if (params?.customerId) qs.set("customerId", params.customerId);
    const q = qs.toString();
    return apiFetch<{ data: ApiStoreOrder[]; total: number }>(
      `/store/orders${q ? `?${q}` : ""}`,
    );
  },
  get: (id: string) => apiFetch<ApiStoreOrder>(`/store/orders/${id}`),
};

// ─── Store Coupons ─────────────────────────────────────────────────────────

export interface ApiStoreCoupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minimumSpend: number | null;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  usageLimitPerUser: number | null;
  productIds: string[];
  categoryIds: string[];
  startsAt: string | null;
  expiresAt: string | null;
  status: string;
  freeShipping: boolean;
  createdAt: string;
}

export type CreateCouponPayload = {
  code: string;
  type: string;
  value: number;
  minimumSpend?: number | null;
  maximumDiscount?: number | null;
  usageLimit?: number | null;
  usageLimitPerUser?: number | null;
  productIds?: string[];
  categoryIds?: string[];
  startsAt?: string | null;
  expiresAt?: string | null;
  status?: string;
  freeShipping?: boolean;
};

export const storeCoupons = {
  list: (params?: { skip?: number; take?: number; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.skip !== undefined) qs.set("skip", String(params.skip));
    if (params?.take !== undefined) qs.set("take", String(params.take));
    if (params?.status) qs.set("status", params.status);
    const q = qs.toString();
    return apiFetch<{ data: (ApiStoreCoupon & { _count: { usages: number } })[]; total: number }>(
      `/store/coupons${q ? `?${q}` : ""}`,
    );
  },
  get: (id: string) => apiFetch<ApiStoreCoupon>(`/store/coupons/${id}`),
  create: (dto: CreateCouponPayload) =>
    apiFetch<ApiStoreCoupon>("/store/coupons", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: string, dto: Partial<CreateCouponPayload>) =>
    apiFetch<ApiStoreCoupon>(`/store/coupons/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  remove: (id: string) => apiFetch<{ id: string }>(`/store/coupons/${id}`, { method: "DELETE" }),
};

// ─── Store Inventory ───────────────────────────────────────────────────────

export interface ApiInventoryProduct {
  id: string;
  name: string;
  sku: string;
  type: string;
  featuredImage: string | null;
  lowStockThreshold: number;
  stockStatus: string;
}

export interface ApiInventoryItem {
  id: string;
  productId: string;
  variantId: string | null;
  warehouseLocation: string | null;
  stock: number;
  lastUpdated: string;
  product: ApiInventoryProduct;
}

export const storeInventory = {
  list: (params?: { skip?: number; take?: number; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.skip !== undefined) qs.set("skip", String(params.skip));
    if (params?.take !== undefined) qs.set("take", String(params.take));
    if (params?.status) qs.set("status", params.status);
    const q = qs.toString();
    return apiFetch<{ data: ApiInventoryItem[]; total: number }>(
      `/store/inventory${q ? `?${q}` : ""}`,
    );
  },
  getByProduct: (productId: string) => apiFetch<ApiInventoryItem>(`/store/inventory/product/${productId}`),
};

// ─── Store Analytics ───────────────────────────────────────────────────────

export interface ApiSalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalItems: number;
  averageItemsPerOrder: number;
}

export interface ApiCustomerMetrics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  returningCustomers: number;
  averageCustomerValue: number;
  vipCount: number;
  atRiskCustomers: number;
}

export interface ApiProductPerformance {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  averageRating: number;
  reviewCount: number;
  trend: "trending_up" | "stable" | "trending_down";
}

export interface ApiRevenueTrendPoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface ApiDashboardMetrics {
  salesMetrics: ApiSalesMetrics;
  customerMetrics: ApiCustomerMetrics;
  topProducts: ApiProductPerformance[];
  revenueTrends: ApiRevenueTrendPoint[];
  generatedAt: string;
}

export const storeAnalytics = {
  dashboard: () => apiFetch<ApiDashboardMetrics>("/store/analytics/dashboard"),
  revenueTrends: (days: number) => apiFetch<ApiRevenueTrendPoint[]>(`/store/analytics/revenue-trends?days=${days}`),
};

export const cmsMenus = {
  list: () => apiFetch<CmsMenu[]>("/cms/menus"),
  create: (data: { name: string; slug: string; visibility: string[]; menuType?: string }) =>
    apiFetch<CmsMenu>("/cms/menus", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => apiFetch<CmsMenu>(`/cms/menus/${id}`),
  update: (id: string, data: Partial<Pick<CmsMenu, "name" | "slug" | "visibility" | "menuType">>) =>
    apiFetch<CmsMenu>(`/cms/menus/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<{ ok: boolean }>(`/cms/menus/${id}`, { method: "DELETE" }),
  setItems: (id: string, items: Pick<CmsMenuItem, "label" | "url" | "target" | "visibility">[]) =>
    apiFetch<CmsMenu>(`/cms/menus/${id}/items`, {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),
};
