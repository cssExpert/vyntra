import { Suspense } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ThemePageBuilder = dynamic(
  () => import("@/modules/cms/ThemePageBuilder").then((m) => ({ default: m.ThemePageBuilder })),
  { ssr: false },
);

export const metadata: Metadata = { title: "Theme Builder — CMS" };

export default function ThemeBuilderPage() {
  return (
    <Suspense>
      <ThemePageBuilder />
    </Suspense>
  );
}
