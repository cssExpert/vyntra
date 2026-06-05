import type { Metadata } from "next";
import { StoreView } from "@/modules/store/StoreView";

export const metadata: Metadata = {
  title: "Store",
};

export default function StorePage() {
  return <StoreView />;
}
