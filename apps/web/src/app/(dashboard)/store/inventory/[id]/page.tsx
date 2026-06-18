import type { Metadata } from "next";
import dynamic from "next/dynamic";

const InventoryItemView = dynamic(() =>
  import("@/modules/store/inventory/InventoryItemView").then((m) => ({ default: m.InventoryItemView }))
);

export const metadata: Metadata = { title: "Inventory Item — Store" };

export default async function InventoryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InventoryItemView inventoryId={id} />;
}
