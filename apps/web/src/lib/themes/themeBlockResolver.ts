import type { BlockType } from "./types";
import type { ComponentType } from "react";

// ── Shopingo blocks ────────────────────────────────────────────────────────────
import ShopingoHeroCarousel from "./shopingo/blocks/HeroCarousel";
import ShopingoProductGrid from "./shopingo/blocks/ProductGrid";
import ShopingoProductTabs from "./shopingo/blocks/ProductTabs";
import ShopingoFeaturesBanner from "./shopingo/blocks/FeaturesBanner";
import ShopingoPromoBanner from "./shopingo/blocks/PromoBanner";
import ShopingoBrandCarousel from "./shopingo/blocks/BrandCarousel";
import ShopingoCategoryGrid from "./shopingo/blocks/CategoryGrid";
import ShopingoNewsletter from "./shopingo/blocks/Newsletter";
import ShopingoBlogSection from "./shopingo/blocks/BlogSection";
import ShopingoCustomHtml from "./shopingo/blocks/CustomHtml";
import ShopingoPageHeader from "./shopingo/blocks/PageHeader";
import ShopingoTextImage from "./shopingo/blocks/TextImage";
import ShopingoContactForm from "./shopingo/blocks/ContactForm";
import ShopingoContactFormInfo from "./shopingo/blocks/ContactFormInfo";
import ShopingoGoogleMap from "./shopingo/blocks/GoogleMap";

// ── Academy blocks ─────────────────────────────────────────────────────────────
import AcademyHeroBanner from "./academy/blocks/HeroBanner";
import AcademyStatsCounter from "./academy/blocks/StatsCounter";
import AcademyAdmissionsSteps from "./academy/blocks/AdmissionsSteps";
import AcademyTimelineSteps from "./academy/blocks/TimelineSteps";
import AcademyAcademicsPrograms from "./academy/blocks/AcademicsPrograms";
import AcademyFacultyGrid from "./academy/blocks/FacultyGrid";
import AcademyPhotoGallery from "./academy/blocks/PhotoGallery";
import AcademyTestimonials from "./academy/blocks/Testimonials";
import AcademyFaqAccordion from "./academy/blocks/FaqAccordion";
import AcademyPricingTiers from "./academy/blocks/PricingTiers";
import AcademyCtaCards from "./academy/blocks/CtaCards";
import AcademyCtaBanner from "./academy/blocks/CtaBanner";
import AcademyContactFormInfo from "./academy/blocks/ContactFormInfo";

// ── Common (fallback) blocks ───────────────────────────────────────────────────
import CommonHeroCarousel from "./common/blocks/HeroCarousel";
import CommonProductGrid from "./common/blocks/ProductGrid";
import CommonProductTabs from "./common/blocks/ProductTabs";
import CommonFeaturesBanner from "./common/blocks/FeaturesBanner";
import CommonPromoBanner from "./common/blocks/PromoBanner";
import CommonBrandCarousel from "./common/blocks/BrandCarousel";
import CommonCategoryGrid from "./common/blocks/CategoryGrid";
import CommonNewsletter from "./common/blocks/Newsletter";
import CommonBlogSection from "./common/blocks/BlogSection";
import CommonCustomHtml from "./common/blocks/CustomHtml";
import CommonPageHeader from "./common/blocks/PageHeader";
import CommonTextImage from "./common/blocks/TextImage";
import CommonContactForm from "./common/blocks/ContactForm";
import CommonContactFormInfo from "./common/blocks/ContactFormInfo";
import CommonGoogleMap from "./common/blocks/GoogleMap";
import CommonHeroBanner from "./common/blocks/HeroBanner";
import CommonStatsCounter from "./common/blocks/StatsCounter";
import CommonAdmissionsSteps from "./common/blocks/AdmissionsSteps";
import CommonTimelineSteps from "./common/blocks/TimelineSteps";
import CommonAcademicsPrograms from "./common/blocks/AcademicsPrograms";
import CommonFacultyGrid from "./common/blocks/FacultyGrid";
import CommonPhotoGallery from "./common/blocks/PhotoGallery";
import CommonTestimonials from "./common/blocks/Testimonials";
import CommonFaqAccordion from "./common/blocks/FaqAccordion";
import CommonPricingTiers from "./common/blocks/PricingTiers";
import CommonCtaCards from "./common/blocks/CtaCards";
import CommonCtaBanner from "./common/blocks/CtaBanner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyBlockComponent = ComponentType<{ data: any; orgId?: string }>;

const COMMON_BLOCKS: Record<BlockType, AnyBlockComponent> = {
  "hero-carousel": CommonHeroCarousel,
  "product-grid": CommonProductGrid,
  "product-tabs": CommonProductTabs,
  "features-banner": CommonFeaturesBanner,
  "promo-banner": CommonPromoBanner,
  "brand-carousel": CommonBrandCarousel,
  "category-grid": CommonCategoryGrid,
  "newsletter": CommonNewsletter,
  "blog-section": CommonBlogSection,
  "custom-html": CommonCustomHtml,
  "page-header": CommonPageHeader,
  "text-image": CommonTextImage,
  "contact-form": CommonContactForm,
  "contact-form-info": CommonContactFormInfo,
  "google-map": CommonGoogleMap,
  "hero-banner": CommonHeroBanner,
  "stats-counter": CommonStatsCounter,
  "admissions-steps": CommonAdmissionsSteps,
  "timeline-steps": CommonTimelineSteps,
  "academics-programs": CommonAcademicsPrograms,
  "faculty-grid": CommonFacultyGrid,
  "photo-gallery": CommonPhotoGallery,
  "testimonials": CommonTestimonials,
  "faq-accordion": CommonFaqAccordion,
  "pricing-tiers": CommonPricingTiers,
  "cta-cards": CommonCtaCards,
  "cta-banner": CommonCtaBanner,
};

const THEME_BLOCKS: Record<string, Partial<Record<BlockType, AnyBlockComponent>>> = {
  shopingo: {
    "hero-carousel": ShopingoHeroCarousel,
    "product-grid": ShopingoProductGrid,
    "product-tabs": ShopingoProductTabs,
    "features-banner": ShopingoFeaturesBanner,
    "promo-banner": ShopingoPromoBanner,
    "brand-carousel": ShopingoBrandCarousel,
    "category-grid": ShopingoCategoryGrid,
    "newsletter": ShopingoNewsletter,
    "blog-section": ShopingoBlogSection,
    "custom-html": ShopingoCustomHtml,
    "page-header": ShopingoPageHeader,
    "text-image": ShopingoTextImage,
    "contact-form": ShopingoContactForm,
    "contact-form-info": ShopingoContactFormInfo,
    "google-map": ShopingoGoogleMap,
  },
  academy: {
    "hero-banner": AcademyHeroBanner,
    "stats-counter": AcademyStatsCounter,
    "admissions-steps": AcademyAdmissionsSteps,
    "timeline-steps": AcademyTimelineSteps,
    "academics-programs": AcademyAcademicsPrograms,
    "faculty-grid": AcademyFacultyGrid,
    "photo-gallery": AcademyPhotoGallery,
    "testimonials": AcademyTestimonials,
    "faq-accordion": AcademyFaqAccordion,
    "pricing-tiers": AcademyPricingTiers,
    "cta-cards": AcademyCtaCards,
    "cta-banner": AcademyCtaBanner,
    "contact-form-info": AcademyContactFormInfo,
  },
};

/** Returns the theme-specific block component, falling back to common. */
export function resolveThemeBlock(
  blockType: BlockType | string,
  themeIdentifier = "shopingo",
): AnyBlockComponent | null {
  const type = blockType as BlockType;
  return THEME_BLOCKS[themeIdentifier]?.[type] ?? COMMON_BLOCKS[type] ?? null;
}
