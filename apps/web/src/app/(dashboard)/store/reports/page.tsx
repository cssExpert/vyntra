import type { Metadata } from "next";
import dynamic from "next/dynamic";

const StoreReportsView = dynamic(() =>
  import("@/modules/store/reports/StoreReportsView").then((m) => ({ default: m.StoreReportsView }))
);
export const metadata: Metadata = { title: "Reports — Store" };
export default function ReportsPage() { return <StoreReportsView />; }
