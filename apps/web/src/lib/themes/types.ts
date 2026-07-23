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
  | "google-map"
  | "hero-banner"
  | "stats-counter"
  | "admissions-steps"
  | "timeline-steps"
  | "academics-programs"
  | "faculty-grid"
  | "photo-gallery"
  | "testimonials"
  | "faq-accordion"
  | "pricing-tiers"
  | "cta-cards"
  | "cta-banner";

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

export interface ProductSource {
  categoryId?: string;
  productType?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  limit?: number;
}

export interface ProductGridData {
  title: string;
  subtitle?: string;
  /** Live datasource used to fetch products from the catalog. */
  source?: ProductSource;
  /** Static fallback, used when `source` isn't configured. */
  products?: ProductItem[];
}

export interface ProductTabsData {
  tabs: Array<{
    label: string;
    /** Live datasource — when set, products are fetched from the catalog instead of `products`. */
    source?: ProductSource;
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
  limit?: number;
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

export interface BlogSource {
  category?: string;
  sort?: "newest" | "oldest";
  limit?: number;
}

export interface BlogSectionData {
  title: string;
  subtitle?: string;
  /** Live datasource used to fetch posts from the blog. */
  source?: BlogSource;
  /** Static fallback, used when `source` isn't configured. */
  posts?: BlogPost[];
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
  /** Optional department/subject select rendered above the message field. */
  departments?: string[];
}

export interface GoogleMapData {
  title?: string;
  /** Plain-text address/place — used to build the embed URL automatically. */
  address?: string;
  zoom?: number;
  height?: number;
}

// ── Academy blocks (education/institutional themes) ──────────────────────────

export interface HeroBannerData {
  eyebrow?: string;
  heading: string;
  body?: string;
  backgroundImage?: string;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  tone?: "light" | "navy";
}

export interface StatItem {
  value: string;
  label: string;
}

export interface StatsCounterData {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  stats: StatItem[];
  linkText?: string;
  linkUrl?: string;
}

export interface AdmissionsStep {
  number: string;
  title: string;
  description: string;
}

export interface AdmissionsStepsData {
  eyebrow?: string;
  title: string;
  steps: AdmissionsStep[];
  ctaText?: string;
  ctaUrl?: string;
}

export interface TimelineStep {
  marker: string;
  title: string;
  description: string;
}

export interface TimelineStepsData {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  steps: TimelineStep[];
}

export interface ProgramCard {
  name: string;
  tagline?: string;
  subjects?: string[];
  differentiator?: string;
  description?: string;
}

export interface AcademicsProgramsData {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cards: ProgramCard[];
}

export interface FacultyMember {
  name: string;
  role: string;
  bio: string;
  image?: string;
}

export interface FacultyGridData {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  intro?: string;
  members: FacultyMember[];
}

export interface GalleryImage {
  image: string;
  caption?: string;
}

export interface PhotoGalleryData {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  images: GalleryImage[];
  linkText?: string;
  linkUrl?: string;
}

export interface TestimonialItem {
  quote: string;
  name: string;
  role?: string;
}

export interface TestimonialsData {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  items: TestimonialItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqGroup {
  category: string;
  intro?: string;
  items: FaqItem[];
}

export interface FaqAccordionData {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  items?: FaqItem[];
  groups?: FaqGroup[];
  linkText?: string;
  linkUrl?: string;
}

export interface PricingTier {
  name: string;
  price: string;
  note?: string;
  badge?: string;
  features: string[];
  ctaText: string;
  ctaUrl: string;
}

export interface PricingTiersData {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tiers: PricingTier[];
  calloutTitle?: string;
  calloutBody?: string;
  calloutCtaText?: string;
  calloutCtaUrl?: string;
}

export interface CtaCard {
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  tone?: "light" | "navy";
}

export interface CtaCardsData {
  cards: CtaCard[];
}

export interface CtaBannerData {
  title: string;
  subtitle?: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
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
  "hero-banner": HeroBannerData;
  "stats-counter": StatsCounterData;
  "admissions-steps": AdmissionsStepsData;
  "timeline-steps": TimelineStepsData;
  "academics-programs": AcademicsProgramsData;
  "faculty-grid": FacultyGridData;
  "photo-gallery": PhotoGalleryData;
  "testimonials": TestimonialsData;
  "faq-accordion": FaqAccordionData;
  "pricing-tiers": PricingTiersData;
  "cta-cards": CtaCardsData;
  "cta-banner": CtaBannerData;
}

export type TypedBlock = {
  [K in BlockType]: Block<BlockDataMap[K]>;
}[BlockType];
