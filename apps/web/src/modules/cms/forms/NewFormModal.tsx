"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, LayoutTemplate, FilePlus2 } from "lucide-react";

import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormFieldsPreview } from "./FormFieldsPreview";
import {
  FORM_BLUEPRINTS,
  blueprintToForm,
  type FormBlueprint,
} from "./form-blueprints";

interface NewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Fired when the user confirms. `null` means "start from a blank form". */
  onChoose: (blueprintKey: string | null) => void;
}

export function NewFormModal({ isOpen, onClose, onChoose }: NewFormModalProps) {
  const [activeId, setActiveId] = useState<number>(FORM_BLUEPRINTS[0].id);

  // Reset to the first blueprint each time the modal opens.
  useEffect(() => {
    if (isOpen) setActiveId(FORM_BLUEPRINTS[0].id);
  }, [isOpen]);

  const active: FormBlueprint =
    FORM_BLUEPRINTS.find((b) => b.id === activeId) ?? FORM_BLUEPRINTS[0];

  const previewForm = useMemo(() => blueprintToForm(active), [active]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Form"
      description="Pick a blueprint to start from — or build from scratch."
      icon={<LayoutTemplate size={18} />}
      maxWidth="xxl"
      bodyMaxHeight="calc(100vh - 170px)"
      footer={
        <>
          <Button
            variant="ghost"
            radius="sm"
            onClick={() => onChoose(null)}
            className="font-semibold text-muted-foreground hover:text-foreground"
            startIcon={<FilePlus2 size={15} />}
          >
            Start from blank
          </Button>
          <Button
            radius="sm"
            onClick={() => onChoose(active.key)}
            className="px-5 font-semibold active:scale-[0.98]"
          >
            Use “{active.title}”
          </Button>
        </>
      }
    >
      <div className="flex flex-col md:flex-row h-[70vh] md:h-[68vh]">
        {/* ── Left: blueprint selector ─────────────────────────────────── */}
        <div className="md:w-[320px] shrink-0 border-b md:border-b-0 md:border-r border-border bg-muted/30 overflow-y-auto">
          <div className="px-4 pt-4 pb-2 sticky top-0 bg-muted/30 backdrop-blur-sm z-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Blueprint Selector
            </p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Select from twelve pre-engineered modular forms.
            </p>
          </div>

          <div className="p-3 pt-1 space-y-2">
            {FORM_BLUEPRINTS.map((bp) => {
              const isActive = bp.id === activeId;
              const Icon = bp.icon;
              return (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => setActiveId(bp.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "group w-full flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                    isActive
                      ? "border-primary/60 bg-primary/10 ring-1 ring-primary/30"
                      : "border-border bg-card hover:border-primary/30 hover:bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground group-hover:text-primary",
                    )}
                  >
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-sm font-semibold leading-tight truncate",
                        isActive ? "text-foreground" : "text-foreground/90",
                      )}
                    >
                      {bp.id}. {bp.title}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate mt-0.5">
                      {bp.desc}
                    </span>
                  </span>
                  <ChevronRight
                    size={16}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground/40 group-hover:text-primary/60",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: live preview (bordered form card) ─────────────────── */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-muted/20 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm"
            >
              {/* Same renderer as the builder preview & published form, so the
                  blueprint preview matches exactly what you'll get. */}
              <FormFieldsPreview
                form={previewForm}
                showSubmit
                animate={false}
                className="space-y-5 form-fonts"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}
