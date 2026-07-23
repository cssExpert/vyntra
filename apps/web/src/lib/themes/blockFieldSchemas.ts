// Schema definitions for block data editing.
// Each block type declares its sections and field types.
// BlockDataEditor reads this to render the correct form with pre-filled values.

// ── Field type definitions ────────────────────────────────────────────────────

export type ScalarFieldDef =
  | { type: 'text';        key: string; label: string; placeholder?: string }
  | { type: 'number';      key: string; label: string; min?: number; max?: number; suffix?: string }
  | { type: 'url';         key: string; label: string; placeholder?: string }
  | { type: 'image';       key: string; label: string }
  | { type: 'html';        key: string; label: string; rows?: number }
  | { type: 'textarea';    key: string; label: string; rows?: number; placeholder?: string }
  | { type: 'select';      key: string; label: string; options: { value: string; label: string }[] }
  | { type: 'toggle';      key: string; label: string; description?: string }
  | { type: 'string-list'; key: string; label: string; placeholder?: string; addLabel?: string }
  | { type: 'product-source'; key: string; label: string; defaultLimit?: number }
  | { type: 'blog-source'; key: string; label: string; defaultLimit?: number };

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
        { type: 'product-source', key: 'source', label: 'Products', defaultLimit: 8 },
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
          defaultItem: { label: 'New Tab', source: { categoryId: '', productType: '', limit: 8 } },
          fields: [
            { type: 'text', key: 'label', label: 'Tab Label', placeholder: 'New Arrivals' },
            { type: 'product-source', key: 'source', label: 'Products', defaultLimit: 8 },
          ],
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
      title: 'Settings',
      defaultOpen: true,
      fields: [
        {
          type: 'number',
          key: 'postsCount',
          label: 'Posts Per Page',
          min: 1,
          max: 12,
          suffix: 'posts',
        },
        {
          type: 'select',
          key: 'titleStyle',
          label: 'Title Style',
          options: [
            { value: 'default',   label: 'Default — centered + accent bar' },
            { value: 'underline', label: 'Underline — left-aligned' },
            { value: 'badge',     label: 'Badge — label chip above title' },
            { value: 'minimal',   label: 'Minimal — plain text' },
          ],
        },
        {
          type: 'select',
          key: 'displayMode',
          label: 'Display Mode',
          options: [
            { value: 'grid',   label: 'Grid — card columns' },
            { value: 'list',   label: 'List — stacked rows' },
            { value: 'slider', label: 'Slider — horizontal carousel' },
          ],
        },
        { type: 'toggle', key: 'animateCards',    label: 'Animate Cards',         description: 'Fade-in cards as they scroll into view' },
        { type: 'toggle', key: 'showNavigation',  label: 'Slider Navigation',     description: 'Show prev / next arrows (slider mode only)' },
        { type: 'toggle', key: 'showPagination',  label: 'Slider Pagination',     description: 'Show dot indicators (slider mode only)' },
        { type: 'toggle', key: 'showPaging',      label: 'Show Paging',           description: 'Page controls for grid / list mode' },
      ],
    },
    {
      title: 'Data Source',
      defaultOpen: false,
      fields: [
        { type: 'blog-source', key: 'source', label: 'Blog Posts', defaultLimit: 12 },
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
          type: 'string-list',
          key: 'paragraphs',
          label: 'Paragraphs',
          placeholder: 'Paragraph text…',
          addLabel: 'Add Paragraph',
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
          type: 'string-list',
          key: 'subjects',
          label: 'Subject Options',
          placeholder: 'e.g. Order Inquiry',
          addLabel: 'Add Subject',
        },
      ],
    },
  ],

  'contact-form-info': [
    {
      title: 'Form',
      fields: [
        { type: 'text', key: 'formTitle',    label: 'Form Heading',  placeholder: 'Drop Us a Line' },
        { type: 'text', key: 'formSubtitle', label: 'Form Subtitle', placeholder: 'Fill out the form below…' },
        { type: 'text', key: 'submitText',   label: 'Submit Button Text', placeholder: 'Send Message' },
      ],
    },
    {
      title: 'Info Panel',
      fields: [
        { type: 'text',     key: 'infoTitle',        label: 'Section Heading', placeholder: 'Get In Touch' },
        { type: 'text',     key: 'addressLabel',      label: 'Address Label',  placeholder: 'Address' },
        { type: 'textarea', key: 'address',           label: 'Address',        placeholder: '123 Street Name, City, Australia', rows: 2 },
        { type: 'text',     key: 'phoneLabel',        label: 'Phone Label',    placeholder: 'Phone' },
        {
          type: 'string-list',
          key: 'phoneLines',
          label: 'Phone Lines',
          placeholder: 'e.g. Toll Free (123) 472-796',
          addLabel: 'Add Phone Line',
        },
        { type: 'text', key: 'emailLabel',       label: 'Email Label',       placeholder: 'Email' },
        { type: 'text', key: 'email',            label: 'Email',             placeholder: 'mail@example.com' },
        { type: 'text', key: 'workingDaysLabel', label: 'Working Days Label', placeholder: 'Working Days' },
        { type: 'text', key: 'workingDays',      label: 'Working Days',      placeholder: 'Mon - FRI / 9:30 AM - 6:30 PM' },
      ],
    },
  ],

  'google-map': [
    {
      title: 'Content',
      fields: [
        { type: 'text',   key: 'title',   label: 'Section Heading', placeholder: 'Find Us Map' },
        { type: 'text',   key: 'address', label: 'Address / Place', placeholder: 'Melbourne VIC, Australia' },
        { type: 'number', key: 'zoom',    label: 'Zoom Level', min: 1, max: 20 },
        { type: 'number', key: 'height',  label: 'Map Height', min: 200, max: 800, suffix: 'px' },
      ],
    },
  ],

  'hero-banner': [
    {
      title: 'Content',
      fields: [
        { type: 'text',     key: 'eyebrow', label: 'Eyebrow',  placeholder: 'About Our School' },
        { type: 'text',     key: 'heading', label: 'Heading',  placeholder: 'Built on faith, small classes…' },
        { type: 'textarea', key: 'body',    label: 'Body',     rows: 3, placeholder: 'Supporting paragraph…' },
        {
          type: 'select', key: 'tone', label: 'Tone',
          options: [{ value: 'light', label: 'Light — background image' }, { value: 'navy', label: 'Navy — no image, gradient' }],
        },
      ],
    },
    {
      title: 'Background',
      defaultOpen: false,
      fields: [
        { type: 'image', key: 'backgroundImage', label: 'Background Image (optional)' },
      ],
    },
    {
      title: 'Buttons',
      defaultOpen: false,
      fields: [
        { type: 'text', key: 'primaryCtaText',   label: 'Primary Button',   placeholder: 'Book a Tour' },
        { type: 'url',  key: 'primaryCtaUrl',    label: 'Primary URL',      placeholder: '/admissions' },
        { type: 'text', key: 'secondaryCtaText', label: 'Secondary Button', placeholder: 'Apply Now' },
        { type: 'url',  key: 'secondaryCtaUrl',  label: 'Secondary URL',    placeholder: '/admissions' },
      ],
    },
  ],

  'stats-counter': [
    {
      title: 'Content',
      fields: [
        { type: 'text', key: 'eyebrow',  label: 'Eyebrow',  placeholder: 'Academic Excellence' },
        { type: 'text', key: 'title',    label: 'Title',    placeholder: 'Rigor that prepares, not just occupies.' },
        { type: 'text', key: 'subtitle', label: 'Subtitle', placeholder: 'Measured, benchmarked, and relentlessly personal.' },
        { type: 'text', key: 'linkText', label: 'Link Text', placeholder: 'Explore Academics →' },
        { type: 'url',  key: 'linkUrl',  label: 'Link URL',  placeholder: '/academics' },
      ],
    },
    {
      title: 'Stats',
      fields: [
        {
          type: 'array',
          key: 'stats',
          label: 'Stats',
          itemLabel: 'Stat',
          addLabel: 'Add Stat',
          defaultItem: { value: '13', label: 'Max per grade' },
          fields: [
            { type: 'text', key: 'value', label: 'Value', placeholder: '13' },
            { type: 'text', key: 'label', label: 'Label', placeholder: 'Max per grade' },
          ],
        },
      ],
    },
  ],

  'admissions-steps': [
    {
      title: 'Content',
      fields: [
        { type: 'text', key: 'eyebrow', label: 'Eyebrow', placeholder: 'Admissions Process' },
        { type: 'text', key: 'title',   label: 'Title',   placeholder: 'Four steps to belonging.' },
        { type: 'text', key: 'ctaText', label: 'Button Text', placeholder: 'Start the Admissions Process' },
        { type: 'url',  key: 'ctaUrl',  label: 'Button URL',  placeholder: '/admissions' },
      ],
    },
    {
      title: 'Steps',
      fields: [
        {
          type: 'array',
          key: 'steps',
          label: 'Steps',
          itemLabel: 'Step',
          addLabel: 'Add Step',
          defaultItem: { number: '1', title: 'Inquire', description: 'Tell us about your family and your child\'s needs.' },
          fields: [
            { type: 'text',     key: 'number',      label: 'Number', placeholder: '1' },
            { type: 'text',     key: 'title',       label: 'Title',  placeholder: 'Inquire' },
            { type: 'textarea', key: 'description', label: 'Description', rows: 2 },
          ],
        },
      ],
    },
  ],

  'timeline-steps': [
    {
      title: 'Content',
      fields: [
        { type: 'text', key: 'eyebrow',  label: 'Eyebrow',  placeholder: 'A Day in the Life' },
        { type: 'text', key: 'title',    label: 'Title',    placeholder: 'What a school day looks like.' },
        { type: 'text', key: 'subtitle', label: 'Subtitle', placeholder: 'Optional supporting line' },
      ],
    },
    {
      title: 'Steps',
      fields: [
        {
          type: 'array',
          key: 'steps',
          label: 'Steps',
          itemLabel: 'Step',
          addLabel: 'Add Step',
          defaultItem: { marker: '7:45–8:00 AM', title: 'Arrival & Morning Circle', description: '' },
          fields: [
            { type: 'text',     key: 'marker',      label: 'Marker (time or date)', placeholder: '7:45–8:00 AM' },
            { type: 'text',     key: 'title',       label: 'Title', placeholder: 'Arrival & Morning Circle' },
            { type: 'textarea', key: 'description', label: 'Description', rows: 2 },
          ],
        },
      ],
    },
  ],

  'academics-programs': [
    {
      title: 'Content',
      fields: [
        { type: 'text', key: 'eyebrow',  label: 'Eyebrow',  placeholder: 'Curriculum' },
        { type: 'text', key: 'title',    label: 'Title',    placeholder: 'A curriculum that builds year over year.' },
        { type: 'text', key: 'subtitle', label: 'Subtitle', placeholder: 'Optional supporting line' },
      ],
    },
    {
      title: 'Cards',
      fields: [
        {
          type: 'array',
          key: 'cards',
          label: 'Cards',
          itemLabel: 'Card',
          addLabel: 'Add Card',
          defaultItem: { name: 'Grade 6 — "Foundations & Habits"', subjects: [], differentiator: '', description: '' },
          fields: [
            { type: 'text',        key: 'name',           label: 'Name', placeholder: 'Grade 6 — "Foundations & Habits"' },
            { type: 'text',        key: 'tagline',        label: 'Tagline (optional)' },
            { type: 'string-list', key: 'subjects',       label: 'Subjects', placeholder: 'English Language Arts', addLabel: 'Add Subject' },
            { type: 'textarea',    key: 'differentiator', label: 'Differentiator', rows: 2 },
            { type: 'textarea',    key: 'description',    label: 'Description (optional)', rows: 2 },
          ],
        },
      ],
    },
  ],

  'faculty-grid': [
    {
      title: 'Content',
      fields: [
        { type: 'text',     key: 'eyebrow',  label: 'Eyebrow',  placeholder: 'Governance' },
        { type: 'text',     key: 'title',    label: 'Title',    placeholder: 'Board of Directors.' },
        { type: 'textarea', key: 'intro',    label: 'Intro',    rows: 2 },
      ],
    },
    {
      title: 'Members',
      fields: [
        {
          type: 'array',
          key: 'members',
          label: 'Members',
          itemLabel: 'Member',
          addLabel: 'Add Member',
          defaultItem: { name: 'New Member', role: 'Board Member', bio: '', image: '' },
          fields: [
            { type: 'text',     key: 'name',  label: 'Name' },
            { type: 'text',     key: 'role',  label: 'Role' },
            { type: 'textarea', key: 'bio',   label: 'Bio', rows: 2 },
            { type: 'image',    key: 'image', label: 'Photo' },
          ],
        },
      ],
    },
  ],

  'photo-gallery': [
    {
      title: 'Content',
      fields: [
        { type: 'text', key: 'eyebrow',  label: 'Eyebrow',  placeholder: 'Photo Gallery' },
        { type: 'text', key: 'title',    label: 'Title',    placeholder: 'Take a look around.' },
        { type: 'text', key: 'subtitle', label: 'Subtitle' },
        { type: 'text', key: 'linkText', label: 'Link Text', placeholder: 'View the Full Gallery →' },
        { type: 'url',  key: 'linkUrl',  label: 'Link URL' },
      ],
    },
    {
      title: 'Images',
      fields: [
        {
          type: 'array',
          key: 'images',
          label: 'Images',
          itemLabel: 'Image',
          addLabel: 'Add Image',
          defaultItem: { image: '', caption: '' },
          fields: [
            { type: 'image', key: 'image',   label: 'Image' },
            { type: 'text',  key: 'caption',  label: 'Caption' },
          ],
        },
      ],
    },
  ],

  'testimonials': [
    {
      title: 'Content',
      fields: [
        { type: 'text', key: 'eyebrow',  label: 'Eyebrow',  placeholder: 'Testimonials' },
        { type: 'text', key: 'title',    label: 'Title',    placeholder: 'Parents notice the difference in weeks, not years.' },
        { type: 'text', key: 'subtitle', label: 'Subtitle' },
      ],
    },
    {
      title: 'Quotes',
      fields: [
        {
          type: 'array',
          key: 'items',
          label: 'Quotes',
          itemLabel: 'Quote',
          addLabel: 'Add Quote',
          defaultItem: { quote: '', name: 'Parent Name', role: 'Parent' },
          fields: [
            { type: 'textarea', key: 'quote', label: 'Quote', rows: 3 },
            { type: 'text',     key: 'name',  label: 'Name' },
            { type: 'text',     key: 'role',  label: 'Role', placeholder: 'Parent of 6th Grader' },
          ],
        },
      ],
    },
  ],

  'faq-accordion': [
    {
      title: 'Content',
      fields: [
        { type: 'text', key: 'eyebrow',  label: 'Eyebrow',  placeholder: 'FAQ' },
        { type: 'text', key: 'title',    label: 'Title',    placeholder: 'Questions, answered.' },
        { type: 'text', key: 'subtitle', label: 'Subtitle' },
        { type: 'text', key: 'linkText', label: 'Link Text', placeholder: 'View Full FAQ →' },
        { type: 'url',  key: 'linkUrl',  label: 'Link URL' },
      ],
    },
    {
      title: 'Flat Questions (used when no groups are set)',
      defaultOpen: false,
      fields: [
        {
          type: 'array',
          key: 'items',
          label: 'Questions',
          itemLabel: 'Question',
          addLabel: 'Add Question',
          defaultItem: { question: '', answer: '' },
          fields: [
            { type: 'text',     key: 'question', label: 'Question' },
            { type: 'textarea', key: 'answer',   label: 'Answer', rows: 3 },
          ],
        },
      ],
    },
    {
      // Nested per-category Q&A pairs aren't editable here — ArrayFieldDef only
      // supports scalar sub-fields, not nested arrays. Category name/intro can be
      // adjusted visually; each category's `items` are seeded by the installer.
      title: 'Grouped Questions (optional, overrides flat list)',
      defaultOpen: false,
      fields: [
        {
          type: 'array',
          key: 'groups',
          label: 'Categories',
          itemLabel: 'Category',
          addLabel: 'Add Category',
          defaultItem: { category: 'Admissions', intro: '', items: [] },
          fields: [
            { type: 'text',     key: 'category', label: 'Category Name' },
            { type: 'textarea', key: 'intro',     label: 'Intro', rows: 2 },
          ],
        },
      ],
    },
  ],

  'pricing-tiers': [
    {
      title: 'Content',
      fields: [
        { type: 'text', key: 'eyebrow',  label: 'Eyebrow',  placeholder: 'Tuition & Scholarships' },
        { type: 'text', key: 'title',    label: 'Title',    placeholder: 'Transparent pricing, no surprises.' },
        { type: 'text', key: 'subtitle', label: 'Subtitle' },
      ],
    },
    {
      title: 'Tiers',
      fields: [
        {
          type: 'array',
          key: 'tiers',
          label: 'Tiers',
          itemLabel: 'Tier',
          addLabel: 'Add Tier',
          defaultItem: { name: 'Standard Tuition', price: '$0/yr', note: '', badge: '', features: [], ctaText: 'Apply Now', ctaUrl: '/admissions' },
          fields: [
            { type: 'text',        key: 'name',     label: 'Name' },
            { type: 'text',        key: 'price',    label: 'Price', placeholder: '$14,200/yr' },
            { type: 'text',        key: 'note',     label: 'Note' },
            { type: 'text',        key: 'badge',    label: 'Badge (optional)', placeholder: 'Most Common' },
            { type: 'string-list', key: 'features', label: 'Features', addLabel: 'Add Feature' },
            { type: 'text',        key: 'ctaText',  label: 'Button Text' },
            { type: 'url',         key: 'ctaUrl',   label: 'Button URL' },
          ],
        },
      ],
    },
    {
      title: 'Callout',
      defaultOpen: false,
      fields: [
        { type: 'text',     key: 'calloutTitle',   label: 'Callout Title' },
        { type: 'textarea', key: 'calloutBody',    label: 'Callout Body', rows: 2 },
        { type: 'text',     key: 'calloutCtaText', label: 'Callout Button Text' },
        { type: 'url',      key: 'calloutCtaUrl',  label: 'Callout Button URL' },
      ],
    },
  ],

  'cta-cards': [
    {
      title: 'Cards',
      fields: [
        {
          type: 'array',
          key: 'cards',
          label: 'Cards',
          itemLabel: 'Card',
          addLabel: 'Add Card',
          defaultItem: { title: 'Ready to apply?', description: '', ctaText: 'Apply Now', ctaUrl: '/admissions', tone: 'light' },
          fields: [
            { type: 'text',     key: 'title',       label: 'Title' },
            { type: 'textarea', key: 'description', label: 'Description', rows: 2 },
            { type: 'text',     key: 'ctaText',     label: 'Button Text' },
            { type: 'url',      key: 'ctaUrl',      label: 'Button URL' },
            {
              type: 'select', key: 'tone', label: 'Tone',
              options: [{ value: 'light', label: 'Light' }, { value: 'navy', label: 'Navy' }],
            },
          ],
        },
      ],
    },
  ],

  'cta-banner': [
    {
      title: 'Content',
      fields: [
        { type: 'text', key: 'title',              label: 'Title',    placeholder: 'Your child\'s leadership story starts here.' },
        { type: 'text', key: 'subtitle',            label: 'Subtitle' },
        { type: 'text', key: 'primaryCtaText',      label: 'Primary Button',   placeholder: 'Book a Tour' },
        { type: 'url',  key: 'primaryCtaUrl',       label: 'Primary URL',      placeholder: '/admissions' },
        { type: 'text', key: 'secondaryCtaText',    label: 'Secondary Button', placeholder: 'Apply Now' },
        { type: 'url',  key: 'secondaryCtaUrl',     label: 'Secondary URL',    placeholder: '/admissions' },
      ],
    },
  ],

};
