"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { LibraryModal } from "@/modules/cms/blog-editor/CoverImagePicker";
import type { FormField } from "../forms.types";
import { FormImage } from "../FormImage";
import { CONTROL_H, CONTROL_BASE, SegmentedControl, ALIGN_OPTIONS } from "./controls";

export function ImageFieldEditor({
  field,
  onChange,
}: {
  field: FormField;
  onChange: (patch: Partial<FormField>) => void;
}) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const { user } = useAuth();
  const companyId = user?.organizationId || "superadmin";

  return (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2">
        <Input
          value={field.imageUrl ?? ""}
          onChange={(e) => onChange({ imageUrl: e.target.value })}
          placeholder="Image URL (https://…)"
          className={cn(CONTROL_H, CONTROL_BASE, "flex-1 px-3")}
        />
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className={cn(
            CONTROL_H,
            "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
          )}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Upload
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input
          value={field.imageAlt ?? ""}
          onChange={(e) => onChange({ imageAlt: e.target.value })}
          placeholder="Alt text (optional)"
          className={cn(CONTROL_H, CONTROL_BASE, "flex-1 min-w-[140px] px-3")}
        />
        <SegmentedControl
          value={field.align ?? "left"}
          onChange={(v) => onChange({ align: v })}
          options={ALIGN_OPTIONS}
        />
        <Input
          type="number"
          value={field.imageWidth ?? ""}
          onChange={(e) =>
            onChange({
              imageWidth: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="Width px"
          className={cn(CONTROL_H, CONTROL_BASE, "w-28 px-3")}
        />
      </div>

      {field.imageUrl?.trim() && (
        <div className="pt-1 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground my-2">Preview</p>
          <FormImage field={field} />
        </div>
      )}

      {libraryOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <LibraryModal
            currentValue={field.imageUrl ?? ""}
            uploadCompanyId={companyId}
            currentSubtype="general"
            module="cms"
            accept="image/*"
            onSelect={(url) => {
              onChange({ imageUrl: url });
              setLibraryOpen(false);
            }}
            onClose={() => setLibraryOpen(false)}
          />,
          document.body,
        )}
    </div>
  );
}
