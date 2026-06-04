export type GalleryStatus = "published" | "draft";
export type ViewMode = "grid" | "table";
export type SortKey = "newest" | "oldest" | "items" | "views" | "alphabetical";

export interface Gallery {
  id: string;
  title: string;
  description: string;
  category: string;
  itemCount: number;
  createdAt: string;
  status: GalleryStatus;
  coverUrl: string;
  tags: string[];
  views: number;
}

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export interface GalleryStats {
  total: number;
  published: number;
  drafts: number;
  totalViews: number;
  totalItems: number;
}
