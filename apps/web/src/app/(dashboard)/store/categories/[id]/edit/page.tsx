import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AddCategoryView = dynamic(() =>
  import("@/modules/store/categories/AddCategoryView").then((m) => ({ default: m.AddCategoryView }))
);

export const metadata: Metadata = { title: "Edit Category — Store" };

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  return <AddCategoryView mode="edit" categoryId={params.id} />;
}
