export type CommentStatus = "PENDING" | "APPROVED" | "REJECTED";
export type CommentResourceType = "blog" | "page" | "product";

export interface Comment {
  id: string;
  resourceType: CommentResourceType;
  resourceId: string;
  parentId: string | null;
  body: string;
  rating: number | null;
  status: CommentStatus;
  authorName: string | null;
  authorEmail: string | null;
  userId: string | null;
  organizationId: string;
  createdAt: string; // ISO date
  updatedAt: string;
  resourceTitle: string | null;
  resourceSlug: string | null;
}
