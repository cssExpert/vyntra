import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ProductDetailsView = dynamic(() =>
  import("@/modules/store/products/ProductDetailsView").then((m) => ({ default: m.ProductDetailsView }))
);

export const metadata: Metadata = { title: "Product Details — Store" };

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  return <ProductDetailsView productId={params.id} />;
}
