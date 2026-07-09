// Block type system — content is theme-agnostic; themes provide the renderer.

export type BlockType =
  | "hero-carousel"
  | "product-grid"
  | "product-tabs"
  | "features-banner"
  | "promo-banner"
  | "brand-carousel"
  | "category-grid"
  | "newsletter"
  | "blog-section"
  | "custom-html"
  | "page-header"
  | "text-image"
  | "contact-form"
  | "contact-form-info"
  | "google-map";

export interface Block<T = Record<string, unknown>> {
  id: string;
  type: BlockType;
  data: T;
}

// ── Per-block data shapes ─────────────────────────────────────────────────────

export interface HeroSlide {
  title: string;
  subtitle: string;
  badge?: string;
  ctaText: string;
  ctaUrl: string;
  image: string;
}

export interface HeroCarouselData {
  slides: HeroSlide[];
  autoPlayMs?: number;
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  rating?: number;
}

export interface ProductGridData {
  title: string;
  subtitle?: string;
  products: ProductItem[];
}

export interface ProductTabsSource {
  categoryId?: string;
  productType?: string;
  limit?: number;
}

export interface ProductTabsData {
  tabs: Array<{
    label: string;
    /** Live datasource — when set, products are fetched from the catalog instead of `products`. */
    source?: ProductTabsSource;
    /** Static fallback, used when `source` isn't configured. */
    products?: ProductItem[];
  }>;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesBannerData {
  features: FeatureItem[];
}

export interface PromoBannerData {
  title: string;
  subtitle?: string;
  description?: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  image: string;
  badge?: string;
}

export interface BrandItem {
  name: string;
  logo: string;
  url?: string;
}

export interface BrandCarouselData {
  title?: string;
  brands: BrandItem[];
}

export interface CategoryItem {
  name: string;
  image: string;
  count?: number;
  url: string;
}

export interface CategoryGridData {
  title?: string;
  categories: CategoryItem[];
}

export interface NewsletterData {
  title: string;
  subtitle?: string;
  placeholder: string;
  buttonText: string;
  backgroundImage?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  slug: string;
}

export type BlogTitleStyle = "default" | "underline" | "badge" | "minimal";
export type BlogDisplayMode = "grid" | "list" | "slider";

export interface BlogSectionData {
  title: string;
  subtitle?: string;
  posts: BlogPost[];
  postsCount?: number;
  titleStyle?: BlogTitleStyle;
  displayMode?: BlogDisplayMode;
  animateCards?: boolean;
  showNavigation?: boolean;
  showPagination?: boolean;
  showPaging?: boolean;
}

export interface CustomHtmlData {
  html: string;
}

export interface BreadcrumbItem {
  label: string;
  url: string;
}

export interface PageHeaderData {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  backgroundImage?: string;
}

export interface TextImageData {
  heading: string;
  paragraphs: string[];
  image?: string;
  imagePosition?: "left" | "right";
  ctaText?: string;
  ctaUrl?: string;
}

export interface BusinessHour {
  day: string;
  time: string;
}

export interface ContactFormData {
  formTitle?: string;
  formSubtitle?: string;
  infoTitle?: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: BusinessHour[];
  mapEmbedUrl?: string;
  subjects?: string[];
}

export interface ContactFormInfoData {
  formTitle?: string;
  formSubtitle?: string;
  submitText?: string;
  infoTitle?: string;
  addressLabel?: string;
  address?: string;
  phoneLabel?: string;
  /** Rendered as separate lines, e.g. "Toll Free (123) 472-796" / "Mobile: +91-9910XXXX" */
  phoneLines?: string[];
  emailLabel?: string;
  email?: string;
  workingDaysLabel?: string;
  workingDays?: string;
}

export interface GoogleMapData {
  title?: string;
  /** Plain-text address/place — used to build the embed URL automatically. */
  address?: string;
  zoom?: number;
  height?: number;
}

// ── Map: BlockType → its data shape ──────────────────────────────────────────

export interface BlockDataMap {
  "hero-carousel": HeroCarouselData;
  "product-grid": ProductGridData;
  "product-tabs": ProductTabsData;
  "features-banner": FeaturesBannerData;
  "promo-banner": PromoBannerData;
  "brand-carousel": BrandCarouselData;
  "category-grid": CategoryGridData;
  "newsletter": NewsletterData;
  "blog-section": BlogSectionData;
  "custom-html": CustomHtmlData;
  "page-header": PageHeaderData;
  "text-image": TextImageData;
  "contact-form": ContactFormData;
  "contact-form-info": ContactFormInfoData;
  "google-map": GoogleMapData;
}

export type TypedBlock = {
  [K in BlockType]: Block<BlockDataMap[K]>;
}[BlockType];
