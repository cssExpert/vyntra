import type { Metadata } from "next";
import { AddCategoryView } from "@/modules/store/categories/AddCategoryView";

export const metadata: Metadata = { title: "Edit Category — Store" };

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  return <AddCategoryView mode="edit" categoryId={params.id} />;
}
