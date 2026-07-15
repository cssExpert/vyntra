import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ContactRequestsView = dynamic(() =>
  import("@/modules/cms/contact-requests/ContactRequestsView").then((m) => ({
    default: m.ContactRequestsView,
  })),
);

export const metadata: Metadata = { title: "Contact Requests — CMS" };

export default function CmsContactRequestsPage() {
  return <ContactRequestsView />;
}
