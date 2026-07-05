import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AddCouponView = dynamic(() =>
  import("@/modules/store/coupons/AddCouponView").then((m) => ({ default: m.AddCouponView }))
);

export const metadata: Metadata = { title: "Add Coupon — Store" };

export default function AddCouponPage() {
  return <AddCouponView />;
}
