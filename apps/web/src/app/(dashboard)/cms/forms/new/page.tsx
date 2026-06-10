import type { Metadata } from "next";
import dynamic from "next/dynamic";

const FormBuilderView = dynamic(() =>
  import("@/modules/cms/forms/builder/FormBuilderView").then((m) => ({
    default: m.FormBuilderView,
  })),
);

export const metadata: Metadata = { title: "New Form — CMS" };

export default function NewFormPage() {
  return <FormBuilderView />;
}
