import type { Metadata } from "next";
import dynamic from "next/dynamic";

const OrderDetailsView = dynamic(() =>
  import("@/modules/store/orders/OrderDetailsView").then((m) => ({ default: m.OrderDetailsView }))
);

export const metadata: Metadata = { title: "Order Details — Store" };

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  return <OrderDetailsView orderId={params.id} />;
}
