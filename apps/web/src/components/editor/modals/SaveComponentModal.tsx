"use client";

import { useState, useEffect } from "react";
import { Puzzle } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibraryStore, type ComponentCategory } from "@/store/libraryStore";

const CATEGORIES: ComponentCategory[] = [
  "Marketing",
  "Navigation",
  "Layout",
  "Forms",
  "Media",
  "E-commerce",
  "Other",
];

export function SaveComponentModal() {
  const { pendingSaveNode, pendingSaveType, setPendingSave, saveComponent } =
    useLibraryStore();

  const isOpen = pendingSaveType === "component";

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ComponentCategory>("Marketing");
  const [description, setDescription] = useState("");
  const [isGlobal, setIsGlobal] = useState(false);
  const [syncChanges, setSyncChanges] = useState(true);

  // Pre-fill name from node tag / blockType
  useEffect(() => {
    if (pendingSaveNode && isOpen) {
      const guess =
        (pendingSaveNode as { blockType?: string }).blockType ??
        pendingSaveNode.tag ??
        "";
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
    saveComponent({
      name: name.trim(),
      category,
      description: description.trim(),
      isGlobal,
      syncChanges,
      node: pendingSaveNode,
    });
    handleClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      icon={<Puzzle className="w-4 h-4" />}
      title="Create Component"
      description="Save this element as a reusable component."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !pendingSaveNode}
          >
            Save Component
          </Button>
        </div>
      }
    >
      {!pendingSaveNode && (
        <div className="mb-4 flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <Puzzle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            No element selected. Select an element on the canvas first, then use
            the <strong>toolbar button</strong> to save it as a component.
          </p>
        </div>
      )}

      <div className="flex flex-col p-5 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Pricing Card"
            autoFocus
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ComponentCategory)}
            className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Description{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this component do?"
            rows={2}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-3 pt-1 border-t border-border">
          <Toggle
            checked={isGlobal}
            onChange={setIsGlobal}
            label="Global Component"
            description="Available across all projects in your workspace"
          />
          <Toggle
            checked={syncChanges}
            onChange={setSyncChanges}
            label="Sync Changes Across Pages"
            description="Editing this component updates all instances"
          />
        </div>
      </div>
    </Modal>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`shrink-0 mt-0.5 w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
          checked ? "bg-primary" : "bg-muted-foreground/25"
        }`}
      >
        <span
          className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight">
          {label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </label>
  );
}
