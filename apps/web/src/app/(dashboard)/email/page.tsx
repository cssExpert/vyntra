import type { Metadata } from "next";
import { EmailView } from "@/modules/email/EmailView";

export const metadata: Metadata = {
  title: "Email Automation",
};

export default function CRMPage() {
  return <EmailView />;
}
