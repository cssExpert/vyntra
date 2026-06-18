import { EditAttributeView } from "@/modules/store/attributes/EditAttributeView";

export const metadata = { title: "Edit Attribute — Store" };

export default async function EditAttributePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditAttributeView attributeId={id} />;
}
