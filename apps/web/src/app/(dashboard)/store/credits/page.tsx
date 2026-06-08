import type { Metadata } from "next";
import dynamic from "next/dynamic";

const StoreCreditsView = dynamic(() =>
  import("@/modules/store/credits/StoreCreditsView").then((m) => ({ default: m.StoreCreditsView }))
);
export const metadata: Metadata = { title: "Store Credits" };
export default function CreditsPage() { return <StoreCreditsView />; }
