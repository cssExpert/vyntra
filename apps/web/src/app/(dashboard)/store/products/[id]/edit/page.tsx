import type { Metadata } from "next";
import dynamic from "next/dynamic";

const EditProductView = dynamic(() =>
  import("@/modules/store/products/EditProductView").then((m) => ({ default: m.EditProductView }))
);

export const metadata: Metadata = { title: "Edit Product — Store" };

export default function EditProductPage({ params }: { params: { id: string } }) {
  return <EditProductView productId={params.id} />;
}
