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
  | "custom-html";

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

export interface ProductTabsData {
  tabs: Array<{
    label: string;
    products: ProductItem[];
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

export interface BlogSectionData {
  title: string;
  subtitle?: string;
  posts: BlogPost[];
}

export interface CustomHtmlData {
  html: string;
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
}

export type TypedBlock = {
  [K in BlockType]: Block<BlockDataMap[K]>;
}[BlockType];
