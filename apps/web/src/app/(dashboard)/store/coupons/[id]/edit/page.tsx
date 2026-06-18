import type { Metadata } from "next";
import dynamic from "next/dynamic";

const EditCouponView = dynamic(() =>
  import("@/modules/store/coupons/EditCouponView").then((m) => ({ default: m.EditCouponView }))
);

export const metadata: Metadata = { title: "Edit Coupon — Store" };

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditCouponView couponId={id} />;
}
