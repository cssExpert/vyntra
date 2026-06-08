import type { Metadata } from "next";
import { ForgotPasswordPage } from "@/modules/auth/ForgotPasswordPage";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
