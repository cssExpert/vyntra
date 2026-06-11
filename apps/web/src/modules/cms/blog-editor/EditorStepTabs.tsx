"use client";

import { PenTool, Tag, Globe, Settings } from "lucide-react";
import { MotionTabs, type MotionTabItem } from "@/components/ui/MotionTabs";

export type EditorTab = "editor" | "metadata" | "seo" | "publish";

const TABS: MotionTabItem<EditorTab>[] = [
  {
    id: "editor",
    label: "1. Writing Space",
    icon: PenTool,
  },
  { id: "metadata", label: "2. Metadata Tags", icon: Tag },
  { id: "seo", label: "3. SEO Preview", icon: Globe },
  { id: "publish", label: "4. Visibility Options", icon: Settings },
];

export function EditorStepTabs({
  active,
  onChange,
}: {
  active: EditorTab;
  onChange: (tab: EditorTab) => void;
}) {
  return (
    <MotionTabs
      tabs={TABS}
      active={active}
      onChange={onChange}
      layoutId="editor-step-tabs"
    />
  );
}
