// ─── Navigation ──────────────────────────────────────────
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
  badgeVariant?: "default" | "success" | "warning" | "error" | "info";
  children?: NavItem[];
  isNew?: boolean;
  isPro?: boolean;
  /** Module entitlement key required to see this item (e.g. "CMS", "CRM").
   *  Items without it are always visible; super admins see everything. */
  module?: string;
}

export interface NavSection {
  id: string;
  label?: string;
  items: NavItem[];
}

// ─── User & Auth ─────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin?: string;
  plan?: PlanType;
}

export type UserRole = "owner" | "admin" | "manager" | "editor" | "viewer";
export type PlanType = "starter" | "professional" | "enterprise";

// ─── Dashboard ───────────────────────────────────────────
export interface StatCardData {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeLabel?: string;
  icon: string;
  color: "brand" | "success" | "warning" | "error" | "info" | "purple" | "cyan";
  prefix?: string;
  suffix?: string;
  sparklineData?: number[];
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  user?: Pick<User, "name" | "avatar">;
  meta?: Record<string, string | number>;
}

export type ActivityType =
  | "crm_lead"
  | "payment"
  | "store_order"
  | "email_campaign"
  | "user_signup"
  | "seo_alert"
  | "lighthouse_report"
  | "system";

// ─── CRM ─────────────────────────────────────────────────
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: LeadStatus;
  source: LeadSource;
  value?: number;
  assignedTo?: string;
  createdAt: string;
  lastContact?: string;
  tags?: string[];
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type LeadSource =
  | "website"
  | "referral"
  | "social"
  | "email"
  | "paid_ads"
  | "organic"
  | "cold_outreach";

// ─── Payments ────────────────────────────────────────────
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  customer: string;
  method: PaymentMethod;
  description?: string;
  createdAt: string;
}

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded" | "disputed";
export type PaymentMethod = "card" | "bank_transfer" | "paypal" | "crypto" | "invoice";

// ─── Store ───────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  category: string;
  status: "active" | "draft" | "archived";
  image?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: OrderStatus;
  items: number;
  createdAt: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

// ─── SEO & Lighthouse ────────────────────────────────────
export interface SeoMetric {
  id: string;
  url: string;
  title?: string;
  description?: string;
  score: number;
  issues: number;
  status: "good" | "needs_improvement" | "poor";
  lastChecked: string;
}

export interface LighthouseReport {
  id: string;
  url: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa?: number;
  runAt: string;
  device: "mobile" | "desktop";
}

// ─── Email Campaigns ─────────────────────────────────────
export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "paused"
  | "cancelled";

// ─── Reports ─────────────────────────────────────────────
export interface ChartDataPoint {
  label: string;
  value: number;
  value2?: number;
  value3?: number;
}

export interface ReportRange {
  from: string;
  to: string;
  preset?: "today" | "7d" | "30d" | "90d" | "12m" | "custom";
}

// ─── UI State ────────────────────────────────────────────
export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

export type ThemeMode = "light" | "dark" | "system";

export interface SidebarState {
  isOpen: boolean;
  isMobile: boolean;
  isCollapsed: boolean;
}

// ─── API ─────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

// ─── Table ───────────────────────────────────────────────
export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface TableState {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  filters?: Record<string, string | string[]>;
}
