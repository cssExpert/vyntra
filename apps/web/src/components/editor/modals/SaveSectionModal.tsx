"use client";

import { useState, useEffect } from "react";
import { LayoutTemplate } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibraryStore, type SectionCategory } from "@/store/libraryStore";

const CATEGORIES: SectionCategory[] = [
  "Landing Pages",
  "Business",
  "SaaS",
  "Store",
  "Blog",
  "Portfolio",
];

export function SaveSectionModal() {
  const { pendingSaveNode, pendingSaveType, setPendingSave, saveSection } =
    useLibraryStore();

  const isOpen = pendingSaveType === "section";

  const [name, setName] = useState("");
  const [category, setCategory] = useState<SectionCategory>("Landing Pages");

  useEffect(() => {
    if (pendingSaveNode && isOpen) {
      const guess =
        (pendingSaveNode as { blockType?: string }).blockType ??
        pendingSaveNode.tag ??
        "Section";
      setName(
        guess.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      );
    }
  }, [pendingSaveNode, isOpen]);

  function handleClose() {
    setPendingSave(null, null);
  }

  function handleSave() {
    if (!pendingSaveNode || !name.trim()) return;
    saveSection({ name: name.trim(), category, node: pendingSaveNode });
    handleClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      icon={<LayoutTemplate className="w-4 h-4" />}
      title="Save Section"
      description="Save this section to your library for reuse."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !pendingSaveNode}
          >
            Save Section
          </Button>
        </div>
      }
    >
      {!pendingSaveNode && (
        <div className="mb-4 flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <LayoutTemplate className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            No element selected. Select a{" "}
            <code className="font-mono">&lt;section&gt;</code> on canvas, then
            use the <strong>toolbar button</strong> to save it.
          </p>
        </div>
      )}
      <div className="flex flex-col p-5 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hero Section"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Category
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors text-left ${
                  category === c
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
