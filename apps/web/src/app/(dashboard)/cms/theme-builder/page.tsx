import { Suspense } from "react";
import type { Metadata } from "next";
import { ThemeBuilderClient } from "./ThemeBuilderClient";

export const metadata: Metadata = { title: "Theme Builder — CMS" };

export default function ThemeBuilderPage() {
  return (
    <Suspense>
      <ThemeBuilderClient />
    </Suspense>
  );
}
