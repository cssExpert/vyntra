import type { Metadata } from "next";
import { MenusView } from "@/modules/cms/MenusView";

export const metadata: Metadata = { title: "Menus — CMS" };

export default function CmsMenusPage() {
  return <MenusView />;
}
