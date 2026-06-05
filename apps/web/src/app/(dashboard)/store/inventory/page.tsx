import type { Metadata } from "next";
import { InventoryView } from "@/modules/store/inventory/InventoryView";
export const metadata: Metadata = { title: "Inventory — Store" };
export default function InventoryPage() { return <InventoryView />; }
