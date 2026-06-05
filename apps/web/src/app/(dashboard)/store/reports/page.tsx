import type { Metadata } from "next";
import { StoreReportsView } from "@/modules/store/reports/StoreReportsView";
export const metadata: Metadata = { title: "Reports — Store" };
export default function ReportsPage() { return <StoreReportsView />; }
