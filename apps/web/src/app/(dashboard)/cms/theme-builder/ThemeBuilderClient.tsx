"use client";

import dynamic from "next/dynamic";

const ThemePageBuilder = dynamic(
  () => import("@/modules/cms/ThemePageBuilder").then((m) => ({ default: m.ThemePageBuilder })),
  { ssr: false },
);

export function ThemeBuilderClient() {
  return <ThemePageBuilder />;
}
