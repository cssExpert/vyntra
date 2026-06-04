import type { Metadata } from "next";
import { MailView } from "@/modules/mail/MailView";

export const metadata: Metadata = { title: "Mail" };

export default function MailPage() {
  return <MailView />;
}
