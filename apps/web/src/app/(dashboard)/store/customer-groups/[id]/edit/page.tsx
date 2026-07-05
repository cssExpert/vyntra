import { EditCustomerGroupView } from "@/modules/store/customer-groups/EditCustomerGroupView";

export const metadata = { title: "Edit Customer Group — Store" };

export default async function EditCustomerGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditCustomerGroupView groupId={id} />;
}
