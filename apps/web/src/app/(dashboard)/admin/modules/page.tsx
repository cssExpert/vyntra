import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ModulesAdminView = dynamic(() =>
  import("@/modules/admin/ModulesAdminView").then((m) => ({ default: m.ModulesAdminView }))
);

export const metadata: Metadata = { title: "Modules" };

export default function AdminModulesPage() {
  return <ModulesAdminView />;
}
