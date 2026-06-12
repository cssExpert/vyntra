import type { TypedBlock } from "./types";

/** Detect if content JSON is a typed block array (new format) vs legacy EditorNode tree */
export function parseTypedBlocks(content: string | null): TypedBlock[] | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      typeof parsed[0]?.type === "string" &&
      typeof parsed[0]?.id === "string" &&
      "data" in parsed[0]
    ) {
      return parsed as TypedBlock[];
    }
  } catch {
    // not JSON
  }
  return null;
}
