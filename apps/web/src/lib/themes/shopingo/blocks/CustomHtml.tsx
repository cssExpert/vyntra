import type { CustomHtmlData } from "@/lib/themes/types";

export default function CustomHtml({ data }: { data: CustomHtmlData }) {
  if (!data.html) return null;
  return (
    <section
      className="py-8"
      dangerouslySetInnerHTML={{ __html: data.html }}
    />
  );
}
