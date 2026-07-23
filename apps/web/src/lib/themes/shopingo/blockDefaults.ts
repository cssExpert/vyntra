import type { BlockDataMap, BlockType } from "@/lib/themes/types";

// Palette categories for the Shopingo theme's block sidebar (BlockPalette.tsx).
export const BLOCK_GROUPS: { label: string; types: BlockType[] }[] = [
  { label: "Hero", types: ["hero-carousel"] },
  { label: "Products", types: ["product-grid", "product-tabs"] },
  { label: "Content", types: ["page-header", "text-image", "features-banner", "promo-banner", "brand-carousel", "category-grid"] },
  { label: "Blog", types: ["blog-section"] },
  { label: "Other", types: ["newsletter", "contact-form", "contact-form-info", "google-map", "custom-html"] },
];

// Block categories for sidebar grouping
export const BLOCK_CATEGORIES: { label: string; blocks: BlockType[] }[] = [
  {
    label: "Hero & Banners",
    blocks: ["hero-carousel", "promo-banner", "page-header"],
  },
  {
    label: "Products",
    blocks: ["product-grid", "product-tabs"],
  },
  {
    label: "Discovery",
    blocks: ["category-grid", "brand-carousel"],
  },
  {
    label: "Content",
    blocks: ["text-image", "blog-section", "features-banner"],
  },
  {
    label: "Engagement",
    blocks: ["newsletter", "contact-form", "contact-form-info", "google-map", "custom-html"],
  },
];

export const BLOCK_META: Partial<Record<
  BlockType,
  { label: string; description: string; icon: string }
>> = {
  "hero-carousel": {
    label: "Hero Carousel",
    description: "Full-width image slides with title, CTA button and autoplay",
    icon: "carousel",
  },
  "product-grid": {
    label: "Product Grid",
    description: "Grid of product cards with price, badge and hover actions",
    icon: "grid",
  },
  "product-tabs": {
    label: "Product Tabs",
    description: "Tabbed product sections — New Arrivals, Featured, Sale…",
    icon: "tabs",
  },
  "features-banner": {
    label: "Features Banner",
    description: "Icon strips — Free Shipping, Secure Payment, Easy Returns…",
    icon: "features",
  },
  "promo-banner": {
    label: "Promo Banner",
    description: "Dark full-width promotional banner with CTA buttons",
    icon: "promo",
  },
  "brand-carousel": {
    label: "Brand Carousel",
    description: "Horizontally scrollable brand logo strip",
    icon: "brands",
  },
  "category-grid": {
    label: "Category Grid",
    description: "Circular image tiles for product categories",
    icon: "categories",
  },
  newsletter: {
    label: "Newsletter",
    description: "Email signup strip with dark background",
    icon: "newsletter",
  },
  "blog-section": {
    label: "Blog Section",
    description: "Recent blog post cards with image, author and excerpt",
    icon: "blog",
  },
  "custom-html": {
    label: "Custom HTML",
    description: "Embed any raw HTML / script snippet",
    icon: "html",
  },
  "page-header": {
    label: "Page Header",
    description: "Dark page title banner with breadcrumb navigation",
    icon: "header",
  },
  "text-image": {
    label: "Text + Image",
    description: "Two-column section with heading, paragraphs and an image",
    icon: "text-image",
  },
  "contact-form": {
    label: "Contact Form",
    description: "Contact form with info panel, business hours and optional map",
    icon: "contact",
  },
  "contact-form-info": {
    label: "Contact Form + Info",
    description: "Simple contact form (name, email, phone, message) beside an address/phone/email/hours info panel",
    icon: "contact",
  },
  "google-map": {
    label: "Google Map",
    description: "Full-width map section — enter an address, the embed is generated automatically",
    icon: "map",
  },
};

export const BLOCK_DEFAULTS: Partial<BlockDataMap> = {
  "hero-carousel": {
    slides: [
      {
        title: "Big Sale — Up to 50% Off",
        subtitle: "Shop the latest arrivals at unbeatable prices.",
        badge: "Limited Offer",
        ctaText: "Shop Now",
        ctaUrl: "/shop",
        image: "",
      },
    ],
    autoPlayMs: 4000,
  },
  "product-grid": {
    title: "Featured Products",
    subtitle: "Hand-picked products just for you",
    source: { sort: "newest", limit: 8 },
    products: [
      { id: "1", name: "Sample Product", price: 29.99, originalPrice: 49.99, image: "", badge: "Sale", rating: 4 },
    ],
  },
  "product-tabs": {
    tabs: [
      {
        label: "New Arrivals",
        source: { limit: 8 },
        products: [{ id: "1", name: "Sample Product", price: 29.99, image: "", rating: 4 }],
      },
      {
        label: "Best Sellers",
        source: { limit: 8 },
        products: [{ id: "2", name: "Another Product", price: 39.99, image: "", rating: 5 }],
      },
    ],
  },
  "features-banner": {
    features: [
      { icon: "truck", title: "Free Shipping", description: "On orders over $99" },
      { icon: "shield", title: "Secure Payment", description: "100% secure transactions" },
      { icon: "refresh", title: "Easy Returns", description: "30-day return policy" },
      { icon: "headphones", title: "24/7 Support", description: "Dedicated customer support" },
    ],
  },
  "promo-banner": {
    title: "Exclusive Summer Collection",
    subtitle: "New Season",
    description: "Discover the latest trends with up to 40% off.",
    primaryCtaText: "Shop Collection",
    primaryCtaUrl: "/shop",
    secondaryCtaText: "View Lookbook",
    secondaryCtaUrl: "/lookbook",
    image: "",
    badge: "Summer 2026",
  },
  "brand-carousel": {
    title: "Trusted Brands",
    brands: [
      { name: "Nike", logo: "", url: "#" },
      { name: "Adidas", logo: "", url: "#" },
      { name: "Puma", logo: "", url: "#" },
    ],
  },
  "category-grid": {
    title: "Shop by Category",
    categories: [
      { name: "Electronics", image: "", count: 120, url: "/category/electronics" },
      { name: "Fashion", image: "", count: 340, url: "/category/fashion" },
      { name: "Home & Garden", image: "", count: 89, url: "/category/home" },
    ],
  },
  newsletter: {
    title: "Stay in the Loop",
    subtitle: "Get the latest deals, offers and new arrivals in your inbox.",
    placeholder: "Enter your email address",
    buttonText: "Subscribe",
  },
  "blog-section": {
    title: "From Our Blog",
    subtitle: "Tips, guides and inspiration",
    posts: [
      {
        id: "1",
        title: "Top 10 Summer Trends of 2026",
        excerpt: "Discover what's hot this summer and stay ahead of the curve.",
        image: "",
        author: "Admin",
        date: "June 12, 2026",
        slug: "summer-trends-2026",
      },
      {
        id: "2",
        title: "How to Style Your Home Office in 2026",
        excerpt: "Transform your workspace with these modern design tips.",
        image: "",
        author: "Admin",
        date: "June 8, 2026",
        slug: "home-office-style-2026",
      },
      {
        id: "3",
        title: "The Ultimate Guide to Sustainable Shopping",
        excerpt: "Make eco-friendly choices without sacrificing style or budget.",
        image: "",
        author: "Admin",
        date: "June 1, 2026",
        slug: "sustainable-shopping-guide",
      },
    ],
    source: { sort: "newest", limit: 12 },
    postsCount: 3,
    titleStyle: "default",
    displayMode: "grid",
    animateCards: false,
    showNavigation: true,
    showPagination: true,
    showPaging: false,
  },
  "custom-html": {
    html: "<!-- Paste your HTML here -->",
  },
  "page-header": {
    title: "Page Title",
    subtitle: "",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Page Title", url: "#" },
    ],
    backgroundImage: "",
  },
  "text-image": {
    heading: "Our Story",
    paragraphs: [
      "We started with a simple idea — make quality products accessible to everyone.",
      "Today we serve thousands of happy customers across the world with fast, reliable delivery.",
      "Our team is passionate about curating the best products at the fairest prices.",
    ],
    image: "",
    imagePosition: "right",
    ctaText: "Shop Now",
    ctaUrl: "/shop",
  },
  "contact-form": {
    formTitle: "Send Us a Message",
    formSubtitle: "Fill out the form and we'll get back to you within 24 hours.",
    infoTitle: "Contact Information",
    address: "123 Commerce Street\nNew York, NY 10001\nUnited States",
    phone: "+1 (800) 123-4567",
    email: "hello@yourstore.com",
    hours: [
      { day: "Monday – Friday", time: "9:00 AM – 6:00 PM" },
      { day: "Saturday", time: "10:00 AM – 4:00 PM" },
      { day: "Sunday", time: "Closed" },
    ],
    mapEmbedUrl: "",
    subjects: ["Order Inquiry", "Return & Refund", "Product Question", "Partnership", "Other"],
  },
  "contact-form-info": {
    formTitle: "Drop Us a Line",
    formSubtitle: "Fill out the form below and we will get back to you as soon as possible.",
    submitText: "Send Message",
    infoTitle: "Get In Touch",
    addressLabel: "Address",
    address: "123 Street Name, City, Australia",
    phoneLabel: "Phone",
    phoneLines: ["Toll Free (123) 472-796", "Mobile : +91-9910XXXX"],
    emailLabel: "Email",
    email: "mail@example.com",
    workingDaysLabel: "Working Days",
    workingDays: "Mon - FRI / 9:30 AM - 6:30 PM",
  },
  "google-map": {
    title: "Find Us Map",
    address: "Melbourne VIC, Australia",
    zoom: 11,
    height: 420,
  },
};
