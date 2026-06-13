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
  siteLanguages: string[];
  defaultSiteLanguage: string;
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
  published: boolean;
  publishedAt: string | null;
  isLandingPage: boolean;
  layoutId: string | null;
  themeId: string | null;
  themeIdentifier: string | null;
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
  list: () => apiFetch<CmsBlogListItem[]>("/cms/blogs"),
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

// ─── CMS blog tags ──────────────────────────────────────
export interface CmsBlogTag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export const cmsBlogTags = {
  list: () => apiFetch<CmsBlogTag[]>("/cms/blog-tags"),
  findOrCreate: (name: string) =>
    apiFetch<CmsBlogTag>("/cms/blog-tags", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/cms/blog-tags/${id}`, { method: "DELETE" }),
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
