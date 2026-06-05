import type { Metadata } from "next";
import { OrdersView } from "@/modules/store/orders/OrdersView";
export const metadata: Metadata = { title: "Orders — Store" };
export default function OrdersPage() { return <OrdersView />; }
