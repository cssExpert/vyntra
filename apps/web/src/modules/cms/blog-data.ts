export type BlogStatus = "Public" | "Draft" | "Scheduled" | "Private";

export interface CmsBlog {
  id: string;
  title: string;
  slug: string;
  author: string;
  status: BlogStatus;
  createdAt: string;
  publishedAt: string;
}

export const INITIAL_BLOGS: CmsBlog[] = [
  { id: "1", title: "We bring you the best by working Office", slug: "best-by-working-office", author: "Test Comp", status: "Public", createdAt: "05-26-2026", publishedAt: "06-01-2026" },
  { id: "2", title: "Open The Gates For Lorem", slug: "open-the-gates-for-lorem", author: "Test Comp", status: "Public", createdAt: "05-26-2026", publishedAt: "06-01-2026" },
  { id: "3", title: "Top 10 Online Shopping Tips for Smart Buyers", slug: "online-shopping-tips", author: "Test Comp", status: "Public", createdAt: "05-26-2026", publishedAt: "06-01-2026" },
  { id: "4", title: "The Best Ways to Do Market Research For Your Business Plan", slug: "market-research-business-plan", author: "Test Comp", status: "Public", createdAt: "05-26-2026", publishedAt: "06-01-2026" },
  { id: "5", title: "Mistakes To Avoid While Writing A Blog Post", slug: "mistakes-writing-blog-post", author: "Test Comp", status: "Public", createdAt: "05-26-2026", publishedAt: "06-01-2026" },
  { id: "6", title: "How to Scale Your Startup in 2026", slug: "scale-startup-2026", author: "Ravi Gupta", status: "Draft", createdAt: "05-28-2026", publishedAt: "05-30-2026" },
  { id: "7", title: "A Complete Guide to Modern SEO", slug: "complete-guide-modern-seo", author: "Ravi Gupta", status: "Public", createdAt: "05-29-2026", publishedAt: "06-01-2026" },
  { id: "8", title: "Building a Brand That Lasts", slug: "building-brand-that-lasts", author: "Vasudev Sharma", status: "Private", createdAt: "05-30-2026", publishedAt: "05-30-2026" },
  { id: "9", title: "Email Marketing Strategies That Convert", slug: "email-marketing-strategies", author: "Vasudev Sharma", status: "Draft", createdAt: "06-01-2026", publishedAt: "06-01-2026" },
  { id: "10", title: "The Future of Remote Work", slug: "future-of-remote-work", author: "Ravi Gupta", status: "Public", createdAt: "06-01-2026", publishedAt: "06-01-2026" },
  { id: "11", title: "Customer Retention Done Right", slug: "customer-retention", author: "Test Comp", status: "Private", createdAt: "06-01-2026", publishedAt: "06-01-2026" },
  { id: "12", title: "Designing for Accessibility", slug: "designing-for-accessibility", author: "Vasudev Sharma", status: "Public", createdAt: "06-01-2026", publishedAt: "06-01-2026" },
];

export function getBlogById(id: string): CmsBlog | undefined {
  return INITIAL_BLOGS.find((b) => b.id === id);
}
