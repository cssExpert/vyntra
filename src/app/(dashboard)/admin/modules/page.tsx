import type { Metadata } from "next";
import { ModulesAdminView } from "@/modules/admin/ModulesAdminView";

export const metadata: Metadata = { title: "Modules" };

export default function AdminModulesPage() {
  return <ModulesAdminView />;
}
