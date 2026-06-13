"use client";

import { useState } from "react";
import { Globe, Layout, PanelBottom, Megaphone, PhoneCall } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibraryStore, type GlobalElementType } from "@/store/libraryStore";
import { useEditorStore } from "@/store/editorStore";

const ELEMENT_TYPES: {
  value: GlobalElementType;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: "header",
    label: "Header",
    description: "Site navigation, logo and top bar",
    icon: Layout,
  },
  {
    value: "footer",
    label: "Footer",
    description: "Links, contact info and copyright",
    icon: PanelBottom,
  },
  {
    value: "announcement-bar",
    label: "Announcement Bar",
    description: "Promo banners shown site-wide",
    icon: Megaphone,
  },
  {
    value: "contact-cta",
    label: "Contact CTA",
    description: "Floating call-to-action or chat widget",
    icon: PhoneCall,
  },
];

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AddGlobalElementModal({
  isOpen: isOpenProp,
  onClose: onCloseProp,
}: Props) {
  const { globalElementModalOpen, setGlobalElementModalOpen } =
    useLibraryStore();
  const isOpen = isOpenProp !== undefined ? isOpenProp : globalElementModalOpen;
  const onClose = onCloseProp ?? (() => setGlobalElementModalOpen(false));
  const { addGlobalElement } = useLibraryStore();
  const { nodes, selectedId } = useEditorStore();

  const [name, setName] = useState("");
  const [elementType, setElementType] = useState<GlobalElementType>("header");
  const [syncAcrossPages, setSyncAcrossPages] = useState(true);
  const [useSelectedNode, setUseSelectedNode] = useState(true);

  const selectedNode = selectedId
    ? (nodes.find((n) => n.id === selectedId) ?? null)
    : null;

  function handleSave() {
    if (!name.trim()) return;
    const node =
      useSelectedNode && selectedNode
        ? selectedNode
        : {
            id: `global-${Date.now()}`,
            type: "div",
            tag: "div",
            className: "",
            children: [],
          };
    addGlobalElement({ name: name.trim(), elementType, syncAcrossPages, node });
    onClose();
    setName("");
    setElementType("header");
    setSyncAcrossPages(true);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      icon={<Globe className="w-4 h-4" />}
      title="Add Global Element"
      description="Global elements sync across every page automatically."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Add Global Element
          </Button>
        </div>
      }
    >
      <div className="flex flex-col p-5 gap-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Main Navigation"
            autoFocus
          />
        </div>

        {/* Type */}
        <div>
          <p className="text-xs font-semibold text-foreground mb-2">
            Element Type
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ELEMENT_TYPES.map(({ value, label, description, icon: Ico }) => (
              <button
                key={value}
                type="button"
                onClick={() => setElementType(value)}
                className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-colors ${
                  elementType === value
                    ? "bg-primary/10 border-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <Ico
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    elementType === value
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <div>
                  <p
                    className={`text-xs font-semibold leading-tight ${
                      elementType === value ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                    {description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Source */}
        {selectedNode && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border">
            <input
              type="checkbox"
              id="use-selected"
              checked={useSelectedNode}
              onChange={(e) => setUseSelectedNode(e.target.checked)}
              className="mt-0.5 accent-primary"
            />
            <label htmlFor="use-selected" className="cursor-pointer">
              <p className="text-xs font-semibold text-foreground">
                Use selected element
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Save the currently selected canvas node
              </p>
            </label>
          </div>
        )}

        {/* Sync toggle */}
        <label className="flex items-start gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={syncAcrossPages}
            onClick={() => setSyncAcrossPages((v) => !v)}
            className={`shrink-0 mt-0.5 w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
              syncAcrossPages ? "bg-primary" : "bg-muted-foreground/25"
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                syncAcrossPages ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
          <div>
            <p className="text-sm font-medium text-foreground leading-tight">
              Sync Across Pages
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Edit once, updates everywhere automatically
            </p>
          </div>
        </label>
      </div>
    </Modal>
  );
}
