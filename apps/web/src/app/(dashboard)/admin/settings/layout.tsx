import { ReactNode } from "react";
import { AdminSettingsLayout } from "@/modules/admin/AdminSettingsLayout";

export default function AdminSettingsLayoutPage({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminSettingsLayout>{children}</AdminSettingsLayout>;
}
