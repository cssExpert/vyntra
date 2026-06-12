"use client";

import type { ReactNode } from "react";
import type { TypedBlock } from "@/lib/themes/types";
import { resolveThemeBlock } from "@/lib/themes/themeBlockResolver";

function renderBlock(block: TypedBlock, themeIdentifier: string): ReactNode {
  const Component = resolveThemeBlock(block.type, themeIdentifier);
  if (!Component) return null;
  return <Component key={block.id} data={block.data as never} />;
}

export function BlockRenderer({
  blocks,
  themeIdentifier = "shopingo",
}: {
  blocks: TypedBlock[];
  themeIdentifier?: string;
}) {
  if (!blocks.length) return null;
  return (
    <>
      {blocks.map((block) => renderBlock(block, themeIdentifier))}
    </>
  );
}

export { parseTypedBlocks } from "@/lib/themes/parseTypedBlocks";
