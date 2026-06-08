import type { Metadata } from "next";
import { SystemLogsView } from "@/modules/settings/SystemLogsView";

export const metadata: Metadata = { title: "System Logs" };

export default function SystemLogsPage() {
  return <SystemLogsView />;
}
