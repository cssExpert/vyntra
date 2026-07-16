import { BLOCK_DEFAULTS } from "./blockDefaults";

// TypedBlock shape (matches parseTypedBlocks + BlockRenderer expectation)
type SeedBlock = { id: string; type: string; data: Record<string, unknown> };

function b(id: string, type: string, data: Record<string, unknown>): SeedBlock {
  return { id, type, data };
}

export const SHOPINGO_PAGE_DEFAULTS: Record<string, SeedBlock[]> = {
  home: [
    b("hc1", "hero-carousel", BLOCK_DEFAULTS["hero-carousel"] as unknown as Record<string, unknown>),
    b("fb1", "features-banner", BLOCK_DEFAULTS["features-banner"] as unknown as Record<string, unknown>),
    b("pt1", "product-tabs", BLOCK_DEFAULTS["product-tabs"] as unknown as Record<string, unknown>),
    b("cg1", "category-grid", BLOCK_DEFAULTS["category-grid"] as unknown as Record<string, unknown>),
    b("pg1", "product-grid", BLOCK_DEFAULTS["product-grid"] as unknown as Record<string, unknown>),
    b("pb1", "promo-banner", BLOCK_DEFAULTS["promo-banner"] as unknown as Record<string, unknown>),
    b("bc1", "brand-carousel", BLOCK_DEFAULTS["brand-carousel"] as unknown as Record<string, unknown>),
    b("bs1", "blog-section", BLOCK_DEFAULTS["blog-section"] as unknown as Record<string, unknown>),
    b("nl1", "newsletter", BLOCK_DEFAULTS["newsletter"] as unknown as Record<string, unknown>),
  ],
  shop: [
    b("ph1", "page-header", {
      ...BLOCK_DEFAULTS["page-header"],
      title: "Shop",
      breadcrumbs: [{ label: "Home", url: "/" }, { label: "Shop", url: "#" }],
    } as unknown as Record<string, unknown>),
    b("pg1", "product-grid", {
      ...BLOCK_DEFAULTS["product-grid"],
      title: "All Products",
    } as unknown as Record<string, unknown>),
    b("nl1", "newsletter", BLOCK_DEFAULTS["newsletter"] as unknown as Record<string, unknown>),
  ],
  "about-us": [
    b("ph1", "page-header", {
      ...BLOCK_DEFAULTS["page-header"],
      title: "About Us",
      breadcrumbs: [{ label: "Home", url: "/" }, { label: "About Us", url: "#" }],
    } as unknown as Record<string, unknown>),
    b("ti1", "text-image", {
      heading: "Our Story",
      paragraphs: [
        "We started with a simple idea — make quality products accessible to everyone. What began as a small operation has grown into a trusted online destination for thousands of happy shoppers worldwide.",
        "Our team works tirelessly to curate the finest products across fashion, electronics, home décor and more. Every item in our catalogue is carefully selected and quality-checked before it reaches you.",
        "Today we ship to over 50 countries and continue to expand our range daily. Whether you are shopping for yourself or looking for the perfect gift, we have something for everyone — at prices that make sense.",
      ],
      image: "",
      imagePosition: "right",
      ctaText: "Shop Now",
      ctaUrl: "/shop",
    } as unknown as Record<string, unknown>),
    b("fb1", "features-banner", {
      features: [
        { icon: "truck", title: "Free Shipping", description: "Free delivery on all orders over $99, anywhere in the world." },
        { icon: "refresh", title: "100% Back Guarantee", description: "Not happy? Return it within 30 days for a full, no-questions refund." },
        { icon: "headphones", title: "Online Support 24/7", description: "Our support team is always available to assist you, day or night." },
      ],
    } as unknown as Record<string, unknown>),
    b("ch1", "custom-html", {
      html: `<section style="background:#f5f5f5;padding:60px 0;">
  <div style="max-width:1100px;margin:0 auto;padding:0 24px;text-align:center;">
    <h2 style="font-size:28px;font-weight:700;color:#212529;margin-bottom:8px;">Meet the Team</h2>
    <p style="color:#636363;font-size:15px;margin-bottom:40px;">The passionate people behind our store.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:28px;">
      <div style="background:#fff;border-radius:12px;padding:28px 20px;box-shadow:0 2px 8px rgba(0,0,0,.06);">
        <div style="width:80px;height:80px;border-radius:50%;background:#e4611e20;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:28px;color:#e4611e;">👤</span>
        </div>
        <h3 style="font-size:16px;font-weight:700;color:#212529;margin:0 0 4px;">Alex Johnson</h3>
        <p style="color:#e4611e;font-size:12px;font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:.5px;">Founder & CEO</p>
        <p style="color:#636363;font-size:13px;line-height:1.6;margin:0;">10+ years in e-commerce, passionate about customer experience.</p>
      </div>
      <div style="background:#fff;border-radius:12px;padding:28px 20px;box-shadow:0 2px 8px rgba(0,0,0,.06);">
        <div style="width:80px;height:80px;border-radius:50%;background:#e4611e20;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:28px;color:#e4611e;">👤</span>
        </div>
        <h3 style="font-size:16px;font-weight:700;color:#212529;margin:0 0 4px;">Sarah Lee</h3>
        <p style="color:#e4611e;font-size:12px;font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:.5px;">Head of Products</p>
        <p style="color:#636363;font-size:13px;line-height:1.6;margin:0;">Curates every product in our catalogue with a meticulous eye for quality.</p>
      </div>
      <div style="background:#fff;border-radius:12px;padding:28px 20px;box-shadow:0 2px 8px rgba(0,0,0,.06);">
        <div style="width:80px;height:80px;border-radius:50%;background:#e4611e20;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:28px;color:#e4611e;">👤</span>
        </div>
        <h3 style="font-size:16px;font-weight:700;color:#212529;margin:0 0 4px;">Michael Chen</h3>
        <p style="color:#e4611e;font-size:12px;font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:.5px;">Customer Success</p>
        <p style="color:#636363;font-size:13px;line-height:1.6;margin:0;">Dedicated to making sure every customer leaves with a smile.</p>
      </div>
    </div>
    <div style="margin-top:52px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:20px;padding:36px;background:#212529;border-radius:14px;">
      <div style="text-align:center;color:#fff;">
        <div style="font-size:36px;font-weight:800;color:#e4611e;">50K+</div>
        <div style="font-size:13px;color:#aaa;margin-top:4px;">Happy Customers</div>
      </div>
      <div style="text-align:center;color:#fff;">
        <div style="font-size:36px;font-weight:800;color:#e4611e;">10K+</div>
        <div style="font-size:13px;color:#aaa;margin-top:4px;">Products</div>
      </div>
      <div style="text-align:center;color:#fff;">
        <div style="font-size:36px;font-weight:800;color:#e4611e;">50+</div>
        <div style="font-size:13px;color:#aaa;margin-top:4px;">Countries</div>
      </div>
      <div style="text-align:center;color:#fff;">
        <div style="font-size:36px;font-weight:800;color:#e4611e;">8</div>
        <div style="font-size:13px;color:#aaa;margin-top:4px;">Years Online</div>
      </div>
    </div>
  </div>
</section>`,
    } as unknown as Record<string, unknown>),
    b("bc1", "brand-carousel", {
      title: "Shop By Brands",
      brands: [
        { name: "Nike", logo: "", url: "/shop?brand=nike" },
        { name: "Adidas", logo: "", url: "/shop?brand=adidas" },
        { name: "Apple", logo: "", url: "/shop?brand=apple" },
        { name: "Samsung", logo: "", url: "/shop?brand=samsung" },
        { name: "Puma", logo: "", url: "/shop?brand=puma" },
        { name: "Sony", logo: "", url: "/shop?brand=sony" },
        { name: "Reebok", logo: "", url: "/shop?brand=reebok" },
        { name: "H&M", logo: "", url: "/shop?brand=hm" },
        { name: "Zara", logo: "", url: "/shop?brand=zara" },
        { name: "Philips", logo: "", url: "/shop?brand=philips" },
      ],
    } as unknown as Record<string, unknown>),
    b("nl1", "newsletter", {
      title: "Stay Connected",
      subtitle: "Join our community and get exclusive member-only offers.",
      placeholder: "Your email address",
      buttonText: "Join Now",
    } as unknown as Record<string, unknown>),
  ],
  "contact-us": [
    b("ph1", "page-header", {
      ...BLOCK_DEFAULTS["page-header"],
      title: "Contact Us",
      breadcrumbs: [{ label: "Home", url: "/" }, { label: "Contact Us", url: "#" }],
    } as unknown as Record<string, unknown>),
    b("fb1", "features-banner", BLOCK_DEFAULTS["features-banner"] as unknown as Record<string, unknown>),
    b("cfi1", "contact-form-info", BLOCK_DEFAULTS["contact-form-info"] as unknown as Record<string, unknown>),
    b("gm1", "google-map", BLOCK_DEFAULTS["google-map"] as unknown as Record<string, unknown>),
  ],
  blog: [
    b("ph1", "page-header", {
      ...BLOCK_DEFAULTS["page-header"],
      title: "Blog",
      breadcrumbs: [{ label: "Home", url: "/" }, { label: "Blog", url: "#" }],
    } as unknown as Record<string, unknown>),
    b("bs1", "blog-section", BLOCK_DEFAULTS["blog-section"] as unknown as Record<string, unknown>),
    b("nl1", "newsletter", BLOCK_DEFAULTS["newsletter"] as unknown as Record<string, unknown>),
  ],
};

// Registry: theme identifier → page defaults map
const THEME_PAGE_DEFAULTS: Record<string, Record<string, SeedBlock[]>> = {
  shopingo: SHOPINGO_PAGE_DEFAULTS,
};

export function getThemePageDefaults(themeIdentifier: string): Record<string, SeedBlock[]> {
  return THEME_PAGE_DEFAULTS[themeIdentifier.toLowerCase()] ?? {};
}
