import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AdminTemplatesView = dynamic(() =>
  import("@/modules/admin/AdminTemplatesView").then((m) => ({ default: m.AdminTemplatesView }))
);

export const metadata: Metadata = { title: "Global Templates — Admin" };

export default function AdminTemplatesPage() {
  return <AdminTemplatesView />;
}
