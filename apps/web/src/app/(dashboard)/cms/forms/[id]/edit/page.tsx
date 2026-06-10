"use client";

import { useParams } from "next/navigation";
import { FormBuilderView } from "@/modules/cms/forms/builder/FormBuilderView";

export default function EditFormPage() {
  const { id } = useParams<{ id: string }>();
  return <FormBuilderView formId={id} />;
}
