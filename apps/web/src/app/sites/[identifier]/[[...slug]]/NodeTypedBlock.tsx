"use client";

import { resolveThemeBlock } from "@/lib/themes/themeBlockResolver";

export function NodeTypedBlock({
  blockType,
  blockData,
  themeIdentifier,
}: {
  blockType: string;
  blockData: Record<string, unknown>;
  themeIdentifier: string;
}) {
  const Component = resolveThemeBlock(blockType, themeIdentifier);
  if (!Component) return null;
  return <Component data={blockData} />;
}
