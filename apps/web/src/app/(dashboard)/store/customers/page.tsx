import type { Metadata } from "next";
import { CustomersView } from "@/modules/store/customers/CustomersView";
export const metadata: Metadata = { title: "Customers — Store" };
export default function CustomersPage() { return <CustomersView />; }
