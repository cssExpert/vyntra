import type { ParsedPrompt, StandardPage, WebsiteStyle, WebsiteLayout } from "@/types/ai-studio";

interface BusinessProfile {
  keywords: string[];
  type: string;
  industry: string;
  goal: string;
  audience: string;
  description: string;
  pages: StandardPage[];
  style: WebsiteStyle;
  layout: WebsiteLayout;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

const PROFILES: BusinessProfile[] = [
  {
    keywords: ["dental", "dentist", "orthodonti", "oral", "teeth"],
    type: "Dental Clinic", industry: "Healthcare", goal: "Generate Leads",
    audience: "Local patients seeking dental care",
    description: "Professional dental clinic providing comprehensive oral healthcare services",
    pages: ["home", "about", "services", "contact"],
    style: "modern", layout: "service-business",
    primaryColor: "#0ea5e9", secondaryColor: "#7dd3fc", accentColor: "#0284c7",
  },
  {
    keywords: ["law", "lawyer", "attorney", "legal", "litigation", "counsel"],
    type: "Law Firm", industry: "Legal Services", goal: "Generate Leads",
    audience: "Individuals and businesses needing legal counsel",
    description: "Experienced law firm providing expert legal representation and counsel",
    pages: ["home", "about", "services", "faq", "contact"],
    style: "corporate", layout: "service-business",
    primaryColor: "#1e293b", secondaryColor: "#475569", accentColor: "#c69b4a",
  },
  {
    keywords: ["real estate", "realt", "property", "homes for sale", "housing", "agent"],
    type: "Real Estate Agency", industry: "Real Estate", goal: "Generate Leads",
    audience: "Home buyers, sellers, and real estate investors",
    description: "Premier real estate agency helping clients buy, sell, and invest in properties",
    pages: ["home", "about", "services", "portfolio", "contact"],
    style: "luxury", layout: "service-business",
    primaryColor: "#7c3aed", secondaryColor: "#a78bfa", accentColor: "#c4b5fd",
  },
  {
    keywords: ["restaurant", "cafe", "bistro", "eatery", "dining", "pizza", "sushi", "burger", "food"],
    type: "Restaurant", industry: "Food & Beverage", goal: "Drive Reservations",
    audience: "Local diners and food enthusiasts",
    description: "Exceptional dining experience with fresh ingredients and memorable atmosphere",
    pages: ["home", "about", "services", "contact"],
    style: "creative", layout: "service-business",
    primaryColor: "#dc2626", secondaryColor: "#f87171", accentColor: "#fbbf24",
  },
  {
    keywords: ["marketing", "digital agency", "branding", "advertising", "social media", "seo agency"],
    type: "Marketing Agency", industry: "Marketing & Advertising", goal: "Showcase Portfolio",
    audience: "Businesses looking to grow their brand and digital presence",
    description: "Creative marketing agency delivering data-driven strategies and exceptional results",
    pages: ["home", "about", "services", "portfolio", "blog", "contact"],
    style: "creative", layout: "service-business",
    primaryColor: "#8b5cf6", secondaryColor: "#a78bfa", accentColor: "#ec4899",
  },
  {
    keywords: ["gym", "fitness", "crossfit", "yoga", "pilates", "training", "wellness", "sport"],
    type: "Gym & Fitness Center", industry: "Health & Fitness", goal: "Sell Memberships",
    audience: "Health-conscious individuals seeking fitness solutions",
    description: "State-of-the-art fitness facility with expert trainers and comprehensive programs",
    pages: ["home", "about", "services", "pricing", "contact"],
    style: "startup", layout: "service-business",
    primaryColor: "#16a34a", secondaryColor: "#4ade80", accentColor: "#facc15",
  },
  {
    keywords: ["saas", "software", "platform", "startup", "tech", "app", "tool", "dashboard"],
    type: "SaaS Startup", industry: "Technology", goal: "Drive Sign-ups",
    audience: "Businesses and professionals looking for software solutions",
    description: "Innovative software platform helping teams work smarter and achieve more",
    pages: ["home", "about", "services", "pricing", "blog", "contact"],
    style: "startup", layout: "saas",
    primaryColor: "#6366f1", secondaryColor: "#818cf8", accentColor: "#06b6d4",
  },
  {
    keywords: ["ecommerce", "e-commerce", "shop", "store", "luxury", "jewelry", "fashion", "retail", "boutique"],
    type: "E-commerce Store", industry: "Retail & E-commerce", goal: "Drive Sales",
    audience: "Online shoppers seeking quality products",
    description: "Premium online store offering curated products with an exceptional shopping experience",
    pages: ["home", "about", "services", "portfolio", "contact"],
    style: "luxury", layout: "ecommerce",
    primaryColor: "#b45309", secondaryColor: "#d97706", accentColor: "#92400e",
  },
  {
    keywords: ["hotel", "resort", "accommodation", "hospitality", "bed and breakfast", "motel"],
    type: "Hotel & Hospitality", industry: "Hospitality & Tourism", goal: "Drive Bookings",
    audience: "Travelers seeking quality accommodation",
    description: "Luxurious accommodation delivering exceptional service and unforgettable experiences",
    pages: ["home", "about", "services", "portfolio", "contact"],
    style: "luxury", layout: "service-business",
    primaryColor: "#0891b2", secondaryColor: "#67e8f9", accentColor: "#c4a35a",
  },
  {
    keywords: ["clinic", "medical", "doctor", "health", "hospital", "therapy", "physio", "chiro"],
    type: "Medical Clinic", industry: "Healthcare", goal: "Generate Leads",
    audience: "Patients seeking quality medical care",
    description: "Comprehensive medical clinic providing expert healthcare with a patient-first approach",
    pages: ["home", "about", "services", "faq", "contact"],
    style: "modern", layout: "service-business",
    primaryColor: "#0f766e", secondaryColor: "#5eead4", accentColor: "#0284c7",
  },
  {
    keywords: ["salon", "beauty", "hair", "spa", "barber", "nail", "skincare", "aesthetics"],
    type: "Beauty Salon", industry: "Beauty & Wellness", goal: "Drive Bookings",
    audience: "Individuals seeking beauty and wellness services",
    description: "Premier beauty salon offering expert treatments in a luxurious environment",
    pages: ["home", "about", "services", "pricing", "contact"],
    style: "luxury", layout: "service-business",
    primaryColor: "#be185d", secondaryColor: "#f9a8d4", accentColor: "#831843",
  },
  {
    keywords: ["school", "academy", "education", "tutoring", "learning", "training", "course", "coaching"],
    type: "Education & Training", industry: "Education", goal: "Generate Enrolments",
    audience: "Students, parents, and lifelong learners",
    description: "Excellence in education, empowering students to reach their full potential",
    pages: ["home", "about", "services", "pricing", "contact"],
    style: "modern", layout: "service-business",
    primaryColor: "#1d4ed8", secondaryColor: "#60a5fa", accentColor: "#fbbf24",
  },
];

const DEFAULT_PROFILE: BusinessProfile = {
  keywords: [], type: "Business", industry: "Professional Services", goal: "Generate Leads",
  audience: "Potential clients and customers",
  description: "Professional business providing quality services",
  pages: ["home", "about", "services", "contact"],
  style: "modern", layout: "service-business",
  primaryColor: "#6366f1", secondaryColor: "#8b5cf6", accentColor: "#06b6d4",
};

const LOCATIONS = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma",
  "Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee",
  "Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
  "Los Angeles","New York City","Chicago","Houston","Phoenix","Philadelphia","San Antonio",
  "San Diego","Dallas","San Jose","Austin","Jacksonville","Miami","Seattle","Denver",
  "Nashville","Boston","Las Vegas","Atlanta","Minneapolis","Portland","Detroit",
  "London","Dubai","Toronto","Sydney","Singapore","Mumbai","Berlin","Paris",
];

export function parsePrompt(prompt: string): ParsedPrompt {
  const lower = prompt.toLowerCase();

  const profile = PROFILES.find((p) => p.keywords.some((k) => lower.includes(k))) ?? DEFAULT_PROFILE;
  const location = LOCATIONS.find((l) => lower.includes(l.toLowerCase())) ?? "";

  return {
    businessType: profile.type,
    industry: profile.industry,
    location,
    goal: profile.goal,
    targetAudience: profile.audience,
    description: profile.description + (location ? ` in ${location}` : ""),
    suggestedPages: profile.pages,
    suggestedStyle: profile.style,
    suggestedLayout: profile.layout,
    primaryColor: profile.primaryColor,
    secondaryColor: profile.secondaryColor,
    accentColor: profile.accentColor,
  };
}

export const EXAMPLE_PROMPTS = [
  { label: "Dental Clinic", prompt: "Create a website for a Dental Clinic in Texas" },
  { label: "Law Firm", prompt: "Create a website for a Law Firm in New York" },
  { label: "Real Estate", prompt: "Create a website for a Real Estate Agency in California" },
  { label: "Restaurant", prompt: "Create a website for a Fine Dining Restaurant in Chicago" },
  { label: "Marketing Agency", prompt: "Create a website for a Digital Marketing Agency" },
  { label: "Gym", prompt: "Create a website for a Fitness Gym in Miami" },
  { label: "SaaS Startup", prompt: "Create a website for a SaaS Startup" },
  { label: "E-commerce", prompt: "Create a website for a Luxury Jewelry Store" },
];
