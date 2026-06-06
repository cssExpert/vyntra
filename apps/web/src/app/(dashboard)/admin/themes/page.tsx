import type { Metadata } from "next";
import { AdminThemesView } from "@/modules/admin/AdminThemesView";

export const metadata: Metadata = { title: "Global Themes — Admin" };

export default function AdminThemesPage() {
  return <AdminThemesView />;
}
