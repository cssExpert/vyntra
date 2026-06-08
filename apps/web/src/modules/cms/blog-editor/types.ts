export type BlogEditorStatus = "draft" | "scheduled" | "published";
export type BlogVisibility = "public" | "private" | "members";

export interface BlogFormState {
  title: string;
  subtitle: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  category: string[];
  readTime: number;
  seoTitle: string;
  seoDesc: string;
  keywords: string;
  status: BlogEditorStatus;
  publishDate: string;
  publishTime: string;
  visibility: BlogVisibility;
  allowComments: boolean;
  isFeatured: boolean;
  pinToTop: boolean;
  author: string;
}

export interface AuthorProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export const AUTHOR_PROFILES: AuthorProfile[] = [
  {
    id: "1",
    name: "Alex Rivera",
    role: "Lead Technical Writer",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: "2",
    name: "Sarah Chen",
    role: "Senior Developer Advocate",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: "3",
    name: "Marcus Johnson",
    role: "Product Manager",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  },
];

export const CATEGORIES = [
  "Technology",
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Career",
  "Tutorials",
  "News",
];

export const PRESET_COVERS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
];

export function emptyBlogForm(): BlogFormState {
  return {
    title: "",
    subtitle: "",
    slug: "",
    content: "",
    excerpt: "",
    coverImage: PRESET_COVERS[0],
    tags: [],
    category: [],
    readTime: 1,
    seoTitle: "",
    seoDesc: "",
    keywords: "",
    status: "draft",
    publishDate: new Date().toISOString().split("T")[0],
    publishTime: "12:00",
    visibility: "public",
    allowComments: true,
    isFeatured: false,
    pinToTop: false,
    author: "1",
  };
}

// Strip HTML tags to plain text (for word/character counts on TipTap HTML).
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function calculateSeoScore(form: BlogFormState): number {
  let score = 0;
  if (form.title.length > 20 && form.title.length < 70) score += 20;
  if (form.excerpt.length > 50 && form.excerpt.length < 160) score += 20;
  if (form.tags.length >= 2) score += 20;
  if (stripHtml(form.content).split(" ").filter(Boolean).length > 200)
    score += 20;
  if (form.keywords.trim() !== "") score += 20;
  return score;
}
