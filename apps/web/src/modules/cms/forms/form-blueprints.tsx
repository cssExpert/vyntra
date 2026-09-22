import {
  Mail,
  Target,
  Ticket,
  ShoppingCart,
  Star,
  Briefcase,
  MessageSquareText,
  ListChecks,
  HeartHandshake,
  Crown,
  CalendarClock,
  CreditCard,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

import type {
  CmsForm,
  FieldSection,
  FieldType,
  FormField,
  SubmitButtonConfig,
} from "./forms.types";

/**
 * A ready-made starting point for a new form. Blueprints are plain data —
 * their `fields` are real {@link FormField}s so they both render in the picker
 * preview and seed the builder without any conversion.
 */
export interface FormBlueprint {
  id: number;
  /** Stable key used in the `?blueprint=` handoff to the builder. */
  key: string;
  /** Form name (also the preview heading). */
  title: string;
  /** Short one-liner shown in the selector list and as the form description. */
  desc: string;
  /** Icon shown on the selector row. */
  icon: LucideIcon;
  fields: FormField[];
  submitButton?: SubmitButtonConfig;
}

// ── Concise field builders ───────────────────────────────────────────────────

type FieldExtra = Partial<Omit<FormField, "id" | "type" | "label">>;

function f(type: FieldType, label: string, extra: FieldExtra = {}): FormField {
  return {
    id: "", // assigned in makeBlueprint so keys stay stable + unique
    type,
    label,
    placeholder: "",
    helpText: "",
    required: false,
    options: [],
    ...extra,
  };
}

/** Concise section builder for container fields (accordion). */
function section(title: string, fields: FormField[]): FieldSection {
  return { id: "", title, fields };
}

/** A Text block field holding a FAQ answer (display-only rich text). */
function faqAnswer(html: string): FormField {
  return f("long_text", "", { content: `<p>${html}</p>` });
}

/** Recursively assigns stable, blueprint-scoped ids to fields and any nested
 *  container sections/children. */
function assignIds(fields: FormField[], prefix: string): FormField[] {
  return fields.map((field, i) => {
    const id = `${prefix}-${i}`;
    const out: FormField = { ...field, id };
    if (field.sections) {
      out.sections = field.sections.map((s, si) => ({
        ...s,
        id: `${id}-s${si}`,
        fields: assignIds(s.fields, `${id}-s${si}`),
      }));
    }
    return out;
  });
}

/** Assigns stable, blueprint-scoped ids to every field (deep). */
function makeBlueprint(bp: Omit<FormBlueprint, "fields"> & { fields: FormField[] }): FormBlueprint {
  return { ...bp, fields: assignIds(bp.fields, bp.key) };
}

// ── The twelve blueprints ────────────────────────────────────────────────────

export const FORM_BLUEPRINTS: FormBlueprint[] = [
  makeBlueprint({
    id: 1,
    key: "contact-us",
    title: "Contact Us",
    desc: "Inquiry and Communications",
    icon: Mail,
    fields: [
      f("short_text", "Full Name", { required: true, placeholder: "e.g. Alexis Peterson", icon: "user", width: "half" }),
      f("email", "Email Address", { required: true, placeholder: "e.g. alexis@domain.com", icon: "mail", width: "half" }),
      f("phone", "Phone Number", { placeholder: "e.g. +1 (555) 000-0000", icon: "phone", width: "half" }),
      f("short_text", "Company", { placeholder: "e.g. TechCorp Solutions", icon: "building", width: "half" }),
      f("short_text", "Subject", { required: true, placeholder: "How can we assist you today?" }),
      f("textarea", "Message", { required: true, placeholder: "Compose query description…" }),
      f("checkboxes", "", {
        required: true,
        choiceStyle: "terms",
        options: [
          "I agree to the [Terms of Use](https://example.com/terms) and [Privacy Policy](https://example.com/privacy).",
        ],
      }),
    ],
    submitButton: { label: "Send Message", icon: "send", fullWidth: true },
  }),
  makeBlueprint({
    id: 2,
    key: "lead-generation",
    title: "Lead Generation",
    desc: "Enterprise Consultation Route",
    icon: Target,
    fields: [
      f("short_text", "First Name", { required: true, placeholder: "Jordan", icon: "user", width: "half" }),
      f("short_text", "Last Name", { required: true, placeholder: "Rivera", width: "half" }),
      f("email", "Work Email", { required: true, placeholder: "jordan@company.com", icon: "mail", width: "half" }),
      f("phone", "Phone", { placeholder: "+1 (555) 123-4567", icon: "phone", width: "half" }),
      f("short_text", "Company Name", { required: true, placeholder: "Company name", icon: "building", width: "third" }),
      f("dropdown", "Company Size", {
        required: true,
        width: "third",
        options: ["1–10", "11–50", "51–200", "201–1000", "1000+"],
      }),
      f("dropdown", "Industry", {
        width: "third",
        options: ["SaaS", "E-commerce", "Fintech", "Healthcare", "Other"],
      }),
      f("textarea", "What are you looking to solve?", {
        placeholder: "Outline details or technical milestones expected…",
      }),
    ],
    submitButton: { label: "Request Consultation", icon: "arrow", iconPosition: "end", fullWidth: true },
  }),
  makeBlueprint({
    id: 3,
    key: "event-registration",
    title: "Event Registration",
    desc: "Tiered Entry Pass Portal",
    icon: Ticket,
    fields: [
      f("short_text", "First Name", { required: true, placeholder: "John", icon: "user", width: "half" }),
      f("short_text", "Last Name", { required: true, placeholder: "Doe", width: "half" }),
      f("email", "Email Address", { required: true, placeholder: "john.doe@org.com", icon: "mail", width: "half" }),
      f("phone", "Phone", { placeholder: "+1 222-333", icon: "phone", width: "half" }),
      f("multiple_choice", "Ticket Tier", {
        required: true,
        choiceStyle: "cards",
        options: ["Standard", "VIP", "Student"],
        optionDetails: ["$150", "$450", "$45"],
      }),
      f("number", "Number of Guests", { placeholder: "1", icon: "hash", width: "half" }),
      f("dropdown", "Dietary Preference", {
        width: "half",
        options: ["No preference", "Vegetarian", "Vegan", "Halal", "Gluten-free"],
      }),
      f("date", "Session Date", { required: true }),
    ],
    submitButton: { label: "Reserve My Pass", icon: "check", fullWidth: true },
  }),
  makeBlueprint({
    id: 4,
    key: "order-configurator",
    title: "Order Configurator",
    desc: "Invoice checkout mechanism",
    icon: ShoppingCart,
    fields: [
      f("short_text", "Customer Name", { required: true, placeholder: "Jane Smith", icon: "user", width: "third" }),
      f("email", "Email", { required: true, placeholder: "jane@smith.net", icon: "mail", width: "third" }),
      f("phone", "Phone", { placeholder: "+1 888 888", icon: "phone", width: "third" }),
      f("short_text", "Shipping Address", { placeholder: "123 Web Dev Lane, Austin TX", icon: "home" }),
      f("dropdown", "Product", {
        required: true,
        width: "half",
        options: ["Starter", "Pro Laptop", "Enterprise"],
      }),
      f("number", "Quantity", { required: true, placeholder: "1", icon: "hash", width: "half" }),
      f("short_text", "Coupon Code", { placeholder: "e.g. SAVE10", icon: "tag", width: "half" }),
      f("separator", "Payment"),
      f("short_text", "Card Number", { required: true, placeholder: "•••• •••• •••• ••••", icon: "creditCard", mask: "card" }),
    ],
    submitButton: { label: "Place Order", icon: "arrow", iconPosition: "end", fullWidth: true },
  }),
  makeBlueprint({
    id: 5,
    key: "satisfaction-survey",
    title: "Satisfaction Survey",
    desc: "Multivariate star assessments",
    icon: Star,
    fields: [
      f("emoji", "How was your experience?", { required: true }),
      f("rating", "Product Quality", { width: "half" }),
      f("rating", "Support Experience", { width: "half" }),
      f("nps", "How likely are you to recommend us?", { required: true }),
      f("multiple_choice", "Would you recommend us?", {
        choiceStyle: "pills",
        options: ["Yes", "No", "Maybe"],
      }),
      f("short_text", "What did you like most?", { placeholder: "Your feedback" }),
    ],
    submitButton: { label: "Submit Feedback", icon: "check", fullWidth: true },
  }),
  makeBlueprint({
    id: 6,
    key: "job-application",
    title: "Job Application",
    desc: "HR Intake & CV upload",
    icon: Briefcase,
    fields: [
      f("short_text", "Full Name", { required: true, placeholder: "Candidate name", icon: "user", width: "third" }),
      f("email", "Email Address", { required: true, placeholder: "you@domain.com", icon: "mail", width: "third" }),
      f("phone", "Phone Number", { placeholder: "+1 (555) 000-0000", icon: "phone", width: "third" }),
      f("dropdown", "Position", {
        width: "half",
        required: true,
        options: ["Engineering", "Design", "Product", "Marketing", "Sales"],
      }),
      f("short_text", "LinkedIn / Portfolio", { placeholder: "https://", icon: "link", width: "half" }),
      f("file", "Resume / CV", { required: true, helpText: "PDF or DOCX, up to 5 MB." }),
      f("textarea", "Cover Note", { placeholder: "Share a short pitch detailing your career achievements…" }),
    ],
    submitButton: { label: "Submit Application", icon: "send", fullWidth: true },
  }),
  makeBlueprint({
    id: 7,
    key: "staff-feedback",
    title: "Staff Feedback",
    desc: "Department performance checks",
    icon: MessageSquareText,
    fields: [
      f("rating", "Overall Rating", { width: "half" }),
      f("dropdown", "Department", {
        required: true,
        width: "half",
        options: ["Engineering", "Design", "Operations", "People", "Finance"],
      }),
      f("textarea", "What's working well?", { placeholder: "Highlights", width: "half" }),
      f("textarea", "What could improve?", { placeholder: "Suggestions", width: "half" }),
      f("checkboxes", "", { options: ["Submit this feedback anonymously"] }),
    ],
    submitButton: { label: "Send Feedback", icon: "send", fullWidth: true },
  }),
  makeBlueprint({
    id: 8,
    key: "technical-quiz",
    title: "Technical Quiz",
    desc: "Automated checkbox validator",
    icon: ListChecks,
    fields: [
      f("short_text", "Your Name", { placeholder: "Name" }),
      f("multiple_choice", "Which is a JavaScript runtime?", {
        required: true,
        options: ["Node.js", "React", "Webpack", "ESLint"],
      }),
      f("checkboxes", "Select all valid HTTP methods", {
        required: true,
        options: ["GET", "PUSH", "DELETE", "FETCH"],
      }),
      f("dropdown", "Big-O of binary search?", {
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      }),
    ],
    submitButton: { label: "Submit Answers", icon: "check", fullWidth: true },
  }),
  makeBlueprint({
    id: 9,
    key: "donation-platform",
    title: "Donation Platform",
    desc: "Sub-tier checkout gateway",
    icon: HeartHandshake,
    fields: [
      f("multiple_choice", "Donation Amount", {
        required: true,
        choiceStyle: "pills",
        options: ["$10", "$25", "$50", "$100", "Custom"],
        allowCustom: true,
        customOption: "Custom",
        customLabel: "Custom Amount ($)",
        customPlaceholder: "Enter customized dollar amount",
      }),
      f("short_text", "Full Name", { required: true, placeholder: "Donor name", icon: "user", width: "half" }),
      f("email", "Email Address", { required: true, placeholder: "you@domain.com", icon: "mail", width: "half" }),
      f("checkboxes", "", { options: ["Make this a monthly donation"] }),
      f("textarea", "Message of Support", { placeholder: "Include encouragement words or terms directions…" }),
    ],
    submitButton: { label: "Donate Now", icon: "sparkles", fullWidth: true },
  }),
  makeBlueprint({
    id: 10,
    key: "premium-subscription",
    title: "Premium Subscription",
    desc: "Pricing scale deployment",
    icon: Crown,
    fields: [
      f("multiple_choice", "Subscription Tier", {
        required: true,
        choiceStyle: "cards",
        options: ["Free", "Pro", "Enterprise"],
        optionDetails: ["$0 · Core libraries", "$49/mo · Expanded scale", "$299/mo · Custom SLO"],
      }),
      f("multiple_choice", "Billing Cycle", {
        required: true,
        choiceStyle: "segmented",
        width: "half",
        options: ["Monthly", "Annual (save 15%)"],
      }),
      f("short_text", "Promo / Coupon Code", { placeholder: "e.g. NEWPROMO", icon: "tag", width: "half" }),
      f("email", "Account Email", { required: true, placeholder: "you@domain.com", icon: "mail", width: "half" }),
      f("short_text", "Cardholder Name", { placeholder: "Name on card", icon: "user", width: "half" }),
    ],
    submitButton: { label: "Subscribe", icon: "arrow", iconPosition: "end", fullWidth: true },
  }),
  makeBlueprint({
    id: 11,
    key: "appointment-booking",
    title: "Appointment Booking",
    desc: "Dynamic timing scheduling",
    icon: CalendarClock,
    fields: [
      f("short_text", "Full Name", { required: true, placeholder: "Your name", icon: "user", width: "third" }),
      f("email", "Email Address", { required: true, placeholder: "you@domain.com", icon: "mail", width: "third" }),
      f("phone", "Phone Number", { placeholder: "+1 (555) 000-0000", icon: "phone", width: "third" }),
      f("dropdown", "Service", {
        width: "half",
        required: true,
        options: ["Consultation", "Demo", "Support Session", "Onboarding"],
      }),
      f("date", "Preferred Date", { required: true, width: "half" }),
      f("dropdown", "Preferred Time", {
        width: "half",
        options: ["Morning", "Afternoon", "Evening"],
      }),
      f("textarea", "Notes", { placeholder: "Anything we should know?" }),
    ],
    submitButton: { label: "Book Appointment", icon: "check", fullWidth: true },
  }),
  makeBlueprint({
    id: 12,
    key: "pay-gateway",
    title: "Pay Gateway",
    desc: "Encrypted credit-card mirrors",
    icon: CreditCard,
    fields: [
      f("card_preview", "Alexis Peterson"),
      f("short_text", "Full Name", { required: true, placeholder: "Name on card", icon: "user", width: "half" }),
      f("email", "Email Address", { required: true, placeholder: "receipt@domain.com", icon: "mail", width: "half" }),
      f("number", "Amount (USD)", { required: true, placeholder: "0.00", icon: "dollar" }),
      f("separator", "Card Details"),
      f("short_text", "Card Number", { required: true, placeholder: "•••• •••• •••• ••••", icon: "creditCard", width: "third", mask: "card" }),
      f("short_text", "Expiry", { required: true, placeholder: "MM / YY", width: "third", mask: "expiry" }),
      f("password", "CVC", { required: true, placeholder: "•••", passwordToggle: false, width: "third", mask: "cvc" }),
    ],
    submitButton: { label: "Pay Securely", icon: "check", fullWidth: true },
  }),
  makeBlueprint({
    id: 13,
    key: "faq",
    title: "FAQ",
    desc: "Collapsible questions & answers",
    icon: HelpCircle,
    fields: [
      f("accordion", "", {
        accordionStyle: "flush",
        sections: [
          section("What is a FAQ list?", [
            faqAnswer(
              "A FAQ is a curated list of questions and answers designed to address aspects of a topic that are important, often unknown or misunderstood. It is an acronym that expands to “frequently asked question” or “frequently asked questions”. While either expansion implies that questions are often asked, they generally are not.",
            ),
          ]),
          section("What is a good FAQ?", [
            faqAnswer(
              "FAQs should ideally be limited to 10 questions and answers. If more than 10 questions are needed, group similar questions under headers. Photography is not needed on FAQ pages.",
            ),
          ]),
          section("What is FAQ in phone?", [
            faqAnswer(
              "On phones a FAQ is usually a collapsible accordion — each question expands to reveal its answer, saving space on small screens.",
            ),
          ]),
          section("एफएक्यू लिस्ट क्या है?", [
            faqAnswer(
              "एफएक्यू (FAQ) एक ऐसी सूची है जिसमें किसी विषय से जुड़े आम सवाल और उनके जवाब दिए जाते हैं।",
            ),
          ]),
          section("व्हाट इस ए गुड एफएक्यू?", [
            faqAnswer(
              "एक अच्छा एफएक्यू संक्षिप्त और स्पष्ट होता है, और सबसे ज़्यादा पूछे जाने वाले सवालों के सीधे जवाब देता है।",
            ),
          ]),
          section("What is general FAQ?", [
            faqAnswer(
              "A general FAQ covers broad, commonly asked questions about a product, service, or topic rather than one specific area.",
            ),
          ]),
          section("What is a FAQ machine?", [
            faqAnswer(
              "“FAQ machine” informally refers to a tool or bot that automatically generates or answers frequently asked questions.",
            ),
          ]),
          section("What is FAQ data?", [
            faqAnswer(
              "FAQ data is the structured set of question-and-answer pairs, often used to power search, chatbots, or SEO schema markup.",
            ),
          ]),
          section("What is the FAQ exam?", [
            faqAnswer(
              "There is no standard “FAQ exam” — the phrase usually means reviewing a FAQ to prepare for the common questions on a subject.",
            ),
          ]),
        ],
      }),
    ],
    submitButton: { hidden: true },
  }),
];

export function getBlueprint(key: string | null | undefined): FormBlueprint | undefined {
  if (!key) return undefined;
  return FORM_BLUEPRINTS.find((b) => b.key === key);
}

/**
 * Builds a full {@link CmsForm} from a blueprint — for the picker preview, or to
 * seed the builder. Pass `freshIds` when seeding so the created form's fields
 * get unique, builder-style ids instead of the shared blueprint keys.
 */
let cloneCounter = 0;

/** Deep-clones fields, optionally regenerating unique ids (incl. nested sections). */
function cloneFields(fields: FormField[], fresh: boolean): FormField[] {
  return fields.map((field) => {
    const out: FormField = {
      ...field,
      options: [...field.options],
      id: fresh ? `fld_${Date.now()}_${cloneCounter++}` : field.id,
    };
    if (field.optionDetails) out.optionDetails = [...field.optionDetails];
    if (field.sections) {
      out.sections = field.sections.map((s) => ({
        ...s,
        id: fresh ? `sec_${Date.now()}_${cloneCounter++}` : s.id,
        fields: cloneFields(s.fields, fresh),
      }));
    }
    return out;
  });
}

export function blueprintToForm(
  bp: FormBlueprint,
  opts: { freshIds?: boolean } = {},
): CmsForm {
  const now = new Date().toISOString();
  const fields = cloneFields(bp.fields, !!opts.freshIds);
  return {
    id: "",
    name: bp.title,
    description: bp.desc,
    slug: "",
    status: "Draft",
    fields,
    captchaEnabled: false,
    submitButton: bp.submitButton ?? null,
    settings: null,
    responses: 0,
    createdAt: now,
    updatedAt: now,
  };
}
