import type { Metadata } from "next";
import dynamic from "next/dynamic";

const InventoryView = dynamic(() =>
  import("@/modules/store/inventory/InventoryView").then((m) => ({ default: m.InventoryView }))
);
export const metadata: Metadata = { title: "Inventory — Store" };
export default function InventoryPage() { return <InventoryView />; }
