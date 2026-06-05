import type { Metadata } from "next";
import { CouponsView } from "@/modules/store/coupons/CouponsView";
export const metadata: Metadata = { title: "Coupons — Store" };
export default function CouponsPage() { return <CouponsView />; }
