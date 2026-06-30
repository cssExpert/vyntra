"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Layers } from "lucide-react";
import { SAMPLE_ATTRIBUTES } from "../store.data";
import type { StoreAttribute } from "../store.types";

const FIELD_TYPE_LABELS: Record<string, string> = {
  dropdown: "Dropdown",
  multiselect: "Multi-select",
  buttons: "Buttons",
  text: "Text",
  textarea: "Textarea",
};

function getAttribute(): StoreAttribute[] {
  if (typeof window === "undefined") return SAMPLE_ATTRIBUTES;
  const edited = JSON.parse(
    localStorage.getItem("store_attributes_edited") || "{}",
  );
  const added = JSON.parse(
    localStorage.getItem("store_attributes_added") || "[]",
  );
  const deleted = JSON.parse(
    localStorage.getItem("store_attributes_deleted") || "[]",
  );
  const base = SAMPLE_ATTRIBUTES.filter((a) => !deleted.includes(a.id)).map(
    (a) => edited[a.id] ?? a,
  );
  return [...added, ...base];
}

export function AttributesView() {
  const router = useRouter();
  const isLoaded = usePageLoad(500);
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const all = getAttribute();
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter((a) => a.name.toLowerCase().includes(q));
  }, [search]);

  const handleDelete = (id: string) => {
    const deleted = JSON.parse(
      localStorage.getItem("store_attributes_deleted") || "[]",
    );
    if (!deleted.includes(id)) deleted.push(id);
    localStorage.setItem("store_attributes_deleted", JSON.stringify(deleted));
    window.location.reload();
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
        <motion.div key="sk" exit={{ opacity: 0 }} className="space-y-4">
          <div className="h-9 w-48 rounded-sm bg-muted animate-pulse" />
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
            description={`${rows.length} attributes — define options for product variants and specifications`}
            breadcrumbs={[
              { label: "Store", href: "/store" },
              { label: "Attributes" },
            ]}
          >
            <Button
              size="lg"
              onClick={() => router.push("/store/attributes/add")}
            >
              <Plus className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 h-4 w-4" />{" "}
              Add Attribute
            </Button>
          </PageHeader>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Total Attributes",
                value: getAttribute().length,
                color: "text-foreground",
              },
              {
                label: "Used In Variation",
                value: getAttribute().filter((a) => a.usedInVariation).length,
                color: "text-primary",
              },
              {
                label: "Specification Only",
                value: getAttribute().filter((a) => !a.usedInVariation).length,
                color: "text-muted-foreground",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-card p-3 flex items-center gap-3"
              >
                <Layers size={15} className={s.color} />
                <div>
                  <p className={`text-lg font-extrabold ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attributes…"
              className="pl-9"
            />
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-clip">
            <div
              className="overflow-x-auto overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 340px)" }}
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[13px] font-semibold text-muted-foreground bg-muted border-b border-border">
                    <th className="sticky top-0 bg-muted py-3.5 px-4">Name</th>
                    <th className="sticky top-0 bg-muted py-3.5 px-4">
                      Attribute Type
                    </th>
                    <th className="sticky top-0 bg-muted py-3.5 px-4">
                      Field Type
                    </th>
                    <th className="sticky top-0 bg-muted py-3.5 px-4">
                      Options / Values
                    </th>
                    <th className="sticky top-0 bg-muted py-3.5 px-4">
                      Used in Variation
                    </th>
                    <th className="sticky top-0 bg-muted py-3.5 px-4">
                      Added On
                    </th>
                    <th className="sticky top-0 bg-muted py-3.5 px-4 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-[14px]">
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-16 text-center text-muted-foreground"
                      >
                        No attributes found.{" "}
                        <button
                          onClick={() => router.push("/store/attributes/add")}
                          className="text-primary underline cursor-pointer"
                        >
                          Add one
                        </button>
                      </td>
                    </tr>
                  ) : (
                    rows.map((attr) => (
                      <tr
                        key={attr.id}
                        className="group hover:bg-muted/40 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <span className="font-semibold text-foreground">
                            {attr.name}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge
                            variant={
                              attr.attributeType === "color" ? "purple" : "info"
                            }
                            label={
                              attr.attributeType === "color"
                                ? "Color"
                                : "Selection"
                            }
                            size="sm"
                            dot
                          />
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-[13px]">
                          {attr.attributeType === "color"
                            ? "Color Picker"
                            : FIELD_TYPE_LABELS[attr.fieldType]}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {attr.options.slice(0, 5).map((opt) => (
                              <span
                                key={opt.id}
                                className="flex items-center gap-1 text-[11px] bg-muted px-2 py-0.5 rounded-sm text-foreground"
                              >
                                {opt.colorHex && (
                                  <span
                                    className="inline-block w-2.5 h-2.5 rounded-full border border-border"
                                    style={{ background: opt.colorHex }}
                                  />
                                )}
                                {opt.name}
                              </span>
                            ))}
                            {attr.options.length > 5 && (
                              <span className="text-[11px] text-muted-foreground px-1">
                                +{attr.options.length - 5} more
                              </span>
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
                          {attr.createdAt}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <TableActionMenu
                            items={[
                              {
                                label: "Edit",
                                icon: <Pencil size={14} />,
                                onClick: () =>
                                  router.push(
                                    `/store/attributes/${attr.id}/edit`,
                                  ),
                              },
                              {
                                label: "Delete",
                                icon: <Trash2 size={14} />,
                                onClick: () => handleDelete(attr.id),
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
