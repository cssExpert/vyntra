// ─── Enums ────────────────────────────────────────────────────────────────────

export type ProductType =
  | "simple"
  | "variable"
  | "digital"
  | "downloadable"
  | "service"
  | "subscription"
  | "bundle"
  | "gift_card";

export type ProductStatus = "draft" | "active" | "archived" | "scheduled";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "on_hold";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "partial";

export type CustomerStatus = "active" | "blocked" | "unverified";

export type CouponType = "percent" | "fixed_cart" | "fixed_product";

export type AutomationStatus = "active" | "paused" | "draft";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "backorder";

export type AutomationTrigger =
  | "order_created"
  | "order_paid"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "order_refunded"
  | "abandoned_cart"
  | "customer_registered"
  | "customer_first_purchase"
  | "product_low_stock"
  | "product_out_of_stock"
  | "review_received"
  | "subscription_renewed"
  | "subscription_cancelled"
  | "reward_milestone"
  | "customer_birthday";

export type AutomationAction =
  | "send_email"
  | "send_sms"
  | "add_reward_points"
  | "add_store_credit"
  | "apply_tag"
  | "create_coupon"
  | "notify_admin"
  | "webhook"
  | "assign_license"
  | "generate_invoice";

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductMedia {
  id: string;
  url: string;
  alt?: string;
  type: "image" | "video";
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  weight?: number;
  imageUrl?: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  type: ProductType;
  status: ProductStatus;
  shortDescription?: string;
  description?: string;
  featuredImage?: string;
  media?: ProductMedia[];
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  taxClass?: string;
  stockStatus: StockStatus;
  stock: number;
  lowStockThreshold: number;
  weight?: number;
  categoryIds: string[];
  tags: string[];
  brand?: string;
  variants?: ProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  totalSales?: number;
  rating?: number;
  reviewCount?: number;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  description?: string;
  imageUrl?: string;
  productCount: number;
  status: "active" | "inactive";
  sortOrder: number;
  createdAt: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
  variantLabel?: string;
}

export interface OrderAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  phone?: string;
}

export interface StoreOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currencyCode: string;
  couponCode?: string;
  notes?: string;
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;
  shippingMethod?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

// ─── Customer ────────────────────────────────────────────────────────────────

export interface StoreCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  status: CustomerStatus;
  tags: string[];
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  rewardPoints: number;
  storeCredit: number;
  lastOrderDate?: string;
  registeredAt: string;
  country?: string;
  isVip?: boolean;
  segment?: "new" | "regular" | "vip" | "at_risk" | "inactive";
}

// ─── Coupon ──────────────────────────────────────────────────────────────────

export interface StoreCoupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minimumSpend?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  usageLimitPerUser?: number;
  productIds?: string[];
  categoryIds?: string[];
  startsAt?: string;
  expiresAt?: string;
  status: "active" | "expired" | "disabled";
  freeShipping: boolean;
  createdAt: string;
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  featuredImage?: string;
  type: ProductType;
  stock: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  backorderEnabled: boolean;
  lastUpdated: string;
  warehouseLocation?: string;
}

// ─── Store Credit ─────────────────────────────────────────────────────────────

export interface StoreCreditTransaction {
  id: string;
  customerId: string;
  amount: number;
  type: "credit" | "debit";
  reason: string;
  orderId?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface CustomerCredit {
  customerId: string;
  customerName: string;
  customerEmail: string;
  balance: number;
  lastTransactionAt: string;
  transactions: StoreCreditTransaction[];
}

// ─── Reward Points ───────────────────────────────────────────────────────────

export interface RewardTransaction {
  id: string;
  customerId: string;
  points: number;
  type: "earned" | "redeemed" | "expired" | "adjusted";
  reason: string;
  orderId?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface CustomerReward {
  customerId: string;
  customerName: string;
  customerEmail: string;
  points: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  pointsToNextTier: number;
  lastEarnedAt: string;
}

// ─── Automation ──────────────────────────────────────────────────────────────

export interface AutomationCondition {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "in";
  value: string | number | string[];
}

export interface AutomationActionConfig {
  type: AutomationAction;
  config: Record<string, string | number | boolean>;
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationActionConfig[];
  status: AutomationStatus;
  runCount: number;
  lastRunAt?: string;
  isBuiltIn?: boolean;
  createdAt: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface StoreStat {
  id: string;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  trend: "up" | "down" | "neutral";
  icon: string;
  color: string;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  orders: number;
  refunds: number;
}
