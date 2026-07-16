import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CommentsView = dynamic(() =>
  import("@/modules/cms/comments/CommentsView").then((m) => ({
    default: m.CommentsView,
  })),
);

export const metadata: Metadata = { title: "Comments — CMS" };

export default function CmsCommentsPage() {
  return <CommentsView />;
}
