import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CouponDetailsView = dynamic(() =>
  import("@/modules/store/coupons/CouponDetailsView").then((m) => ({ default: m.CouponDetailsView }))
);

export const metadata: Metadata = { title: "Coupon Details — Store" };

export default async function CouponDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CouponDetailsView couponId={id} />;
}
