"use client";

import { resolveThemeBlock } from "@/lib/themes/themeBlockResolver";

export function NodeTypedBlock({
  blockType,
  blockData,
  themeIdentifier,
  orgId,
}: {
  blockType: string;
  blockData: Record<string, unknown>;
  themeIdentifier: string;
  orgId?: string;
}) {
  const Component = resolveThemeBlock(blockType, themeIdentifier);
  if (!Component) return null;
  return <Component data={blockData} orgId={orgId} />;
}
