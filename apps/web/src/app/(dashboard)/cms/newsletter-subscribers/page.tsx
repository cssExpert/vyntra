import type { Metadata } from "next";
import dynamic from "next/dynamic";

const NewsletterSubscribersView = dynamic(() =>
  import("@/modules/cms/newsletter-subscribers/NewsletterSubscribersView").then((m) => ({
    default: m.NewsletterSubscribersView,
  })),
);

export const metadata: Metadata = { title: "Newsletter Subscribers — CMS" };

export default function CmsNewsletterSubscribersPage() {
  return <NewsletterSubscribersView />;
}
