import type { Metadata } from "next";
import dynamic from "next/dynamic";

const InventoryItemView = dynamic(() =>
  import("@/modules/store/inventory/InventoryItemView").then((m) => ({ default: m.InventoryItemView }))
);

export const metadata: Metadata = { title: "Inventory Item — Store" };

export default function InventoryItemPage({ params }: { params: { id: string } }) {
  return <InventoryItemView inventoryId={params.id} />;
}
