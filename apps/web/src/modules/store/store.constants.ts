/**
 * Store Module Constants
 * Status mappings, type labels, badge variants
 * All label values are i18n keys (not hardcoded strings)
 */

import type {
  ProductType,
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  StockStatus,
  CustomerStatus,
  CouponType,
  AutomationStatus,
  AutomationTrigger,
  AutomationAction,
} from "./store.types";
import type { BadgeVariant } from "@/components/ui/StatusBadge";

// ─── Product Status Badges ────────────────────────────────────────────────

export const PRODUCT_STATUS_BADGES: Record<
  ProductStatus,
  { variant: BadgeVariant; label: string; icon: string }
> = {
  active: {
    variant: "success",
    label: "statusActive",
    icon: "CheckCircle2",
  },
  draft: {
    variant: "muted",
    label: "statusDraft",
    icon: "Clock",
  },
  archived: {
    variant: "muted",
    label: "statusArchived",
    icon: "Archive",
  },
  scheduled: {
    variant: "info",
    label: "statusScheduled",
    icon: "Calendar",
  },
};

// ─── Product Type Labels & Colors ─────────────────────────────────────────

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  simple: "typeSimple",
  variable: "typeVariable",
  digital: "typeDigital",
  downloadable: "typeDownloadable",
  service: "typeService",
  subscription: "typeSubscription",
  bundle: "typeBundle",
  gift_card: "typeGiftCard",
};

export const PRODUCT_TYPE_COLORS: Record<ProductType, string> = {
  simple: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  variable: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  digital: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  downloadable: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  service: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  subscription: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  bundle: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  gift_card: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
};

// ─── Order Status Badges ──────────────────────────────────────────────────

export const ORDER_STATUS_BADGES: Record<
  OrderStatus,
  { variant: BadgeVariant; label: string; icon: string }
> = {
  pending: {
    variant: "muted",
    label: "statusPending",
    icon: "Clock",
  },
  processing: {
    variant: "info",
    label: "statusProcessing",
    icon: "Loader2",
  },
  shipped: {
    variant: "default",
    label: "statusShipped",
    icon: "Truck",
  },
  delivered: {
    variant: "success",
    label: "statusDelivered",
    icon: "CheckCircle2",
  },
  cancelled: {
    variant: "error",
    label: "statusCancelled",
    icon: "XCircle",
  },
  refunded: {
    variant: "warning",
    label: "statusRefunded",
    icon: "RefreshCw",
  },
  on_hold: {
    variant: "muted",
    label: "statusOnHold",
    icon: "PauseCircle",
  },
};

// ─── Payment Status Badges ───────────────────────────────────────────────

export const PAYMENT_STATUS_BADGES: Record<
  PaymentStatus,
  { variant: BadgeVariant; label: string; icon: string }
> = {
  pending: {
    variant: "muted",
    label: "payPending",
    icon: "Clock",
  },
  paid: {
    variant: "success",
    label: "payPaid",
    icon: "CheckCircle2",
  },
  failed: {
    variant: "error",
    label: "payFailed",
    icon: "XCircle",
  },
  refunded: {
    variant: "warning",
    label: "payRefunded",
    icon: "RefreshCw",
  },
  partial: {
    variant: "info",
    label: "payPartial",
    icon: "AlertCircle",
  },
};

// ─── Coupon Status & Type Badges ──────────────────────────────────────────

export const COUPON_STATUS_BADGES: Record<
  "active" | "expired" | "disabled",
  { variant: BadgeVariant; label: string }
> = {
  active: {
    variant: "success",
    label: "statusActive",
  },
  expired: {
    variant: "muted",
    label: "statusExpired",
  },
  disabled: {
    variant: "error",
    label: "statusDisabled",
  },
};

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  percent: "typePercent",
  fixed_cart: "typeFixedCart",
  fixed_product: "typeFixedProduct",
};

// ─── Stock Status Badges ──────────────────────────────────────────────────

export const STOCK_STATUS_BADGES: Record<
  StockStatus,
  { variant: BadgeVariant; label: string; icon: string }
> = {
  in_stock: {
    variant: "success",
    label: "statusInStock",
    icon: "CheckCircle2",
  },
  low_stock: {
    variant: "warning",
    label: "statusLowStock",
    icon: "AlertTriangle",
  },
  out_of_stock: {
    variant: "error",
    label: "statusOutOfStock",
    icon: "XCircle",
  },
  backorder: {
    variant: "info",
    label: "statusBackorder",
    icon: "Loader2",
  },
};

// ─── Customer Status Badges ───────────────────────────────────────────────

export const CUSTOMER_STATUS_BADGES: Record<
  CustomerStatus,
  { variant: BadgeVariant; label: string; icon: string }
> = {
  active: {
    variant: "success",
    label: "statusActive",
    icon: "CheckCircle2",
  },
  blocked: {
    variant: "error",
    label: "statusBlocked",
    icon: "XCircle",
  },
  unverified: {
    variant: "warning",
    label: "statusUnverified",
    icon: "AlertCircle",
  },
};

// ─── Reward Tier Badges ──────────────────────────────────────────────────

export const REWARD_TIER_BADGES: Record<
  "bronze" | "silver" | "gold" | "platinum",
  { variant: BadgeVariant; label: string; icon: string; color: string }
> = {
  bronze: {
    variant: "muted",
    label: "tierBronze",
    icon: "Trophy",
    color: "text-amber-700",
  },
  silver: {
    variant: "muted",
    label: "tierSilver",
    icon: "Trophy",
    color: "text-slate-500",
  },
  gold: {
    variant: "warning",
    label: "tierGold",
    icon: "Trophy",
    color: "text-yellow-500",
  },
  platinum: {
    variant: "success",
    label: "tierPlatinum",
    icon: "Crown",
    color: "text-purple-500",
  },
};

export const REWARD_TIER_THRESHOLDS: Record<string, number> = {
  bronze: 0,
  silver: 500,
  gold: 2000,
  platinum: 5000,
};

// ─── Automation Status Badges ────────────────────────────────────────────

export const AUTOMATION_STATUS_BADGES: Record<
  AutomationStatus,
  { variant: BadgeVariant; label: string; icon: string }
> = {
  active: {
    variant: "success",
    label: "automations.statusActive",
    icon: "Play",
  },
  paused: {
    variant: "warning",
    label: "automations.statusPaused",
    icon: "PauseCircle",
  },
  draft: {
    variant: "muted",
    label: "automations.statusDraft",
    icon: "FileText",
  },
};

// ─── Automation Triggers ──────────────────────────────────────────────────

export const AUTOMATION_TRIGGER_LABELS: Record<AutomationTrigger, string> = {
  order_created: "triggerOrderCreated",
  order_paid: "triggerOrderPaid",
  order_shipped: "triggerOrderShipped",
  order_delivered: "triggerOrderDelivered",
  order_cancelled: "triggerOrderCancelled",
  order_refunded: "triggerOrderRefunded",
  abandoned_cart: "triggerAbandonedCart",
  customer_registered: "triggerCustomerRegistered",
  customer_first_purchase: "triggerFirstPurchase",
  product_low_stock: "triggerProductLowStock",
  product_out_of_stock: "triggerProductOutOfStock",
  review_received: "triggerReviewReceived",
  subscription_renewed: "triggerSubscriptionRenewed",
  subscription_cancelled: "triggerSubscriptionCancelled",
  reward_milestone: "triggerRewardMilestone",
  customer_birthday: "triggerCustomerBirthday",
};

export const AUTOMATION_TRIGGER_ICONS: Record<AutomationTrigger, string> = {
  order_created: "ShoppingCart",
  order_paid: "CreditCard",
  order_shipped: "Truck",
  order_delivered: "CheckCircle2",
  order_cancelled: "XCircle",
  order_refunded: "RefreshCw",
  abandoned_cart: "ShoppingCart",
  customer_registered: "User",
  customer_first_purchase: "Gift",
  product_low_stock: "AlertTriangle",
  product_out_of_stock: "XCircle",
  review_received: "Star",
  subscription_renewed: "RefreshCw",
  subscription_cancelled: "XCircle",
  reward_milestone: "Trophy",
  customer_birthday: "Cake",
};

// ─── Automation Actions ────────────────────────────────────────────────────

export const AUTOMATION_ACTION_LABELS: Record<AutomationAction, string> = {
  send_email: "store.automations.actionSendEmail",
  send_sms: "store.automations.actionSendSms",
  add_reward_points: "store.automations.actionAddRewardPoints",
  add_store_credit: "store.automations.actionAddStoreCredit",
  apply_tag: "store.automations.actionApplyTag",
  create_coupon: "store.automations.actionCreateCoupon",
  notify_admin: "store.automations.actionNotifyAdmin",
  webhook: "store.automations.actionWebhook",
  assign_license: "store.automations.actionAssignLicense",
  generate_invoice: "store.automations.actionGenerateInvoice",
};
