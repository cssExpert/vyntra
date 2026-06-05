import type { Metadata } from "next";
import { StoreCreditsView } from "@/modules/store/credits/StoreCreditsView";
export const metadata: Metadata = { title: "Store Credits" };
export default function CreditsPage() { return <StoreCreditsView />; }
