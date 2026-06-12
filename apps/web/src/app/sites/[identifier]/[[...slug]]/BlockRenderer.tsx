import dynamic from "next/dynamic";
import type { TypedBlock, BlockType } from "@/lib/themes/types";

// Client blocks loaded dynamically (they use hooks / interactivity)
const HeroCarousel = dynamic(() => import("@/lib/themes/shopingo/blocks/HeroCarousel"), { ssr: false });
const ProductTabs = dynamic(() => import("@/lib/themes/shopingo/blocks/ProductTabs"), { ssr: false });
const BrandCarousel = dynamic(() => import("@/lib/themes/shopingo/blocks/BrandCarousel"), { ssr: false });

// Server-renderable blocks imported statically
import ProductGrid from "@/lib/themes/shopingo/blocks/ProductGrid";
import FeaturesBanner from "@/lib/themes/shopingo/blocks/FeaturesBanner";
import PromoBanner from "@/lib/themes/shopingo/blocks/PromoBanner";
import CategoryGrid from "@/lib/themes/shopingo/blocks/CategoryGrid";
import Newsletter from "@/lib/themes/shopingo/blocks/Newsletter";
import BlogSection from "@/lib/themes/shopingo/blocks/BlogSection";
import CustomHtml from "@/lib/themes/shopingo/blocks/CustomHtml";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderBlock(block: TypedBlock, _themeIdentifier: string): React.ReactNode {
  // Future: swap renderers based on themeIdentifier
  switch (block.type as BlockType) {
    case "hero-carousel":
      return <HeroCarousel key={block.id} data={block.data as never} />;
    case "product-grid":
      return <ProductGrid key={block.id} data={block.data as never} />;
    case "product-tabs":
      return <ProductTabs key={block.id} data={block.data as never} />;
    case "features-banner":
      return <FeaturesBanner key={block.id} data={block.data as never} />;
    case "promo-banner":
      return <PromoBanner key={block.id} data={block.data as never} />;
    case "brand-carousel":
      return <BrandCarousel key={block.id} data={block.data as never} />;
    case "category-grid":
      return <CategoryGrid key={block.id} data={block.data as never} />;
    case "newsletter":
      return <Newsletter key={block.id} data={block.data as never} />;
    case "blog-section":
      return <BlogSection key={block.id} data={block.data as never} />;
    case "custom-html":
      return <CustomHtml key={block.id} data={block.data as never} />;
    default:
      return null;
  }
}

export function BlockRenderer({
  blocks,
  themeIdentifier = "shopingo",
}: {
  blocks: TypedBlock[];
  themeIdentifier?: string;
}) {
  if (!blocks.length) return null;
  return (
    <>
      {blocks.map((block) => renderBlock(block, themeIdentifier))}
    </>
  );
}

/** Detect if content JSON is a typed block array (new format) vs legacy EditorNode tree */
export function parseTypedBlocks(content: string | null): TypedBlock[] | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      typeof parsed[0]?.type === "string" &&
      typeof parsed[0]?.id === "string" &&
      "data" in parsed[0]
    ) {
      return parsed as TypedBlock[];
    }
  } catch {
    // not JSON
  }
  return null;
}
