import type { BlockType } from "@/lib/themes/types";

// Palette categories for the Academy theme's block sidebar.
export const BLOCK_GROUPS: { label: string; types: BlockType[] }[] = [
  { label: "Hero", types: ["hero-banner"] },
  { label: "Admissions", types: ["admissions-steps", "pricing-tiers", "cta-cards"] },
  { label: "Academics", types: ["academics-programs", "timeline-steps"] },
  { label: "People & Stories", types: ["faculty-grid", "testimonials"] },
  { label: "Content", types: ["text-image", "stats-counter", "photo-gallery", "faq-accordion"] },
  { label: "Contact", types: ["contact-form-info"] },
  { label: "Other", types: ["cta-banner", "custom-html"] },
];

// Meta only for the types Academy adds/overrides — legacy types fall back to
// the common (shopingo-sourced) meta via the resolver.
export const BLOCK_META: Partial<Record<BlockType, { label: string; description: string; icon: string }>> = {
  "hero-banner": {
    label: "Hero Banner",
    description: "Full-width eyebrow + heading + body hero with one or two CTA buttons",
    icon: "header",
  },
  "stats-counter": {
    label: "Stats Counter",
    description: "A row of large numeric stats with labels, navy background",
    icon: "features",
  },
  "admissions-steps": {
    label: "Admissions Steps",
    description: "Numbered step-by-step process (Inquire, Tour, Apply, Enroll…)",
    icon: "features",
  },
  "timeline-steps": {
    label: "Timeline",
    description: "A vertical timeline of time- or date-marked steps",
    icon: "features",
  },
  "academics-programs": {
    label: "Academics / Programs",
    description: "Grade or program cards with subjects and a differentiator line",
    icon: "grid",
  },
  "faculty-grid": {
    label: "Faculty / Team Grid",
    description: "Photo, name, role and bio grid — board members, faculty, staff",
    icon: "categories",
  },
  "photo-gallery": {
    label: "Photo Gallery",
    description: "Masonry image grid with hover captions",
    icon: "categories",
  },
  "testimonials": {
    label: "Testimonials",
    description: "Quote cards with name and role",
    icon: "promo",
  },
  "faq-accordion": {
    label: "FAQ Accordion",
    description: "Expandable Q&A list, flat or grouped into categories",
    icon: "html",
  },
  "pricing-tiers": {
    label: "Pricing / Tuition Tiers",
    description: "Pricing cards with features and a financial-aid callout",
    icon: "grid",
  },
  "cta-cards": {
    label: "CTA Cards",
    description: "Two or more side-by-side call-to-action cards",
    icon: "promo",
  },
  "cta-banner": {
    label: "CTA Banner",
    description: "Full-width closing banner with one or two buttons",
    icon: "promo",
  },
  "contact-form-info": {
    label: "Contact Form + Info",
    description: "Contact form (with optional department select) beside an address/phone/hours panel",
    icon: "contact",
  },
};

export const BLOCK_DEFAULTS: Partial<{ [K in BlockType]: unknown }> = {
  "hero-banner": {
    eyebrow: "Here to Help",
    heading: "Built on faith, small classes, and the belief that every child deserves to be known.",
    body: "We are a founding-class institution with a simple conviction: middle school shapes a lifetime.",
    backgroundImage: "",
    primaryCtaText: "Book a Tour",
    primaryCtaUrl: "/admissions",
    secondaryCtaText: "Apply Now",
    secondaryCtaUrl: "/admissions",
    tone: "navy",
  },
  "stats-counter": {
    eyebrow: "Academic Excellence",
    title: "Rigor that prepares, not just occupies.",
    subtitle: "Measured, benchmarked, and relentlessly personal.",
    stats: [
      { value: "13", label: "Max per grade" },
      { value: "100%", label: "Certified faculty" },
      { value: "1:13", label: "Teacher ratio" },
      { value: "7", label: "Leadership pillars" },
    ],
    linkText: "Explore Academics →",
    linkUrl: "/academics",
  },
  "admissions-steps": {
    eyebrow: "Admissions Process",
    title: "Four steps to belonging.",
    steps: [
      { number: "1", title: "Inquire", description: "Tell us about your family and your child's needs." },
      { number: "2", title: "Tour", description: "Walk the campus and meet the faculty in person." },
      { number: "3", title: "Apply", description: "Submit a simple, guided application online." },
      { number: "4", title: "Enroll", description: "Join the founding community of leaders." },
    ],
    ctaText: "Start the Admissions Process",
    ctaUrl: "/admissions",
  },
  "timeline-steps": {
    eyebrow: "A Day in the Life",
    title: "What a school day looks like.",
    steps: [
      { marker: "7:45–8:00 AM", title: "Arrival & Morning Circle", description: "Students arrive, settle in, and open the day together." },
      { marker: "8:00–10:00 AM", title: "Core Block: Math & English", description: "Small-group instruction in the two subjects that anchor the day." },
      { marker: "12:00–12:45 PM", title: "Lunch & Recreation", description: "A full lunch period with time for outdoor play and community." },
      { marker: "3:00 PM", title: "Dismissal", description: "Staggered pickup with staff supervision until every student is on their way home." },
    ],
  },
  "academics-programs": {
    eyebrow: "Curriculum",
    title: "A curriculum that builds year over year.",
    subtitle: "Each grade layers new rigor and responsibility on a foundation of core subjects.",
    cards: [
      {
        name: "Grade 6 — \"Foundations & Habits\"",
        subjects: ["English Language Arts", "Pre-Algebra Mathematics", "Earth & Life Science", "History", "Faith & Character Formation"],
        differentiator: "A dedicated study-skills block that builds organization and ownership from the very first week.",
      },
      {
        name: "Grade 7 — \"Depth & Analysis\"",
        subjects: ["English Literature & Composition", "Algebra I", "Life & Physical Science", "World Geography & Civics", "Leadership Seminar"],
        differentiator: "Formal research and debate work begins.",
      },
      {
        name: "Grade 8 — \"Readiness & Launch\"",
        subjects: ["Advanced English & Rhetoric", "Algebra I / Geometry Track", "Physical Science & Lab Methods", "U.S. Government & Economics", "High School Placement Prep"],
        differentiator: "One-on-one high school placement counseling, entrance-exam prep, and mock interviews.",
      },
    ],
  },
  "faculty-grid": {
    eyebrow: "Governance",
    title: "Board of Directors.",
    intro: "Guided by a volunteer board of educators, business leaders, and parents committed to responsible stewardship of the mission.",
    members: [
      { name: "New Board Member", role: "Board Chair", bio: "", image: "" },
    ],
  },
  "photo-gallery": {
    eyebrow: "Photo Gallery",
    title: "Take a look around.",
    images: [{ image: "", caption: "Classroom" }],
    linkText: "View the Full Gallery →",
    linkUrl: "/campus",
  },
  "testimonials": {
    eyebrow: "Testimonials",
    title: "Parents notice the difference in weeks, not years.",
    items: [
      { quote: "Within a month, my son went from dreading school to leading his class in morning circle.", name: "Parent Name", role: "Parent of 6th Grader" },
    ],
  },
  "faq-accordion": {
    eyebrow: "FAQ",
    title: "Questions, answered.",
    items: [
      { question: "What is the tuition, and are scholarships available?", answer: "Tuition and scholarship tiers are outlined transparently on our Tuition & Scholarships page." },
    ],
    linkText: "View Full FAQ →",
    linkUrl: "/faq",
  },
  "pricing-tiers": {
    eyebrow: "Tuition & Scholarships",
    title: "Transparent pricing, no surprises.",
    subtitle: "Figures below are illustrative starting points — every family's true cost is confirmed individually.",
    tiers: [
      {
        name: "Standard Tuition",
        price: "$14,200/yr",
        note: "Illustrative figure — contact us for current rates.",
        features: ["Full academic program, grades 6–8", "13-student class cap", "All core materials included"],
        ctaText: "Apply Now",
        ctaUrl: "/admissions",
      },
    ],
    calloutTitle: "Financial aid is a real conversation, not a form letter.",
    calloutBody: "Every scholarship dollar goes directly to tuition support.",
    calloutCtaText: "Start a Scholarship Application",
    calloutCtaUrl: "/contact",
  },
  "cta-cards": {
    cards: [
      { title: "Ready to apply?", description: "Start your child's application today — it takes about fifteen minutes.", ctaText: "Apply Now", ctaUrl: "/admissions", tone: "light" },
      { title: "Want to see it first?", description: "Walk the campus, meet the faculty, and see the small-class ratio in action.", ctaText: "Book a Tour", ctaUrl: "/admissions", tone: "navy" },
    ],
  },
  "cta-banner": {
    title: "Your child's leadership story starts here.",
    primaryCtaText: "Book a Tour",
    primaryCtaUrl: "/admissions",
    secondaryCtaText: "Apply Now",
    secondaryCtaUrl: "/admissions",
  },
  "contact-form-info": {
    formTitle: "Send a Message",
    formSubtitle: "Tell us how we can help.",
    submitText: "Send Message",
    infoTitle: "Reach Us Directly",
    addressLabel: "Campus Address",
    address: "123 Heritage Way, Baton Rouge, LA 70801",
    phoneLabel: "Phone",
    phoneLines: ["(225) 555-0142"],
    emailLabel: "Email",
    email: "admissions@example.com",
    workingDaysLabel: "Office Hours",
    workingDays: "Monday – Friday, 8:00 AM – 4:00 PM",
    departments: ["Admissions", "General Inquiries", "Support & Donations"],
  },
};
