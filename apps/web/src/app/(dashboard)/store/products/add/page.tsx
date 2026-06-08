import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AddProductView = dynamic(() =>
  import("@/modules/store/products/AddProductView").then((m) => ({ default: m.AddProductView }))
);

export const metadata: Metadata = { title: "Add Product — Store" };

export default function AddProductPage() {
  return <AddProductView />;
}
