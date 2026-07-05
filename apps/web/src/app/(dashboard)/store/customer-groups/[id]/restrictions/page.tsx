import { RestrictionsView } from "@/modules/store/customer-groups/RestrictionsView";

export const metadata = { title: "Manage Restrictions — Customer Group" };

export default async function CustomerGroupRestrictionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RestrictionsView groupId={id} />;
}
