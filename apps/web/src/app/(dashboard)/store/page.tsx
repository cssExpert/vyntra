import type { Metadata } from "next";
import dynamic from "next/dynamic";

const StoreView = dynamic(() =>
  import("@/modules/store/StoreView").then((m) => ({ default: m.StoreView }))
);

export const metadata: Metadata = {
  title: "Store",
};

export default function StorePage() {
  return <StoreView />;
}
