import type { Metadata } from "next";
import { AddCategoryView } from "@/modules/store/categories/AddCategoryView";

export const metadata: Metadata = { title: "Add Category — Store" };

export default function AddCategoryPage() {
  return <AddCategoryView mode="add" />;
}
