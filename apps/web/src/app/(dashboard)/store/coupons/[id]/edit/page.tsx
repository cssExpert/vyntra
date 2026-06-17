import type { Metadata } from "next";
import dynamic from "next/dynamic";

const EditCouponView = dynamic(() =>
  import("@/modules/store/coupons/EditCouponView").then((m) => ({ default: m.EditCouponView }))
);

export const metadata: Metadata = { title: "Edit Coupon — Store" };

export default function EditCouponPage({ params }: { params: { id: string } }) {
  return <EditCouponView couponId={params.id} />;
}
