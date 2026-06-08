import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CouponsView = dynamic(() =>
  import("@/modules/store/coupons/CouponsView").then((m) => ({ default: m.CouponsView }))
);
export const metadata: Metadata = { title: "Coupons — Store" };
export default function CouponsPage() { return <CouponsView />; }
