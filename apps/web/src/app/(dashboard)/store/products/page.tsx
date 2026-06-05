import type { Metadata } from "next";
import { ProductsView } from "@/modules/store/products/ProductsView";
export const metadata: Metadata = { title: "Products — Store" };
export default function ProductsPage() { return <ProductsView />; }
