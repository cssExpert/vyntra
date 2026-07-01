"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Layers, AlertTriangle, X } from "lucide-react";
import { storeAttributes, type ApiAttribute } from "@/lib/api";

const FIELD_TYPE_LABELS: Record<string, string> = {
  dropdown:    "Dropdown",
  multiselect: "Multi-select",
  buttons:     "Buttons",
  text:        "Text",
  textarea:    "Textarea",
};

// ─── Delete confirmation modal ────────────────────────────────────────────────

function DeleteModal({
  attr,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  attr: ApiAttribute;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-destructive/10 shrink-0">
            <AlertTriangle size={18} className="text-destructive" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Delete Attribute</h3>
            <p className="text-[13px] text-muted-foreground mt-1">
              Are you sure you want to delete <span className="font-medium text-foreground">{attr.name}</span>? This cannot be undone.
            </p>
          </div>
          <button onClick={onCancel} className="ml-auto text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isDeleting}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function AttributesView() {
  const router  = useRouter();
  const isLoaded = usePageLoad(500);

  const [attributes, setAttributes] = useState<ApiAttribute[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [search,     setSearch]     = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ApiAttribute | null>(null);
  const [isDeleting,   setIsDeleting]   = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await storeAttributes.list();
      setAttributes(res.data);
    } catch {
      // keep empty
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => {
    if (!search.trim()) return attributes;
    const q = search.toLowerCase();
    return attributes.filter((a) => a.name.toLowerCase().includes(q));
  }, [search, attributes]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await storeAttributes.remove(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch {
      // keep modal open on error
    } finally {
      setIsDeleting(false);
    }
  };

  const totalVariation = attributes.filter((a) => a.usedInVariation).length;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {/* Delete modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            attr={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>

      {!isLoaded || isLoading ? (
        <motion.div key="sk" exit={{ opacity: 0 }} className="space-y-4">
          <div className="h-9 w-48 rounded-sm bg-muted animate-pulse" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="h-64 w-full rounded-xl bg-muted animate-pulse" />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <PageHeader
            title="Product Attributes"
            description={`${attributes.length} attribute${attributes.length !== 1 ? "s" : ""} — define options for product variants and specifications`}
            breadcrumbs={[
              { label: "Store", href: "/store" },
              { label: "Attributes" },
            ]}
          >
            <Button size="lg" onClick={() => router.push("/store/attributes/add")}>
              <Plus className="stroke-[3] h-4 w-4" /> Add Attribute
            </Button>
          </PageHeader>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Attributes",   value: attributes.length,                          color: "text-foreground" },
              { label: "Used In Variation",  value: totalVariation,                             color: "text-primary" },
              { label: "Specification Only", value: attributes.length - totalVariation,          color: "text-muted-foreground" },
            ].map((s) => (
              <div key={s.label} className="glass-card p-3 flex items-center gap-3">
                <Layers size={15} className={s.color} />
                <div>
                  <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attributes…"
              className="pl-9"
            />
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-clip">
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 340px)" }}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[13px] font-semibold text-muted-foreground bg-muted border-b border-border">
                    <th className="sticky top-0 bg-muted py-3.5 px-4">Name</th>
                    <th className="sticky top-0 bg-muted py-3.5 px-4">Attribute Type</th>
                    <th className="sticky top-0 bg-muted py-3.5 px-4">Field Type</th>
                    <th className="sticky top-0 bg-muted py-3.5 px-4">Options / Values</th>
                    <th className="sticky top-0 bg-muted py-3.5 px-4">Used in Variation</th>
                    <th className="sticky top-0 bg-muted py-3.5 px-4">Added On</th>
                    <th className="sticky top-0 bg-muted py-3.5 px-4 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-[14px]">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-muted-foreground">
                        {search ? "No attributes match your search." : (
                          <>No attributes yet.{" "}
                            <button onClick={() => router.push("/store/attributes/add")} className="text-primary underline cursor-pointer">
                              Add one
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ) : (
                    rows.map((attr) => (
                      <tr key={attr.id} className="group hover:bg-muted/40 transition-colors">
                        <td className="py-4 px-4 font-semibold text-foreground">{attr.name}</td>
                        <td className="py-4 px-4">
                          <StatusBadge
                            variant={attr.attributeType === "color" ? "purple" : "info"}
                            label={attr.attributeType === "color" ? "Color" : "Selection"}
                            size="sm"
                            dot
                          />
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-[13px]">
                          {attr.attributeType === "color" ? "Color Picker" : (FIELD_TYPE_LABELS[attr.fieldType] ?? attr.fieldType)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {attr.values.slice(0, 5).map((v) => (
                              <span key={v.id} className="flex items-center gap-1 text-[11px] bg-muted px-2 py-0.5 rounded-sm text-foreground">
                                {v.colorHex && (
                                  <span className="inline-block w-2.5 h-2.5 rounded-full border border-border" style={{ background: v.colorHex }} />
                                )}
                                {v.name}
                              </span>
                            ))}
                            {attr.values.length > 5 && (
                              <span className="text-[11px] text-muted-foreground px-1">+{attr.values.length - 5} more</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge
                            variant={attr.usedInVariation ? "success" : "muted"}
                            label={attr.usedInVariation ? "Yes" : "No"}
                            size="sm"
                            dot
                          />
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-[13px]">
                          {new Date(attr.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <TableActionMenu
                            items={[
                              {
                                label: "Edit",
                                icon: <Pencil size={14} />,
                                onClick: () => router.push(`/store/attributes/${attr.id}/edit`),
                              },
                              {
                                label: "Delete",
                                icon: <Trash2 size={14} />,
                                onClick: () => setDeleteTarget(attr),
                                variant: "danger",
                                separator: true,
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
