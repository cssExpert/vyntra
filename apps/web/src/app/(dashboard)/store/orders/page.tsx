import type { Metadata } from "next";
import dynamic from "next/dynamic";

const OrdersView = dynamic(() =>
  import("@/modules/store/orders/OrdersView").then((m) => ({ default: m.OrdersView }))
);
export const metadata: Metadata = { title: "Orders — Store" };
export default function OrdersPage() { return <OrdersView />; }
