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
      { label: 'Home', url: '/', target: '_self', order: 0 },
      { label: 'Shop', url: '/shop', target: '_self', order: 1 },
      { label: 'About Us', url: '/about-us', target: '_self', order: 2 },
      { label: 'Blog', url: '/blog', target: '_self', order: 3 },
      { label: 'Contact Us', url: '/contact-us', target: '_self', order: 4 },
    ],
  },
  {
    slug: 'shopingo-company',
    name: 'Company',
    menuType: 'footer',
    role: 'footer-col',
    items: [
      { label: 'About Us', url: '/about-us', target: '_self', order: 0 },
      { label: 'Contact Us', url: '/contact-us', target: '_self', order: 1 },
      { label: 'Careers', url: '#', target: '_self', order: 2 },
      { label: 'Press & Media', url: '#', target: '_self', order: 3 },
      { label: 'Privacy Policy', url: '#', target: '_self', order: 4 },
      { label: 'Terms of Service', url: '#', target: '_self', order: 5 },
    ],
  },
  {
    slug: 'shopingo-support',
    name: 'Customer Service',
    menuType: 'footer',
    role: 'footer-col',
    items: [
      { label: 'FAQ', url: '#', target: '_self', order: 0 },
      { label: 'Shipping & Returns', url: '#', target: '_self', order: 1 },
      { label: 'Track Your Order', url: '#', target: '_self', order: 2 },
      { label: 'Size Guide', url: '#', target: '_self', order: 3 },
      { label: 'Contact Support', url: '/contact-us', target: '_self', order: 4 },
      { label: 'Live Chat', url: '#', target: '_self', order: 5 },
    ],
  },
  {
    slug: 'shopingo-links',
    name: 'Quick Links',
    menuType: 'footer',
    role: 'footer-col',
    items: [
      { label: 'Home', url: '/', target: '_self', order: 0 },
      { label: 'Shop All', url: '/shop', target: '_self', order: 1 },
      { label: 'New Arrivals', url: '/shop?filter=new', target: '_self', order: 2 },
      { label: 'Sale', url: '/shop?filter=sale', target: '_self', order: 3 },
      { label: 'Gift Cards', url: '#', target: '_self', order: 4 },
      { label: 'Store Locator', url: '#', target: '_self', order: 5 },
    ],
  },
];

export const SHOPINGO_LAYOUT: InstallLayoutDef = {
  name: 'Shopingo',
  navMenuSlug: 'shopingo-nav',
  footerColumns: [
    { title: 'Company', menuSlug: 'shopingo-company' },
    { title: 'Customer Service', menuSlug: 'shopingo-support' },
    { title: 'Quick Links', menuSlug: 'shopingo-links' },
  ],
};

function id(s: string) { return s; }

export const SHOPINGO_PAGES: InstallPageDef[] = [
  // ── Home ──────────────────────────────────────────────────────────────────
  {
    slug: 'home',
    title: 'Home',
    metaDesc: 'Welcome to our online store — discover the best deals and latest arrivals.',
    isLandingPage: true,
    blocks: [
      {
        id: id('blk-hero'),
        type: 'hero-carousel',
        data: {
          autoPlayMs: 5000,
          slides: [
            {
              title: 'New Season — Up to 50% Off',
              subtitle: 'Explore the latest collection of fashion, electronics, and home essentials.',
              badge: 'Limited Time',
              ctaText: 'Shop Now',
              ctaUrl: '/shop',
              image: '',
            },
            {
              title: 'Top Brands, Best Prices',
              subtitle: 'Shop from thousands of trusted brands at unbeatable prices.',
              badge: 'Hot Deals',
              ctaText: 'Browse Deals',
              ctaUrl: '/shop',
              image: '',
            },
            {
              title: 'Free Shipping on Orders $99+',
              subtitle: 'Fast, reliable delivery right to your doorstep.',
              badge: 'Free Shipping',
              ctaText: 'Start Shopping',
              ctaUrl: '/shop',
              image: '',
            },
          ],
        },
      },
      {
        id: id('blk-features'),
        type: 'features-banner',
        data: {
          features: [
            { icon: 'truck', title: 'Free Shipping', description: 'On all orders over $99' },
            { icon: 'shield', title: 'Secure Payment', description: '100% secure transactions' },
            { icon: 'refresh', title: 'Easy Returns', description: '30-day hassle-free returns' },
            { icon: 'headphones', title: '24/7 Support', description: 'Round-the-clock help' },
          ],
        },
      },
      {
        id: id('blk-cats'),
        type: 'category-grid',
        data: {
          title: 'Shop by Category',
          categories: [
            { name: 'Electronics', image: '', count: 248, url: '/shop?cat=electronics' },
            { name: 'Fashion', image: '', count: 512, url: '/shop?cat=fashion' },
            { name: 'Home & Garden', image: '', count: 189, url: '/shop?cat=home' },
            { name: 'Sports', image: '', count: 134, url: '/shop?cat=sports' },
            { name: 'Beauty', image: '', count: 97, url: '/shop?cat=beauty' },
            { name: 'Toys', image: '', count: 76, url: '/shop?cat=toys' },
          ],
        },
      },
      {
        id: id('blk-tabs'),
        type: 'product-tabs',
        data: {
          tabs: [
            {
              label: 'New Arrivals',
              products: [
                { id: 'p1', name: 'Wireless Headphones Pro', price: 79.99, originalPrice: 129.99, image: '', badge: 'New', rating: 5 },
                { id: 'p2', name: 'Running Sneakers X2', price: 54.99, originalPrice: 89.99, image: '', badge: 'New', rating: 4 },
                { id: 'p3', name: 'Smart Watch Series 5', price: 149.99, image: '', rating: 5 },
                { id: 'p4', name: 'Cotton Crew Tee', price: 24.99, image: '', rating: 4 },
                { id: 'p5', name: 'Leather Wallet', price: 34.99, image: '', rating: 4 },
              ],
            },
            {
              label: 'Best Sellers',
              products: [
                { id: 'p6', name: 'Portable Bluetooth Speaker', price: 49.99, originalPrice: 79.99, image: '', badge: 'Hot', rating: 5 },
                { id: 'p7', name: 'Denim Jacket Classic', price: 69.99, image: '', badge: 'Popular', rating: 5 },
                { id: 'p8', name: 'Yoga Mat Premium', price: 29.99, image: '', rating: 4 },
                { id: 'p9', name: 'Stainless Steel Bottle', price: 19.99, image: '', rating: 5 },
                { id: 'p10', name: 'Desk Organiser Set', price: 39.99, image: '', rating: 4 },
              ],
            },
            {
              label: 'On Sale',
              products: [
                { id: 'p11', name: 'Casual Polo Shirt', price: 14.99, originalPrice: 34.99, image: '', badge: '57% Off', rating: 4 },
                { id: 'p12', name: 'Kitchen Knife Set', price: 44.99, originalPrice: 99.99, image: '', badge: '55% Off', rating: 5 },
                { id: 'p13', name: 'USB-C Hub 7-in-1', price: 24.99, originalPrice: 49.99, image: '', badge: '50% Off', rating: 4 },
                { id: 'p14', name: 'Canvas Tote Bag', price: 9.99, originalPrice: 24.99, image: '', badge: '60% Off', rating: 4 },
                { id: 'p15', name: 'Sunglasses UV400', price: 19.99, originalPrice: 44.99, image: '', badge: '55% Off', rating: 5 },
              ],
            },
          ],
        },
      },
      {
        id: id('blk-promo'),
        type: 'promo-banner',
        data: {
          title: 'Summer Essentials Collection',
          subtitle: 'New Season',
          description: 'From beachwear to garden furniture — everything you need for the perfect summer, all in one place.',
          primaryCtaText: 'Shop Collection',
          primaryCtaUrl: '/shop',
          secondaryCtaText: 'View Lookbook',
          secondaryCtaUrl: '/blog',
          image: '',
          badge: 'Summer 2026',
        },
      },
      {
        id: id('blk-brands'),
        type: 'brand-carousel',
        data: {
          title: 'Trusted Brands',
          brands: [
            { name: 'Nike', logo: '', url: '/shop?brand=nike' },
            { name: 'Adidas', logo: '', url: '/shop?brand=adidas' },
            { name: 'Apple', logo: '', url: '/shop?brand=apple' },
            { name: 'Samsung', logo: '', url: '/shop?brand=samsung' },
            { name: 'Puma', logo: '', url: '/shop?brand=puma' },
            { name: 'Sony', logo: '', url: '/shop?brand=sony' },
          ],
        },
      },
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

  // ── About Us ──────────────────────────────────────────────────────────────
  {
    slug: 'about-us',
    title: 'About Us',
    metaDesc: 'Learn about our story, values and the team behind our online store.',
    isLandingPage: false,
    blocks: [
      {
        id: id('about-hero'),
        type: 'promo-banner',
        data: {
          title: 'Our Story',
          subtitle: 'About Us',
          description: 'We started with a simple idea — make quality products accessible to everyone. Today we serve thousands of happy customers worldwide.',
          primaryCtaText: 'Shop Now',
          primaryCtaUrl: '/shop',
          secondaryCtaText: 'Contact Us',
          secondaryCtaUrl: '/contact-us',
          image: '',
          badge: '',
        },
      },
      {
        id: id('about-values'),
        type: 'features-banner',
        data: {
          features: [
            { icon: 'star', title: 'Quality First', description: 'Every product is carefully selected and tested before it reaches you.' },
            { icon: 'heart', title: 'Customer Focused', description: 'Your satisfaction is our top priority — always.' },
            { icon: 'globe', title: 'Worldwide Reach', description: 'We ship to over 50 countries with fast, reliable delivery.' },
            { icon: 'leaf', title: 'Sustainable', description: 'Committed to eco-friendly packaging and responsible sourcing.' },
          ],
        },
      },
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

  // ── Contact Us ────────────────────────────────────────────────────────────
  {
    slug: 'contact-us',
    title: 'Contact Us',
    metaDesc: 'Get in touch with our team. We are here to help with orders, products and anything else.',
    isLandingPage: false,
    blocks: [
      {
        id: id('contact-hero'),
        type: 'promo-banner',
        data: {
          title: 'Get In Touch',
          subtitle: 'Contact Us',
          description: 'Have a question about your order, a product or anything else? Our team is ready to help — reach out anytime.',
          primaryCtaText: 'Email Us',
          primaryCtaUrl: 'mailto:hello@yourstore.com',
          image: '',
          badge: '',
        },
      },
      {
        id: id('contact-main'),
        type: 'custom-html',
        data: {
          html: `<section style="background:#f5f5f5;padding:60px 0;">
  <div style="max-width:1100px;margin:0 auto;padding:0 24px;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;">
      <!-- Contact Info -->
      <div>
        <h2 style="font-size:24px;font-weight:700;color:#212529;margin:0 0 24px;">Contact Information</h2>
        <div style="display:flex;flex-direction:column;gap:20px;">
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="width:44px;height:44px;border-radius:10px;background:#e4611e;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <span style="color:#fff;font-size:18px;">📍</span>
            </div>
            <div>
              <div style="font-weight:600;color:#212529;margin-bottom:3px;">Our Address</div>
              <div style="color:#636363;font-size:14px;line-height:1.6;">123 Commerce Street<br>New York, NY 10001<br>United States</div>
            </div>
          </div>
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="width:44px;height:44px;border-radius:10px;background:#e4611e;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <span style="color:#fff;font-size:18px;">📞</span>
            </div>
            <div>
              <div style="font-weight:600;color:#212529;margin-bottom:3px;">Phone</div>
              <div style="color:#636363;font-size:14px;">+1 (800) 123-4567</div>
              <div style="color:#636363;font-size:13px;">Mon – Fri, 9am – 6pm EST</div>
            </div>
          </div>
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="width:44px;height:44px;border-radius:10px;background:#e4611e;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <span style="color:#fff;font-size:18px;">✉️</span>
            </div>
            <div>
              <div style="font-weight:600;color:#212529;margin-bottom:3px;">Email</div>
              <div style="color:#636363;font-size:14px;">hello@yourstore.com</div>
              <div style="color:#636363;font-size:13px;">We reply within 24 hours</div>
            </div>
          </div>
        </div>
        <div style="margin-top:32px;padding:20px;background:#212529;border-radius:12px;">
          <div style="font-weight:600;color:#fff;margin-bottom:12px;">Business Hours</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;justify-content:space-between;color:#aaa;font-size:13px;"><span>Monday – Friday</span><span style="color:#e4611e;">9:00 AM – 6:00 PM</span></div>
            <div style="display:flex;justify-content:space-between;color:#aaa;font-size:13px;"><span>Saturday</span><span style="color:#e4611e;">10:00 AM – 4:00 PM</span></div>
            <div style="display:flex;justify-content:space-between;color:#aaa;font-size:13px;"><span>Sunday</span><span>Closed</span></div>
          </div>
        </div>
      </div>
      <!-- Contact Form -->
      <div style="background:#fff;border-radius:14px;padding:36px;box-shadow:0 4px 20px rgba(0,0,0,.08);">
        <h2 style="font-size:22px;font-weight:700;color:#212529;margin:0 0 6px;">Send Us a Message</h2>
        <p style="color:#636363;font-size:14px;margin:0 0 24px;">Fill out the form below and we will get back to you as soon as possible.</p>
        <form style="display:flex;flex-direction:column;gap:16px;" onsubmit="return false">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#212529;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">First Name</label>
              <input type="text" placeholder="John" style="width:100%;padding:10px 14px;border:1.5px solid #e1e1e1;border-radius:8px;font-size:14px;color:#212529;outline:none;box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block;font-size:12px;font-weight:600;color:#212529;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Last Name</label>
              <input type="text" placeholder="Doe" style="width:100%;padding:10px 14px;border:1.5px solid #e1e1e1;border-radius:8px;font-size:14px;color:#212529;outline:none;box-sizing:border-box;">
            </div>
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#212529;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Email Address</label>
            <input type="email" placeholder="john@example.com" style="width:100%;padding:10px 14px;border:1.5px solid #e1e1e1;border-radius:8px;font-size:14px;color:#212529;outline:none;box-sizing:border-box;">
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#212529;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Subject</label>
            <select style="width:100%;padding:10px 14px;border:1.5px solid #e1e1e1;border-radius:8px;font-size:14px;color:#212529;outline:none;background:#fff;">
              <option>Order Inquiry</option>
              <option>Return &amp; Refund</option>
              <option>Product Question</option>
              <option>Partnership</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#212529;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Message</label>
            <textarea rows="4" placeholder="Write your message here…" style="width:100%;padding:10px 14px;border:1.5px solid #e1e1e1;border-radius:8px;font-size:14px;color:#212529;outline:none;resize:vertical;box-sizing:border-box;"></textarea>
          </div>
          <button type="submit" style="background:#e4611e;color:#fff;border:none;padding:13px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:.3px;">Send Message</button>
        </form>
      </div>
    </div>
  </div>
</section>`,
        },
      },
      {
        id: id('contact-features'),
        type: 'features-banner',
        data: {
          features: [
            { icon: 'truck', title: 'Fast Shipping', description: 'Most orders shipped within 24 hours' },
            { icon: 'refresh', title: 'Easy Returns', description: 'Hassle-free 30-day return policy' },
            { icon: 'shield', title: 'Secure Shopping', description: 'Your data is always safe with us' },
            { icon: 'headphones', title: 'Live Support', description: 'Chat with us any time, any day' },
          ],
        },
      },
    ],
  },

  // ── Shop ──────────────────────────────────────────────────────────────────
  {
    slug: 'shop',
    title: 'Shop',
    metaDesc: 'Browse our full collection of products. New arrivals added daily.',
    isLandingPage: false,
    blocks: [
      {
        id: id('shop-cats'),
        type: 'category-grid',
        data: {
          title: 'All Categories',
          categories: [
            { name: 'Electronics', image: '', count: 248, url: '/shop?cat=electronics' },
            { name: 'Fashion', image: '', count: 512, url: '/shop?cat=fashion' },
            { name: 'Home & Garden', image: '', count: 189, url: '/shop?cat=home' },
            { name: 'Sports & Outdoor', image: '', count: 134, url: '/shop?cat=sports' },
            { name: 'Beauty & Health', image: '', count: 97, url: '/shop?cat=beauty' },
            { name: 'Toys & Games', image: '', count: 76, url: '/shop?cat=toys' },
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
            { id: 'sp1', name: 'Wireless Headphones Pro', price: 79.99, originalPrice: 129.99, image: '', badge: 'Sale', rating: 5 },
            { id: 'sp2', name: 'Running Sneakers X2', price: 54.99, originalPrice: 89.99, image: '', badge: 'Sale', rating: 4 },
            { id: 'sp3', name: 'Smart Watch Series 5', price: 149.99, image: '', rating: 5 },
            { id: 'sp4', name: 'Portable Bluetooth Speaker', price: 49.99, originalPrice: 79.99, image: '', badge: 'Hot', rating: 5 },
            { id: 'sp5', name: 'Denim Jacket Classic', price: 69.99, image: '', badge: 'Popular', rating: 5 },
            { id: 'sp6', name: 'Yoga Mat Premium', price: 29.99, image: '', rating: 4 },
            { id: 'sp7', name: 'Stainless Steel Bottle', price: 19.99, image: '', rating: 5 },
            { id: 'sp8', name: 'USB-C Hub 7-in-1', price: 24.99, originalPrice: 49.99, image: '', badge: 'Sale', rating: 4 },
            { id: 'sp9', name: 'Desk Organiser Set', price: 39.99, image: '', rating: 4 },
            { id: 'sp10', name: 'Cotton Crew Tee', price: 24.99, image: '', rating: 4 },
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

  // ── Blog ──────────────────────────────────────────────────────────────────
  {
    slug: 'blog',
    title: 'Blog',
    metaDesc: 'Tips, trends and product guides from our team of experts.',
    isLandingPage: false,
    blocks: [
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
