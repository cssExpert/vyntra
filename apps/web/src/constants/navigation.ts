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
          { id: "cms-pages",    label: "Pages",           href: "/cms/pages",            icon: "" },
          { id: "cms-blogs",    label: "Blogs",           href: "/cms/blogs",            icon: "" },
          { id: "cms-gallery",  label: "Gallery",         href: "/cms/gallery",          icon: "" },
          { id: "cms-teams",    label: "Teams",           href: "/cms/teams",            icon: "" },
          { id: "cms-comments", label: "Comments",        href: "/cms/comments",         icon: "" },
          { id: "cms-contact",  label: "Contact Requests",href: "/cms/contact-requests", icon: "" },
          { id: "cms-forms",    label: "Forms",           href: "/cms/forms",            icon: "" },
          { id: "cms-preview",  label: "Preview Website", href: "/cms/preview",          icon: "" },
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
        icon: "Gauge",
        module: "LIGHTHOUSE",
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
        icon: "ShoppingBag",
        module: "STORE",
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
      { id: "sa-dashboard", label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    ],
  },
  {
    id: "sa-platform",
    label: "Platform",
    items: [
      { id: "sa-orgs", label: "Organizations", href: "/admin/organizations", icon: "Building2" },
      { id: "sa-packages", label: "Packages", href: "/admin/packages", icon: "Package" },
      { id: "sa-modules", label: "Modules", href: "/admin/modules", icon: "Boxes" },
      { id: "sa-users", label: "Users", href: "/admin/users", icon: "UserCog" },
      { id: "sa-settings", label: "Settings", href: "/settings", icon: "Settings2" },
    ],
  },
];

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const TOPBAR_HEIGHT = 64;
