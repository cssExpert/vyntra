import type { Metadata } from "next";
import { AutomationsView } from "@/modules/store/automations/AutomationsView";
export const metadata: Metadata = { title: "Automations — Store" };
export default function AutomationsPage() { return <AutomationsView />; }
