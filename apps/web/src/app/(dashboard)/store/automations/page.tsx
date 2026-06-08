import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AutomationsView = dynamic(() =>
  import("@/modules/store/automations/AutomationsView").then((m) => ({ default: m.AutomationsView }))
);
export const metadata: Metadata = { title: "Automations — Store" };
export default function AutomationsPage() { return <AutomationsView />; }
