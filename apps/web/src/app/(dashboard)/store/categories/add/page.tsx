import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AddCategoryView = dynamic(() =>
  import("@/modules/store/categories/AddCategoryView").then((m) => ({ default: m.AddCategoryView }))
);

export const metadata: Metadata = { title: "Add Category — Store" };

export default function AddCategoryPage() {
  return <AddCategoryView mode="add" />;
}
