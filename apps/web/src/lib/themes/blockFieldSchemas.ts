// Schema definitions for block data editing.
// Each block type declares its sections and field types.
// BlockDataEditor reads this to render the correct form with pre-filled values.

// ── Field type definitions ────────────────────────────────────────────────────

export type ScalarFieldDef =
  | { type: 'text';     key: string; label: string; placeholder?: string }
  | { type: 'number';   key: string; label: string; min?: number; max?: number; suffix?: string }
  | { type: 'url';      key: string; label: string; placeholder?: string }
  | { type: 'image';    key: string; label: string }
  | { type: 'html';     key: string; label: string; rows?: number }
  | { type: 'textarea'; key: string; label: string; rows?: number; placeholder?: string }
  | { type: 'select';   key: string; label: string; options: { value: string; label: string }[] };

export interface ArrayFieldDef {
  type: 'array';
  key: string;
  label: string;
  itemLabel?: string;
  addLabel?: string;
  defaultItem: Record<string, unknown>;
  fields: ScalarFieldDef[];
}

export interface DbSourceDef {
  type: 'db-source';
  key: string;
  table: string;
  label: string;
  description: string;
  limitKey: string;
  defaultLimit?: number;
}

export type AnyFieldDef = ScalarFieldDef | ArrayFieldDef | DbSourceDef;

export interface BlockSection {
  title: string;
  defaultOpen?: boolean;
  fields: AnyFieldDef[];
}

// ── Block schemas ─────────────────────────────────────────────────────────────

export const BLOCK_SCHEMAS: Record<string, BlockSection[]> = {

  'hero-carousel': [
    {
      title: 'Settings',
      defaultOpen: false,
      fields: [
        { type: 'number', key: 'autoPlayMs', label: 'Auto Play', min: 0, suffix: 'ms' },
      ],
    },
    {
      title: 'Slides',
      fields: [
        {
          type: 'array',
          key: 'slides',
          label: 'Slides',
          itemLabel: 'Slide',
          addLabel: 'Add Slide',
          defaultItem: { title: 'New Slide', subtitle: '', badge: '', ctaText: 'Shop Now', ctaUrl: '/', image: '' },
          fields: [
            { type: 'text',  key: 'title',    label: 'Title',      placeholder: 'Big Sale — Up to 50% Off' },
            { type: 'text',  key: 'subtitle', label: 'Subtitle',   placeholder: 'Shop the latest arrivals…' },
            { type: 'text',  key: 'badge',    label: 'Badge',      placeholder: 'Limited Offer' },
            { type: 'text',  key: 'ctaText',  label: 'Button Text', placeholder: 'Shop Now' },
            { type: 'url',   key: 'ctaUrl',   label: 'Button URL', placeholder: '/shop' },
            { type: 'image', key: 'image',    label: 'Slide Image' },
          ],
        },
      ],
    },
  ],

  'product-grid': [
    {
      title: 'Content',
      fields: [
        { type: 'text', key: 'title',    label: 'Title',    placeholder: 'Featured Products' },
        { type: 'text', key: 'subtitle', label: 'Subtitle', placeholder: 'Hand-picked for you' },
      ],
    },
    {
      title: 'Data Source',
      defaultOpen: false,
      fields: [
        {
          type: 'db-source',
          key: 'products',
          table: 'products',
          label: 'Products',
          description: 'Products will be fetched live from your catalog at render time.',
          limitKey: 'limit',
          defaultLimit: 8,
        },
      ],
    },
  ],

  'product-tabs': [
    {
      title: 'Tabs',
      fields: [
        {
          type: 'array',
          key: 'tabs',
          label: 'Tabs',
          itemLabel: 'Tab',
          addLabel: 'Add Tab',
          defaultItem: { label: 'New Tab', products: [] },
          fields: [
            { type: 'text', key: 'label', label: 'Tab Label', placeholder: 'New Arrivals' },
          ],
        },
      ],
    },
    {
      title: 'Data Source',
      defaultOpen: false,
      fields: [
        {
          type: 'db-source',
          key: 'products',
          table: 'products',
          label: 'Products per Tab',
          description: 'Products in each tab are fetched live from your catalog.',
          limitKey: 'limit',
          defaultLimit: 8,
        },
      ],
    },
  ],

  'features-banner': [
    {
      title: 'Features',
      fields: [
        {
          type: 'array',
          key: 'features',
          label: 'Features',
          itemLabel: 'Feature',
          addLabel: 'Add Feature',
          defaultItem: { icon: 'truck', title: 'New Feature', description: '' },
          fields: [
            {
              type: 'select',
              key: 'icon',
              label: 'Icon',
              options: [
                { value: 'truck',       label: '🚚  Truck — Shipping' },
                { value: 'shield',      label: '🛡️  Shield — Security' },
                { value: 'refresh',     label: '🔄  Refresh — Returns' },
                { value: 'headphones',  label: '🎧  Headphones — Support' },
                { value: 'star',        label: '⭐  Star — Quality' },
                { value: 'check',       label: '✓   Check — Verified' },
                { value: 'gift',        label: '🎁  Gift' },
                { value: 'tag',         label: '🏷️  Tag — Price' },
              ],
            },
            { type: 'text', key: 'title',       label: 'Title',       placeholder: 'Free Shipping' },
            { type: 'text', key: 'description', label: 'Description', placeholder: 'On orders over $99' },
          ],
        },
      ],
    },
  ],

  'promo-banner': [
    {
      title: 'Content',
      fields: [
        { type: 'text',  key: 'subtitle',    label: 'Label',       placeholder: 'New Season' },
        { type: 'text',  key: 'title',       label: 'Headline',    placeholder: 'Exclusive Summer Collection' },
        { type: 'text',  key: 'description', label: 'Description', placeholder: 'Discover the latest trends…' },
        { type: 'text',  key: 'badge',       label: 'Badge',       placeholder: 'Summer 2026' },
        { type: 'image', key: 'image',       label: 'Background Image' },
      ],
    },
    {
      title: 'Buttons',
      defaultOpen: false,
      fields: [
        { type: 'text', key: 'primaryCtaText',   label: 'Primary Button',   placeholder: 'Shop Collection' },
        { type: 'url',  key: 'primaryCtaUrl',    label: 'Primary URL',      placeholder: '/shop' },
        { type: 'text', key: 'secondaryCtaText', label: 'Secondary Button', placeholder: 'View Lookbook' },
        { type: 'url',  key: 'secondaryCtaUrl',  label: 'Secondary URL',    placeholder: '/lookbook' },
      ],
    },
  ],

  'brand-carousel': [
    {
      title: 'Content',
      fields: [
        { type: 'text', key: 'title', label: 'Title', placeholder: 'Trusted Brands' },
      ],
    },
    {
      title: 'Brands',
      fields: [
        {
          type: 'array',
          key: 'brands',
          label: 'Brands',
          itemLabel: 'Brand',
          addLabel: 'Add Brand',
          defaultItem: { name: 'New Brand', logo: '', url: '#' },
          fields: [
            { type: 'text',  key: 'name', label: 'Brand Name', placeholder: 'Nike' },
            { type: 'image', key: 'logo', label: 'Logo' },
            { type: 'url',   key: 'url',  label: 'Link URL',   placeholder: '/brand/nike' },
          ],
        },
      ],
    },
  ],

  'category-grid': [
    {
      title: 'Content',
      fields: [
        { type: 'text', key: 'title', label: 'Title', placeholder: 'Shop by Category' },
      ],
    },
    {
      title: 'Data Source',
      defaultOpen: false,
      fields: [
        {
          type: 'db-source',
          key: 'categories',
          table: 'categories',
          label: 'Categories',
          description: 'Categories will be fetched live from your store catalog.',
          limitKey: 'limit',
          defaultLimit: 6,
        },
      ],
    },
  ],

  'newsletter': [
    {
      title: 'Content',
      fields: [
        { type: 'text', key: 'title',       label: 'Title',             placeholder: 'Stay in the Loop' },
        { type: 'text', key: 'subtitle',    label: 'Subtitle',          placeholder: 'Get the latest deals…' },
        { type: 'text', key: 'placeholder', label: 'Input Placeholder', placeholder: 'Enter your email…' },
        { type: 'text', key: 'buttonText',  label: 'Button Text',       placeholder: 'Subscribe' },
      ],
    },
  ],

  'blog-section': [
    {
      title: 'Content',
      fields: [
        { type: 'text', key: 'title',    label: 'Title',    placeholder: 'From Our Blog' },
        { type: 'text', key: 'subtitle', label: 'Subtitle', placeholder: 'Tips, guides and inspiration' },
      ],
    },
    {
      title: 'Data Source',
      defaultOpen: false,
      fields: [
        {
          type: 'db-source',
          key: 'posts',
          table: 'blog_posts',
          label: 'Blog Posts',
          description: 'Posts will be fetched live from your blog.',
          limitKey: 'limit',
          defaultLimit: 3,
        },
      ],
    },
  ],

  'custom-html': [
    {
      title: 'HTML',
      fields: [
        {
          type: 'html',
          key: 'html',
          label: 'HTML / Script',
          rows: 14,
        },
      ],
    },
  ],

  'page-header': [
    {
      title: 'Content',
      fields: [
        { type: 'text',  key: 'title',           label: 'Page Title',        placeholder: 'About Us' },
        { type: 'text',  key: 'subtitle',         label: 'Subtitle',          placeholder: 'Optional tagline' },
        { type: 'image', key: 'backgroundImage',  label: 'Background Image (optional)' },
      ],
    },
    {
      title: 'Breadcrumbs',
      defaultOpen: false,
      fields: [
        {
          type: 'array',
          key: 'breadcrumbs',
          label: 'Breadcrumb Items',
          itemLabel: 'Crumb',
          addLabel: 'Add Crumb',
          defaultItem: { label: 'Page', url: '#' },
          fields: [
            { type: 'text', key: 'label', label: 'Label', placeholder: 'About Us' },
            { type: 'url',  key: 'url',   label: 'URL',   placeholder: '/about-us' },
          ],
        },
      ],
    },
  ],

  'text-image': [
    {
      title: 'Content',
      fields: [
        { type: 'text',     key: 'heading',       label: 'Heading',        placeholder: 'Our Story' },
        { type: 'select',   key: 'imagePosition', label: 'Image Position',
          options: [{ value: 'right', label: 'Right' }, { value: 'left', label: 'Left' }] },
        { type: 'image',    key: 'image',         label: 'Image' },
      ],
    },
    {
      title: 'Paragraphs',
      fields: [
        {
          type: 'array',
          key: 'paragraphs',
          label: 'Text Paragraphs',
          itemLabel: 'Paragraph',
          addLabel: 'Add Paragraph',
          defaultItem: 'New paragraph text.',
          fields: [
            { type: 'textarea', key: '', label: 'Text', rows: 3, placeholder: 'Paragraph text…' },
          ],
        },
      ],
    },
    {
      title: 'Call to Action',
      defaultOpen: false,
      fields: [
        { type: 'text', key: 'ctaText', label: 'Button Text', placeholder: 'Shop Now' },
        { type: 'url',  key: 'ctaUrl',  label: 'Button URL',  placeholder: '/shop' },
      ],
    },
  ],

  'contact-form': [
    {
      title: 'Form',
      fields: [
        { type: 'text',     key: 'formTitle',    label: 'Form Heading',  placeholder: 'Send Us a Message' },
        { type: 'text',     key: 'formSubtitle', label: 'Form Subtitle', placeholder: "We'll get back to you within 24 hours." },
      ],
    },
    {
      title: 'Contact Info',
      fields: [
        { type: 'text',     key: 'infoTitle', label: 'Section Heading', placeholder: 'Contact Information' },
        { type: 'textarea', key: 'address',   label: 'Address',         placeholder: '123 Commerce St\nNew York, NY', rows: 3 },
        { type: 'text',     key: 'phone',     label: 'Phone',           placeholder: '+1 (800) 123-4567' },
        { type: 'text',     key: 'email',     label: 'Email',           placeholder: 'hello@yourstore.com' },
      ],
    },
    {
      title: 'Business Hours',
      defaultOpen: false,
      fields: [
        {
          type: 'array',
          key: 'hours',
          label: 'Hours',
          itemLabel: 'Row',
          addLabel: 'Add Row',
          defaultItem: { day: 'Monday – Friday', time: '9:00 AM – 6:00 PM' },
          fields: [
            { type: 'text', key: 'day',  label: 'Day',  placeholder: 'Monday – Friday' },
            { type: 'text', key: 'time', label: 'Time', placeholder: '9:00 AM – 6:00 PM' },
          ],
        },
      ],
    },
    {
      title: 'Map',
      defaultOpen: false,
      fields: [
        { type: 'url', key: 'mapEmbedUrl', label: 'Google Maps Embed URL', placeholder: 'https://www.google.com/maps/embed?pb=...' },
      ],
    },
    {
      title: 'Form Subjects',
      defaultOpen: false,
      fields: [
        {
          type: 'array',
          key: 'subjects',
          label: 'Subject Options',
          itemLabel: 'Option',
          addLabel: 'Add Option',
          defaultItem: 'New Subject',
          fields: [
            { type: 'text', key: '', label: 'Option Label', placeholder: 'Order Inquiry' },
          ],
        },
      ],
    },
  ],

};
