import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ProductsView = dynamic(() =>
  import("@/modules/store/products/ProductsView").then((m) => ({ default: m.ProductsView }))
);
export const metadata: Metadata = { title: "Products — Store" };
export default function ProductsPage() { return <ProductsView />; }
