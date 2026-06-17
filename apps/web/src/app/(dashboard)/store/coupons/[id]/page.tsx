import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CouponDetailsView = dynamic(() =>
  import("@/modules/store/coupons/CouponDetailsView").then((m) => ({ default: m.CouponDetailsView }))
);

export const metadata: Metadata = { title: "Coupon Details — Store" };

export default function CouponDetailsPage({ params }: { params: { id: string } }) {
  return <CouponDetailsView couponId={params.id} />;
}
