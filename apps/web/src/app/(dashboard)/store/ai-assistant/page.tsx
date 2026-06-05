import type { Metadata } from "next";
import { AIAssistantView } from "@/modules/store/ai-assistant/AIAssistantView";
export const metadata: Metadata = { title: "AI Assistant — Store" };
export default function AIAssistantPage() { return <AIAssistantView />; }
