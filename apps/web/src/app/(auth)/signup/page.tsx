import type { Metadata } from "next";
import { SignupPage } from "@/modules/auth/SignupPage";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignupRoute() {
  return <SignupPage />;
}
