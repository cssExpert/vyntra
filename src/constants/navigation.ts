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
      },
      {
        id: "email",
        label: "Email Automations",
        href: "/email",
        icon: "Mail",
      },
      {
        id: "calling",
        label: "Calling",
        href: "/calling",
        icon: "Phone",
        isNew: true,
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
      },
      {
        id: "lighthouse",
        label: "Lighthouse",
        href: "/lighthouse",
        icon: "Gauge",
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
      },
      {
        id: "payments",
        label: "Payments",
        href: "/payments",
        icon: "CreditCard",
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

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const TOPBAR_HEIGHT = 64;
