import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CategoriesView = dynamic(() =>
  import("@/modules/store/categories/CategoriesView").then((m) => ({ default: m.CategoriesView }))
);
export const metadata: Metadata = { title: "Categories — Store" };
export default function CategoriesPage() { return <CategoriesView />; }
