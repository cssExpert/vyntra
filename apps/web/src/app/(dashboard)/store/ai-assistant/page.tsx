import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AIAssistantView = dynamic(() =>
  import("@/modules/store/ai-assistant/AIAssistantView").then((m) => ({ default: m.AIAssistantView }))
);
export const metadata: Metadata = { title: "AI Assistant — Store" };
export default function AIAssistantPage() { return <AIAssistantView />; }
