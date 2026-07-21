"use client";

import { useEffect, useState } from "react";
import { X, Layers as LayersPlus, LayoutTemplate } from "lucide-react";
import { nanoid } from "nanoid";
import {
  MotionModal,
  MotionModalTitle,
  MotionModalClose,
} from "./ui/MotionModal";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editorStore";
import { templates as templatesApi, type CmsTemplate } from "@/lib/api";
import type { EditorNode } from "@/types/editor";

// ─── Thumbnail preview ────────────────────────────────────────────────────────

function TemplateThumbnail({ thumbnail, name }: { thumbnail: string | null; name: string }) {
  if (thumbnail) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={thumbnail} alt={name} className="w-full aspect-[4/3] object-cover" />
    );
  }
  return (
    <div className="w-full aspect-[4/3] flex items-center justify-center bg-muted">
      <LayoutTemplate className="w-8 h-8 text-muted-foreground/40" />
    </div>
  );
}

// ─── Picker component ─────────────────────────────────────────────────────────

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
}

export default function TemplatePicker({ open, onClose }: TemplatePickerProps) {
  const [templateList, setTemplateList] = useState<CmsTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const { addNode, clearCanvas } = useEditorStore();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    templatesApi
      .list()
      .then(setTemplateList)
      .catch(() => setTemplateList([]))
      .finally(() => setLoading(false));
  }, [open]);

  const categories = [
    "All",
    ...Array.from(new Set(templateList.map((t) => t.category).filter((c): c is string => !!c))),
  ];

  const visible =
    activeCategory === "All"
      ? templateList
      : templateList.filter((t) => t.category === activeCategory);

  function handleSelect(template: CmsTemplate) {
    clearCanvas();
    template.blocks.forEach((b) => {
      const node: EditorNode = {
        id: nanoid(8),
        type: "typed-block",
        tag: "div",
        className: "",
        blockType: b.blockType,
        blockData: structuredClone(b.data),
      };
      addNode(node);
    });
    onClose();
  }

  return (
    <MotionModal
      open={open}
      onClose={onClose}
      className="w-[calc(100vw-2rem)] max-w-5xl max-h-[calc(100vh-3rem)]
        flex flex-col bg-card rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-7 py-5 border-b border-border dark:border-white/10 shrink-0">
        <MotionModalTitle className="text-lg font-semibold text-foreground dark:text-white">
          Pick a Template
        </MotionModalTitle>
        <MotionModalClose
          className="p-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted
            dark:text-muted-foreground dark:hover:text-muted-foreground dark:hover:bg-card/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </MotionModalClose>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 flex flex-col border-r border-border dark:border-white/10 p-5">
          <nav className="flex flex-col gap-0.5 flex-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "text-left px-3 py-2 rounded-sm text-sm transition-colors",
                  activeCategory === cat
                    ? "bg-muted dark:bg-card/10 text-foreground dark:text-white font-medium"
                    : "text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-card/5",
                )}
              >
                {cat === "All" ? "All Templates" : cat}
              </button>
            ))}
          </nav>
          <button
            onClick={onClose}
            className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border border-border shadow-xs dark:border-white/10
                  text-sm font-medium text-muted-foreground dark:text-muted-foreground
                  hover:bg-muted dark:hover:bg-card/5 transition-colors text-left"
          >
            <LayersPlus className="w-4 h-4" />
            Start blank
          </button>
        </aside>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted min-h-[calc(100vh-150px)] max-h-[calc(100vh-150px)]">
          {loading ? (
            <div className="grid grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-card animate-pulse" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-20">
              <LayoutTemplate className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-semibold text-foreground">No templates available yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start blank, or ask an admin to add templates from Admin → Templates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {visible.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelect(template)}
                  className="group text-left flex flex-col gap-2.5 focus:outline-none"
                >
                  <div
                    className={cn(
                      "w-full rounded-xl overflow-hidden",
                      "ring-2 ring-transparent group-hover:ring-ring dark:group-hover:ring-primary",
                      "group-focus-visible:ring-ring dark:group-focus-visible:ring-primary",
                      "transition-all duration-150 shadow-sm",
                    )}
                  >
                    <TemplateThumbnail thumbnail={template.thumbnail} name={template.name} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground dark:text-white leading-tight">
                      {template.name}
                    </p>
                    {template.description && (
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </MotionModal>
  );
}
