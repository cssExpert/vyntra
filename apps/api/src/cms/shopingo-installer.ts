// Default Shopingo page/menu/layout definitions — installed on demand via POST /cms/themes/shopingo/install

export interface InstallPageDef {
  slug: string;
  title: string;
  metaDesc: string;
  isLandingPage: boolean;
  blocks: object[];
}

export interface InstallMenuItemDef {
  label: string;
  url: string;
  target: string;
  order: number;
}

export interface InstallMenuDef {
  slug: string;
  name: string;
  menuType: string;
  role: string; // 'nav' | 'footer-col'
  items: InstallMenuItemDef[];
}

export interface InstallLayoutDef {
  name: string;
  navMenuSlug: string;
  footerColumns: { title: string; menuSlug: string }[];
}

// ── Menu definitions ─────────────────────────────────────────────────────────

export const SHOPINGO_MENUS: InstallMenuDef[] = [
  {
    slug: 'shopingo-nav',
    name: 'Main Navigation',
    menuType: 'navigation',
    role: 'nav',
    items: [
      { label: 'Home',       url: '/',           target: '_self', order: 0 },
      { label: 'Shop',       url: '/shop',        target: '_self', order: 1 },
      { label: 'About Us',   url: '/about-us',    target: '_self', order: 2 },
      { label: 'Blog',       url: '/blog',        target: '_self', order: 3 },
      { label: 'Contact Us', url: '/contact-us',  target: '_self', order: 4 },
    ],
  },
  {
    slug: 'shopingo-company',
    name: 'Company',
    menuType: 'footer',
    role: 'footer-col',
    items: [
      { label: 'About Us',       url: '/about-us',    target: '_self', order: 0 },
      { label: 'Contact Us',     url: '/contact-us',  target: '_self', order: 1 },
      { label: 'Careers',        url: '#',            target: '_self', order: 2 },
      { label: 'Press & Media',  url: '#',            target: '_self', order: 3 },
      { label: 'Privacy Policy', url: '#',            target: '_self', order: 4 },
      { label: 'Terms of Service', url: '#',          target: '_self', order: 5 },
    ],
  },
  {
    slug: 'shopingo-support',
    name: 'Customer Service',
    menuType: 'footer',
    role: 'footer-col',
    items: [
      { label: 'FAQ',               url: '#',            target: '_self', order: 0 },
      { label: 'Shipping & Returns', url: '#',           target: '_self', order: 1 },
      { label: 'Track Your Order',  url: '#',            target: '_self', order: 2 },
      { label: 'Size Guide',        url: '#',            target: '_self', order: 3 },
      { label: 'Contact Support',   url: '/contact-us',  target: '_self', order: 4 },
      { label: 'Live Chat',         url: '#',            target: '_self', order: 5 },
    ],
  },
  {
    slug: 'shopingo-links',
    name: 'Quick Links',
    menuType: 'footer',
    role: 'footer-col',
    items: [
      { label: 'Home',         url: '/',                    target: '_self', order: 0 },
      { label: 'Shop All',     url: '/shop',                target: '_self', order: 1 },
      { label: 'New Arrivals', url: '/shop?filter=new',     target: '_self', order: 2 },
      { label: 'Sale',         url: '/shop?filter=sale',    target: '_self', order: 3 },
      { label: 'Gift Cards',   url: '#',                    target: '_self', order: 4 },
      { label: 'Store Locator', url: '#',                   target: '_self', order: 5 },
    ],
  },
];

export const SHOPINGO_LAYOUT: InstallLayoutDef = {
  name: 'Shopingo',
  navMenuSlug: 'shopingo-nav',
  footerColumns: [
    { title: 'Company',          menuSlug: 'shopingo-company' },
    { title: 'Customer Service', menuSlug: 'shopingo-support' },
    { title: 'Quick Links',      menuSlug: 'shopingo-links' },
  ],
};

function id(s: string) { return s; }

export const SHOPINGO_PAGES: InstallPageDef[] = [

  // ── Home ─────────────────────────────────────────────────────────────────────
  {
    slug: 'home',
    title: 'Home',
    metaDesc: 'Welcome to our online store — discover the best deals and latest arrivals.',
    isLandingPage: true,
    blocks: [
      // 1. Hero Carousel — 5 slides matching Shopingo demo
      {
        id: id('blk-hero'),
        type: 'hero-carousel',
        data: {
          autoPlayMs: 5000,
          slides: [
            {
              title: "Women's Fashion — 25% Off",
              subtitle: 'Explore our exclusive collection of women\'s wear at unbeatable prices.',
              badge: '25% Off',
              ctaText: 'Shop Now',
              ctaUrl: '/shop?cat=women',
              image: '',
            },
            {
              title: 'Fashion Wear — 35% Off',
              subtitle: 'Stay stylish this season with our curated fashion collection.',
              badge: '35% Off',
              ctaText: 'Browse Deals',
              ctaUrl: '/shop?cat=fashion',
              image: '',
            },
            {
              title: "Kids' Fashion — 15% Off",
              subtitle: 'Adorable, comfortable and durable clothes for your little ones.',
              badge: '15% Off',
              ctaText: 'Shop Kids',
              ctaUrl: '/shop?cat=kids',
              image: '',
            },
            {
              title: 'Electronics — 45% Off',
              subtitle: 'Top-rated gadgets, headphones, smart devices and more.',
              badge: '45% Off',
              ctaText: 'Shop Electronics',
              ctaUrl: '/shop?cat=electronics',
              image: '',
            },
            {
              title: 'Home Furniture — 24% Off',
              subtitle: 'Transform your living space with our premium furniture collection.',
              badge: '24% Off',
              ctaText: 'Shop Furniture',
              ctaUrl: '/shop?cat=furniture',
              image: '',
            },
          ],
        },
      },

      // 2. Features Banner — Free Delivery, Secure Payment, Free Returns, 24/7 Support
      {
        id: id('blk-features'),
        type: 'features-banner',
        data: {
          features: [
            { icon: 'truck',      title: 'Free Delivery',   description: 'Free shipping on all orders over $99' },
            { icon: 'shield',     title: 'Secure Payment',  description: '100% secure and encrypted transactions' },
            { icon: 'refresh',    title: 'Free Returns',    description: 'Hassle-free 30-day return policy' },
            { icon: 'headphones', title: '24/7 Support',    description: 'Round-the-clock dedicated customer support' },
          ],
        },
      },

      // 3. Featured Products — product grid (8 products)
      {
        id: id('blk-featured'),
        type: 'product-grid',
        data: {
          title: 'Featured Products',
          subtitle: 'Hand-picked products just for you',
          products: [
            { id: 'fp1', name: 'Wireless Headphones Pro',    price: 49.00, originalPrice: 89.99,  image: '', badge: 'Featured', rating: 5 },
            { id: 'fp2', name: 'Running Sneakers X2',        price: 49.00, originalPrice: 79.99,  image: '', badge: 'Featured', rating: 4 },
            { id: 'fp3', name: 'Smart Watch Series 5',       price: 49.00, originalPrice: 99.99,  image: '', badge: 'Featured', rating: 5 },
            { id: 'fp4', name: 'Cotton Crew Tee',            price: 49.00,                        image: '', rating: 4 },
            { id: 'fp5', name: 'Leather Wallet',             price: 49.00,                        image: '', rating: 4 },
            { id: 'fp6', name: 'Portable Bluetooth Speaker', price: 49.00, originalPrice: 79.99,  image: '', badge: 'Hot', rating: 5 },
            { id: 'fp7', name: 'Denim Jacket Classic',       price: 49.00,                        image: '', badge: 'Popular', rating: 5 },
            { id: 'fp8', name: 'Yoga Mat Premium',           price: 49.00,                        image: '', rating: 4 },
          ],
        },
      },

      // 4. Latest Products — 4 tabs: New Arrival, Best Seller, Trending, Special Offer
      {
        id: id('blk-tabs'),
        type: 'product-tabs',
        data: {
          tabs: [
            {
              label: 'New Arrival',
              products: [
                { id: 'na1', name: 'Wireless Headphones Pro',  price: 49.00, originalPrice: 89.99, image: '', badge: 'New Season', rating: 5 },
                { id: 'na2', name: 'Running Sneakers X2',      price: 49.00, originalPrice: 79.99, image: '', badge: 'New Season', rating: 4 },
                { id: 'na3', name: 'Smart Watch Series 5',     price: 49.00, originalPrice: 99.99, image: '', badge: 'New',        rating: 5 },
                { id: 'na4', name: 'Cotton Crew Tee',          price: 49.00,                       image: '', rating: 4 },
                { id: 'na5', name: 'Leather Wallet',           price: 49.00,                       image: '', rating: 4 },
              ],
            },
            {
              label: 'Best Seller',
              products: [
                { id: 'bs1', name: 'Portable Bluetooth Speaker', price: 49.00, originalPrice: 79.99, image: '', badge: 'Hot',     rating: 5 },
                { id: 'bs2', name: 'Denim Jacket Classic',       price: 49.00,                       image: '', badge: 'Popular', rating: 5 },
                { id: 'bs3', name: 'Yoga Mat Premium',           price: 49.00,                       image: '', rating: 4 },
                { id: 'bs4', name: 'Stainless Steel Bottle',     price: 49.00,                       image: '', rating: 5 },
                { id: 'bs5', name: 'Desk Organiser Set',         price: 49.00,                       image: '', rating: 4 },
              ],
            },
            {
              label: 'Trending',
              products: [
                { id: 'tr1', name: 'USB-C Hub 7-in-1',     price: 49.00, originalPrice: 89.99, image: '', badge: 'Trending', rating: 4 },
                { id: 'tr2', name: 'Canvas Tote Bag',       price: 49.00,                       image: '', badge: 'Trending', rating: 4 },
                { id: 'tr3', name: 'Sunglasses UV400',      price: 49.00, originalPrice: 79.99, image: '', badge: 'Trending', rating: 5 },
                { id: 'tr4', name: 'Casual Polo Shirt',     price: 49.00,                       image: '', rating: 4 },
                { id: 'tr5', name: 'Kitchen Knife Set',     price: 49.00, originalPrice: 89.99, image: '', rating: 5 },
              ],
            },
            {
              label: 'Special Offer',
              products: [
                { id: 'so1', name: 'Casual Polo Shirt',  price: 14.99, originalPrice: 49.00, image: '', badge: '50% Discount', rating: 4 },
                { id: 'so2', name: 'Kitchen Knife Set',  price: 24.99, originalPrice: 49.00, image: '', badge: '50% Discount', rating: 5 },
                { id: 'so3', name: 'USB-C Hub 7-in-1',  price: 19.99, originalPrice: 49.00, image: '', badge: '50% Discount', rating: 4 },
                { id: 'so4', name: 'Canvas Tote Bag',   price: 12.99, originalPrice: 49.00, image: '', badge: '50% Discount', rating: 4 },
                { id: 'so5', name: 'Sunglasses UV400',  price: 17.99, originalPrice: 49.00, image: '', badge: '50% Discount', rating: 5 },
              ],
            },
          ],
        },
      },

      // 5. Promo Banner — promotional content zone
      {
        id: id('blk-promo'),
        type: 'promo-banner',
        data: {
          title: 'Summer Essentials Collection',
          subtitle: 'New Season',
          description: 'From beachwear to garden furniture — everything you need for the perfect summer, all in one place.',
          primaryCtaText: 'Buy Now',
          primaryCtaUrl: '/shop',
          secondaryCtaText: 'View Details',
          secondaryCtaUrl: '/blog',
          image: '',
          badge: 'Summer 2026',
        },
      },

      // 6. Brand Carousel — Shop By Brands (10 brands)
      {
        id: id('blk-brands'),
        type: 'brand-carousel',
        data: {
          title: 'Shop By Brands',
          brands: [
            { name: 'Nike',     logo: '', url: '/shop?brand=nike' },
            { name: 'Adidas',   logo: '', url: '/shop?brand=adidas' },
            { name: 'Apple',    logo: '', url: '/shop?brand=apple' },
            { name: 'Samsung',  logo: '', url: '/shop?brand=samsung' },
            { name: 'Puma',     logo: '', url: '/shop?brand=puma' },
            { name: 'Sony',     logo: '', url: '/shop?brand=sony' },
            { name: 'Reebok',   logo: '', url: '/shop?brand=reebok' },
            { name: 'H&M',      logo: '', url: '/shop?brand=hm' },
            { name: 'Zara',     logo: '', url: '/shop?brand=zara' },
            { name: 'Philips',  logo: '', url: '/shop?brand=philips' },
          ],
        },
      },

      // 7. Category Grid — Top Categories (matching Shopingo demo)
      {
        id: id('blk-cats'),
        type: 'category-grid',
        data: {
          title: 'Top Categories',
          categories: [
            { name: 'Kurtas',  image: '', count: 128, url: '/shop?cat=kurtas' },
            { name: 'Heels',   image: '', count: 96,  url: '/shop?cat=heels' },
            { name: 'Lehenga', image: '', count: 74,  url: '/shop?cat=lehenga' },
            { name: 'Plazzos', image: '', count: 83,  url: '/shop?cat=plazzos' },
            { name: 'Makeup',  image: '', count: 210, url: '/shop?cat=makeup' },
            { name: 'Shoes',   image: '', count: 187, url: '/shop?cat=shoes' },
          ],
        },
      },

      // 8. Newsletter
      {
        id: id('blk-newsletter'),
        type: 'newsletter',
        data: {
          title: 'Get Exclusive Deals',
          subtitle: 'Subscribe to our newsletter and be the first to know about sales, new arrivals and special offers.',
          placeholder: 'Enter your email address',
          buttonText: 'Subscribe',
        },
      },

      // 9. Blog Section — 3 cards
      {
        id: id('blk-blog'),
        type: 'blog-section',
        data: {
          title: 'From Our Blog',
          subtitle: 'Tips, guides and inspiration',
          posts: [
            {
              id: 'b1',
              title: 'Top 10 Tech Gadgets of 2026',
              excerpt: 'Discover the must-have gadgets that are changing the way we work, play and stay connected this year.',
              image: '',
              author: 'Admin',
              date: 'June 12, 2026',
              slug: 'top-10-tech-gadgets-2026',
            },
            {
              id: 'b2',
              title: 'Summer Fashion Trends You Need to Know',
              excerpt: 'From bold prints to relaxed silhouettes — here is what is ruling the runways and streets this summer.',
              image: '',
              author: 'Admin',
              date: 'June 8, 2026',
              slug: 'summer-fashion-trends-2026',
            },
            {
              id: 'b3',
              title: 'How to Set Up the Perfect Home Office',
              excerpt: 'A practical guide to ergonomic furniture, lighting, and accessories for a productive workspace at home.',
              image: '',
              author: 'Admin',
              date: 'June 3, 2026',
              slug: 'perfect-home-office-setup',
            },
          ],
        },
      },
    ],
  },

  // ── About Us ──────────────────────────────────────────────────────────────────
  {
    slug: 'about-us',
    title: 'About Us',
    metaDesc: 'Learn about our story, values and the team behind our online store.',
    isLandingPage: false,
    blocks: [
      // 1. Page Header — breadcrumb banner
      {
        id: id('about-header'),
        type: 'page-header',
        data: {
          title: 'About Us',
          breadcrumbs: [
            { label: 'Home', url: '/' },
            { label: 'Pages', url: '#' },
            { label: 'About Us', url: '/about-us' },
          ],
        },
      },

      // 2. Our Story — text + image
      {
        id: id('about-story'),
        type: 'text-image',
        data: {
          heading: 'Our Story',
          paragraphs: [
            'We started with a simple idea — make quality products accessible to everyone. What began as a small operation has grown into a trusted online destination for thousands of happy shoppers worldwide.',
            'Our team works tirelessly to curate the finest products across fashion, electronics, home décor and more. Every item in our catalogue is carefully selected and quality-checked before it reaches you.',
            'Today we ship to over 50 countries and continue to expand our range daily. Whether you are shopping for yourself or looking for the perfect gift, we have something for everyone — at prices that make sense.',
          ],
          image: '',
          imagePosition: 'right',
          ctaText: 'Shop Now',
          ctaUrl: '/shop',
        },
      },

      // 3. Why Choose Us — 3 feature cards
      {
        id: id('about-why'),
        type: 'features-banner',
        data: {
          features: [
            { icon: 'truck',   title: 'Free Shipping',        description: 'Free delivery on all orders over $99, anywhere in the world.' },
            { icon: 'refresh', title: '100% Back Guarantee',  description: 'Not happy? Return it within 30 days for a full, no-questions refund.' },
            { icon: 'headphones', title: 'Online Support 24/7', description: 'Our support team is always available to assist you, day or night.' },
          ],
        },
      },

      // 4. Meet the Team — custom styled section
      {
        id: id('about-team'),
        type: 'custom-html',
        data: {
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
        },
      },

      // 5. Shop By Brands
      {
        id: id('about-brands'),
        type: 'brand-carousel',
        data: {
          title: 'Shop By Brands',
          brands: [
            { name: 'Nike',     logo: '', url: '/shop?brand=nike' },
            { name: 'Adidas',   logo: '', url: '/shop?brand=adidas' },
            { name: 'Apple',    logo: '', url: '/shop?brand=apple' },
            { name: 'Samsung',  logo: '', url: '/shop?brand=samsung' },
            { name: 'Puma',     logo: '', url: '/shop?brand=puma' },
            { name: 'Sony',     logo: '', url: '/shop?brand=sony' },
            { name: 'Reebok',   logo: '', url: '/shop?brand=reebok' },
            { name: 'H&M',      logo: '', url: '/shop?brand=hm' },
            { name: 'Zara',     logo: '', url: '/shop?brand=zara' },
            { name: 'Philips',  logo: '', url: '/shop?brand=philips' },
          ],
        },
      },

      // 6. Newsletter
      {
        id: id('about-newsletter'),
        type: 'newsletter',
        data: {
          title: 'Stay Connected',
          subtitle: 'Join our community and get exclusive member-only offers.',
          placeholder: 'Your email address',
          buttonText: 'Join Now',
        },
      },
    ],
  },

  // ── Contact Us ────────────────────────────────────────────────────────────────
  {
    slug: 'contact-us',
    title: 'Contact Us',
    metaDesc: 'Get in touch with our team. We are here to help with orders, products and anything else.',
    isLandingPage: false,
    blocks: [
      // 1. Page Header — breadcrumb banner
      {
        id: id('contact-header'),
        type: 'page-header',
        data: {
          title: 'Contact Us',
          breadcrumbs: [
            { label: 'Home', url: '/' },
            { label: 'Pages', url: '#' },
            { label: 'Contact Us', url: '/contact-us' },
          ],
        },
      },

      // 2. Contact Form — form + info panel + business hours
      {
        id: id('contact-form'),
        type: 'contact-form',
        data: {
          formTitle: 'Drop Us a Line',
          formSubtitle: 'Fill out the form below and we will get back to you as soon as possible.',
          infoTitle: 'Find Us',
          address: '123 Street Name\nCity, Australia',
          phone: '+1 (800) 123-4567',
          email: 'mail@example.com',
          hours: [
            { day: 'Monday – Friday', time: '9:30 AM – 6:30 PM' },
            { day: 'Saturday',        time: '10:00 AM – 4:00 PM' },
            { day: 'Sunday',          time: 'Closed' },
          ],
          mapEmbedUrl: '',
          subjects: [
            'Order Inquiry',
            'Return & Refund',
            'Product Question',
            'Partnership',
            'Other',
          ],
        },
      },

      // 3. Why Choose Us — feature cards
      {
        id: id('contact-why'),
        type: 'features-banner',
        data: {
          features: [
            { icon: 'truck',      title: 'Fast Shipping',    description: 'Most orders shipped within 24 hours of placement.' },
            { icon: 'refresh',    title: 'Easy Returns',     description: 'Hassle-free 30-day return policy on all products.' },
            { icon: 'shield',     title: 'Secure Shopping',  description: 'Your data and payments are always safe with us.' },
            { icon: 'headphones', title: 'Live Support',     description: 'Chat with our support team any time, any day.' },
          ],
        },
      },
    ],
  },

  // ── Shop ──────────────────────────────────────────────────────────────────────
  {
    slug: 'shop',
    title: 'Shop',
    metaDesc: 'Browse our full collection of products. New arrivals added daily.',
    isLandingPage: false,
    blocks: [
      {
        id: id('shop-header'),
        type: 'page-header',
        data: {
          title: 'Shop',
          breadcrumbs: [
            { label: 'Home', url: '/' },
            { label: 'Shop', url: '/shop' },
          ],
        },
      },
      {
        id: id('shop-cats'),
        type: 'category-grid',
        data: {
          title: 'All Categories',
          categories: [
            { name: 'Electronics',     image: '', count: 248, url: '/shop?cat=electronics' },
            { name: 'Fashion',         image: '', count: 512, url: '/shop?cat=fashion' },
            { name: 'Home & Garden',   image: '', count: 189, url: '/shop?cat=home' },
            { name: 'Sports & Outdoor', image: '', count: 134, url: '/shop?cat=sports' },
            { name: 'Beauty & Health', image: '', count: 97,  url: '/shop?cat=beauty' },
            { name: 'Toys & Games',    image: '', count: 76,  url: '/shop?cat=toys' },
          ],
        },
      },
      {
        id: id('shop-grid'),
        type: 'product-grid',
        data: {
          title: 'All Products',
          subtitle: 'Discover our full range of products',
          products: [
            { id: 'sp1', name: 'Wireless Headphones Pro',    price: 79.99, originalPrice: 129.99, image: '', badge: 'Sale',    rating: 5 },
            { id: 'sp2', name: 'Running Sneakers X2',        price: 54.99, originalPrice: 89.99,  image: '', badge: 'Sale',    rating: 4 },
            { id: 'sp3', name: 'Smart Watch Series 5',       price: 149.99,                       image: '', rating: 5 },
            { id: 'sp4', name: 'Portable Bluetooth Speaker', price: 49.99, originalPrice: 79.99,  image: '', badge: 'Hot',     rating: 5 },
            { id: 'sp5', name: 'Denim Jacket Classic',       price: 69.99,                        image: '', badge: 'Popular', rating: 5 },
            { id: 'sp6', name: 'Yoga Mat Premium',           price: 29.99,                        image: '', rating: 4 },
            { id: 'sp7', name: 'Stainless Steel Bottle',     price: 19.99,                        image: '', rating: 5 },
            { id: 'sp8', name: 'USB-C Hub 7-in-1',          price: 24.99, originalPrice: 49.99,  image: '', badge: 'Sale',    rating: 4 },
            { id: 'sp9', name: 'Desk Organiser Set',         price: 39.99,                        image: '', rating: 4 },
            { id: 'sp10', name: 'Cotton Crew Tee',           price: 24.99,                        image: '', rating: 4 },
          ],
        },
      },
      {
        id: id('shop-newsletter'),
        type: 'newsletter',
        data: {
          title: 'Never Miss a Deal',
          subtitle: 'Subscribe and get exclusive discounts straight to your inbox.',
          placeholder: 'Enter your email',
          buttonText: 'Subscribe',
        },
      },
    ],
  },

  // ── Blog ──────────────────────────────────────────────────────────────────────
  {
    slug: 'blog',
    title: 'Blog',
    metaDesc: 'Tips, trends and product guides from our team of experts.',
    isLandingPage: false,
    blocks: [
      {
        id: id('blog-header'),
        type: 'page-header',
        data: {
          title: 'Our Blog',
          breadcrumbs: [
            { label: 'Home', url: '/' },
            { label: 'Blog', url: '/blog' },
          ],
        },
      },
      {
        id: id('blog-main'),
        type: 'blog-section',
        data: {
          title: 'Latest Articles',
          subtitle: 'Expert advice, style guides and the latest news',
          posts: [
            {
              id: 'b1',
              title: 'Top 10 Tech Gadgets of 2026',
              excerpt: 'Discover the must-have gadgets that are changing the way we work, play and stay connected this year.',
              image: '',
              author: 'Admin',
              date: 'June 12, 2026',
              slug: 'top-10-tech-gadgets-2026',
            },
            {
              id: 'b2',
              title: 'Summer Fashion Trends You Need to Know',
              excerpt: 'From bold prints to relaxed silhouettes — here is what is ruling the runways and streets this summer.',
              image: '',
              author: 'Admin',
              date: 'June 8, 2026',
              slug: 'summer-fashion-trends-2026',
            },
            {
              id: 'b3',
              title: 'How to Set Up the Perfect Home Office',
              excerpt: 'A practical guide to ergonomic furniture, lighting, and accessories for a productive workspace at home.',
              image: '',
              author: 'Admin',
              date: 'June 3, 2026',
              slug: 'perfect-home-office-setup',
            },
            {
              id: 'b4',
              title: 'The Ultimate Skincare Routine for 2026',
              excerpt: 'Dermatologist-approved steps and product picks for radiant, healthy skin all year round.',
              image: '',
              author: 'Admin',
              date: 'May 28, 2026',
              slug: 'ultimate-skincare-routine-2026',
            },
            {
              id: 'b5',
              title: 'Best Kitchen Tools for Home Chefs',
              excerpt: 'From air fryers to smart scales — we tested the top kitchen gadgets so you don\'t have to.',
              image: '',
              author: 'Admin',
              date: 'May 20, 2026',
              slug: 'best-kitchen-tools-home-chefs',
            },
            {
              id: 'b6',
              title: '5 Ways to Stay Active Without a Gym',
              excerpt: 'Simple, effective workout ideas you can do at home or outdoors with minimal equipment.',
              image: '',
              author: 'Admin',
              date: 'May 15, 2026',
              slug: '5-ways-stay-active-without-gym',
            },
          ],
        },
      },
      {
        id: id('blog-newsletter'),
        type: 'newsletter',
        data: {
          title: 'Get Articles in Your Inbox',
          subtitle: 'New posts every week — no spam, ever.',
          placeholder: 'Your email address',
          buttonText: 'Subscribe',
        },
      },
    ],
  },
];
