import type { Metadata } from "next";
import dynamic from "next/dynamic";

const EditProductView = dynamic(() =>
  import("@/modules/store/products/EditProductView").then((m) => ({ default: m.EditProductView }))
);

export const metadata: Metadata = { title: "Edit Product — Store" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditProductView productId={id} />;
}
