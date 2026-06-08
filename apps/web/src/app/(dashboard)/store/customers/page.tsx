import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CustomersView = dynamic(() =>
  import("@/modules/store/customers/CustomersView").then((m) => ({ default: m.CustomersView }))
);
export const metadata: Metadata = { title: "Customers — Store" };
export default function CustomersPage() { return <CustomersView />; }
