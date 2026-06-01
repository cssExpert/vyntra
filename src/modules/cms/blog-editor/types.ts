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
  category: string;
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
    category: "Technology",
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
  if (form.content.split(" ").length > 200) score += 20;
  if (form.keywords.trim() !== "") score += 20;
  return score;
}

// Minimal, dependency-free Markdown → HTML for the live preview.
export function parseMarkdownToHTML(mdText: string): string {
  if (!mdText)
    return "<p class='text-muted-foreground italic'>Write copy in the editor to preview formatting…</p>";

  let html = mdText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(
    /^# (.*?)$/gm,
    '<h1 class="text-2xl font-bold mt-5 mb-3 text-foreground">$1</h1>',
  );
  html = html.replace(
    /^## (.*?)$/gm,
    '<h2 class="text-xl font-semibold mt-4 mb-2 text-foreground">$1</h2>',
  );
  html = html.replace(
    /^### (.*?)$/gm,
    '<h3 class="text-lg font-medium mt-3 mb-1 text-foreground">$1</h3>',
  );

  html = html.replace(
    /```(javascript|css|html|typescript|json)?([\s\S]*?)```/gm,
    (_match, lang, code) =>
      `<pre class="bg-muted text-foreground p-3.5 rounded-xl my-3 font-mono text-xs overflow-x-auto border border-border"><div class="flex justify-between items-center text-[10px] text-muted-foreground mb-1.5 border-b border-border pb-1"><span>${lang || "code"}</span><span>SYNTAX</span></div><code>${code.trim()}</code></pre>`,
  );

  html = html.replace(
    /`(.*?)`/g,
    '<code class="bg-muted text-primary px-1 py-0.5 rounded font-mono text-xs">$1</code>',
  );
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(
    /^\* (.*?)$/gm,
    '<li class="ml-5 list-disc text-muted-foreground">$1</li>',
  );
  html = html.replace(
    /^- (.*?)$/gm,
    '<li class="ml-5 list-disc text-muted-foreground">$1</li>',
  );

  const lines = html.split("\n");
  let output = "";
  let inList = false;

  lines.forEach((line) => {
    if (line.startsWith("<li")) {
      if (!inList) {
        output += '<ul class="space-y-1 my-2">';
        inList = true;
      }
      output += line;
    } else {
      if (inList) {
        output += "</ul>";
        inList = false;
      }
      if (
        line.trim() !== "" &&
        !line.startsWith("<h") &&
        !line.startsWith("<pre") &&
        !line.startsWith("</pre") &&
        !line.startsWith("<code>") &&
        !line.startsWith("</code>")
      ) {
        output += `<p class="my-2 text-muted-foreground leading-relaxed text-sm">${line}</p>`;
      } else {
        output += line;
      }
    }
  });

  if (inList) output += "</ul>";
  return output;
}
