import type { Metadata } from "next";
import { AddProductView } from "@/modules/store/products/AddProductView";

export const metadata: Metadata = { title: "Add Product — Store" };

export default function AddProductPage() {
  return <AddProductView />;
}
