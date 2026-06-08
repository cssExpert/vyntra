import type { Metadata } from "next";
import dynamic from "next/dynamic";

const MailView = dynamic(() =>
  import("@/modules/mail/MailView").then((m) => ({ default: m.MailView }))
);

export const metadata: Metadata = { title: "Mail" };

export default function MailPage() {
  return <MailView />;
}
