import type { Metadata } from "next";
import dynamic from "next/dynamic";

const MenusView = dynamic(() =>
  import("@/modules/cms/MenusView").then((m) => ({ default: m.MenusView }))
);

export const metadata: Metadata = { title: "Menus — CMS" };

export default function CmsMenusPage() {
  return <MenusView />;
}
