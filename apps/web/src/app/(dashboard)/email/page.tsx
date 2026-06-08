import type { Metadata } from "next";
import dynamic from "next/dynamic";

const EmailView = dynamic(() =>
  import("@/modules/email/EmailView").then((m) => ({ default: m.EmailView }))
);

export const metadata: Metadata = {
  title: "Email Automation",
};

export default function CRMPage() {
  return <EmailView />;
}
