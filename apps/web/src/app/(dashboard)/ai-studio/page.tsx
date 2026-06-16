import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AIStudioView = dynamic(() =>
  import("@/modules/ai-studio/AIStudioView").then((m) => ({ default: m.AIStudioView })),
);

export const metadata: Metadata = { title: "ERV Studio" };

export default function AIStudioPage() {
  return <AIStudioView />;
}
