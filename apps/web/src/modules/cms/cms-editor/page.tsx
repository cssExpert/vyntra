import EditorLayout from "@/components/editor/EditorLayout";

export const metadata = {
  title: "Feather Editor",
  description:
    "A powerful drag-and-drop visual website builder with Tailwind CSS",
  openGraph: {
    title: "Feather Editor — Build Beautiful Websites",
    description:
      "A powerful drag-and-drop visual website builder with Tailwind CSS",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function EditorPage() {
  return <EditorLayout />;
}
