import type { NavSection } from "@/types";

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "core",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    items: [
      {
        id: "crm",
        label: "CRM",
        href: "/crm",
        icon: "Users2",
        badge: 12,
        badgeVariant: "info",
        module: "CRM",
      },
      {
        id: "email",
        label: "Email Automations",
        href: "/email",
        icon: "Mail",
        module: "EMAIL",
      },
      {
        id: "calling",
        label: "Calling",
        href: "/calling",
        icon: "Phone",
        isNew: true,
        module: "CALLING",
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      {
        id: "cms",
        label: "CMS / Editor",
        href: "/cms",
        icon: "FileText",
        module: "CMS",
        children: [
          { id: "cms-pages", label: "Pages", href: "/cms/pages", icon: "" },
          { id: "cms-blogs", label: "Blogs", href: "/cms/blogs", icon: "" },
          {
            id: "cms-gallery",
            label: "Gallery",
            href: "/cms/gallery",
            icon: "",
          },
          { id: "cms-teams", label: "Teams", href: "/cms/teams", icon: "" },
          {
            id: "cms-comments",
            label: "Comments",
            href: "/cms/comments",
            icon: "",
          },
          {
            id: "cms-contact",
            label: "Contact Requests",
            href: "/cms/contact-requests",
            icon: "",
          },
          { id: "cms-forms", label: "Forms", href: "/cms/forms", icon: "" },
          { id: "cms-themes", label: "Themes", href: "/cms/themes", icon: "" },
          {
            id: "cms-menus",
            label: "Menus",
            href: "/cms/menus",
            icon: "",
          },
          {
            id: "cms-preview",
            label: "Preview Website",
            href: "/cms/preview",
            icon: "",
          },
          {
            id: "cms-settings",
            label: "Settings",
            href: "/cms/settings",
            icon: "",
          },
        ],
      },
      {
        id: "seo",
        label: "SEO Tools",
        href: "/seo",
        icon: "TrendingUp",
        module: "SEO",
      },
      {
        id: "lighthouse",
        label: "Lighthouse",
        href: "/lighthouse",
        icon: "TowerControl",
        module: "LIGHTHOUSE",
      },
      {
        id: "mail",
        label: "Mail",
        href: "/mail",
        icon: "Mail",
        module: "MAIL",
      },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    items: [
      {
        id: "store",
        label: "Store",
        href: "/store",
        icon: "Store",
        module: "STORE",
        children: [
          {
            id: "store-dashboard",
            label: "Dashboard",
            href: "/store",
            icon: "",
          },
          {
            id: "store-products",
            label: "Products",
            href: "/store/products",
            icon: "",
          },
          {
            id: "store-categories",
            label: "Categories",
            href: "/store/categories",
            icon: "",
          },
          {
            id: "store-inventory",
            label: "Inventory",
            href: "/store/inventory",
            icon: "",
          },
          {
            id: "store-orders",
            label: "Orders",
            href: "/store/orders",
            icon: "",
          },
          {
            id: "store-customers",
            label: "Customers",
            href: "/store/customers",
            icon: "",
          },
          {
            id: "store-coupons",
            label: "Coupons",
            href: "/store/coupons",
            icon: "",
          },
          {
            id: "store-credits",
            label: "Store Credits",
            href: "/store/credits",
            icon: "",
          },
          {
            id: "store-rewards",
            label: "Reward Points",
            href: "/store/rewards",
            icon: "",
          },
          {
            id: "store-automations",
            label: "Automations",
            href: "/store/automations",
            icon: "",
          },
          {
            id: "store-reports",
            label: "Reports",
            href: "/store/reports",
            icon: "",
          },
          {
            id: "store-ai",
            label: "AI Assistant",
            href: "/store/ai-assistant",
            icon: "",
          },
          {
            id: "store-settings",
            label: "Store Settings",
            href: "/store/settings",
            icon: "",
          },
        ],
      },
      {
        id: "payments",
        label: "Payments",
        href: "/payments",
        icon: "CreditCard",
        module: "PAYMENTS",
      },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    items: [
      {
        id: "reports",
        label: "Reports",
        href: "/reports",
        icon: "BarChart3",
        module: "REPORTS",
      },
      {
        id: "users",
        label: "Users",
        href: "/users",
        icon: "UserCog",
      },
      {
        id: "settings",
        label: "Settings",
        href: "/settings",
        icon: "Settings2",
      },
    ],
  },
];

// Platform-admin navigation — shown only to super admins (no package gating).
export const SUPER_ADMIN_NAV: NavSection[] = [
  {
    id: "sa-core",
    items: [
      {
        id: "sa-dashboard",
        label: "Dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
      },
    ],
  },
  {
    id: "sa-platform",
    label: "Platform",
    items: [
      {
        id: "sa-companies",
        label: "Companies",
        href: "/admin/companies",
        icon: "Building2",
      },
      {
        id: "sa-packages",
        label: "Packages",
        href: "/admin/packages",
        icon: "Package",
      },
      {
        id: "sa-modules",
        label: "Modules",
        href: "/admin/modules",
        icon: "Boxes",
      },
      { id: "sa-users", label: "Users", href: "/admin/users", icon: "UserCog" },
      {
        id: "sa-settings",
        label: "Settings",
        href: "/settings",
        icon: "Settings2",
      },
    ],
  },
];

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const TOPBAR_HEIGHT = 64;
