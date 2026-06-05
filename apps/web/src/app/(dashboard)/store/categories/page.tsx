import type { Metadata } from "next";
import { CategoriesView } from "@/modules/store/categories/CategoriesView";
export const metadata: Metadata = { title: "Categories — Store" };
export default function CategoriesPage() { return <CategoriesView />; }
