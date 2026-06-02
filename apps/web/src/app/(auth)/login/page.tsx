import type { Metadata } from "next";
import { LoginPage } from "@/modules/auth/LoginPage";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginRoute() {
  return <LoginPage />;
}
