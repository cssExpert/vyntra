"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { Switch } from "@/components/ui/switch";
import { ImageUploadWithStorage } from "@/components/common/ImageUploadWithStorage";
import { useAuth } from "@/providers/AuthProvider";
import { Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const inp =
  "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15";
const sel =
  "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15 cursor-pointer";
const ta =
  "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none";
const lbl = "block text-sm font-medium text-foreground mb-1.5";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: "easeOut" } },
};

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={item}
      className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
    >
      <div className="px-5 py-3.5 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </motion.div>
  );
}

function F({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      {children}
    </div>
  );
}

// Flat list for parent picker (2-level for simplicity)
const PARENT_OPTIONS = [
  { id: "c1", name: "Templates", depth: 0 },
  { id: "c1a", name: "UI Kits", depth: 1 },
  { id: "c1b", name: "Icon Packs", depth: 1 },
  { id: "c1c", name: "Dashboard Templates", depth: 1 },
  { id: "c2", name: "Subscriptions", depth: 0 },
  { id: "c3", name: "Digital Downloads", depth: 0 },
  { id: "c3a", name: "E-books", depth: 1 },
  { id: "c3b", name: "Code Snippets", depth: 1 },
  { id: "c4", name: "Merchandise", depth: 0 },
  { id: "c5", name: "Services", depth: 0 },
];

export interface AddCategoryViewProps {
  mode?: "add" | "edit";
  categoryId?: string;
}

export function AddCategoryView({ mode = "add" }: AddCategoryViewProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("store.categories");
  const isLoaded = usePageLoad(600);
  const { user } = useAuth();
  const uploadCompanyId = user?.organizationId || "superadmin";
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [parentId, setParentId] = useState("");
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");

  const handleName = (v: string) => {
    setName(v);
    setSlug(
      v
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    );
  };

  const isEdit = mode === "edit";
  const pageTitle = isEdit ? "Edit Category" : "Add Category";

  if (!isLoaded) {
    return (
      <motion.div
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="space-y-4"
      >
        <div className="h-9 w-52 rounded-sm bg-muted animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {[160, 220].map((h, i) => (
              <div
                key={i}
                style={{ height: h }}
                className="w-full rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
          <div className="space-y-4">
            {[120, 140, 160].map((h, i) => (
              <div
                key={i}
                style={{ height: h }}
                className="w-full rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key="content"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex flex-col gap-4"
      >
        <PageHeader
          title={pageTitle}
          description={
            isEdit ? "Update category details" : "Create a new product category"
          }
          breadcrumbs={[
            { label: "Store", href: "/store" },
            { label: "Categories", href: "/store/categories" },
            { label: pageTitle },
          ]}
        >
          <button
            onClick={() => router.push("/store/categories")}
            className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer"
          >
            Cancel
          </button>
          <Button size="lg" radius="sm" className="px-5">
            <Save size={14} />
            {isEdit ? "Save Changes" : "Save"}
          </Button>
        </PageHeader>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start"
        >
          {/* ── Left Column ─── */}
          <div className="lg:col-span-2 space-y-5">
            <Card title="Basic Information">
              <F
                label={
                  <>
                    Category Name <span className="text-destructive">*</span>
                  </>
                }
              >
                <input
                  value={name}
                  onChange={(e) => handleName(e.target.value)}
                  placeholder="e.g. Summer Collection"
                  className={inp}
                />
              </F>
              <F label="Slug">
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="summer-collection"
                  className={inp}
                />
              </F>
              <F label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe this category…"
                  className={ta}
                />
              </F>
            </Card>

            <Card title="Thumbnail Image">
              <ImageUploadWithStorage
                value={image}
                onChange={setImage}
                companyId={uploadCompanyId}
                module="store"
                accept="image/png,image/jpeg,image/webp"
                maxSizeMB={3}
                previewShape="wide"
                hint="PNG, JPG, WebP up to 3 MB"
              />
            </Card>

            <Card title="SEO">
              <F label="SEO Title">
                <input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Category SEO title…"
                  className={inp}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {seoTitle.length}/60
                </p>
              </F>
              <F label="Meta Description">
                <textarea
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  rows={3}
                  placeholder="Brief description for search engines…"
                  className={ta}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {seoDesc.length}/160
                </p>
              </F>
              {(seoTitle || name) && (
                <div className="rounded-sm border border-border bg-muted/20 p-3 space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Preview
                  </p>
                  <p className="text-[13px] text-blue-500 font-medium truncate">
                    {seoTitle || name}
                  </p>
                  <p className="text-[11px] text-green-600 dark:text-green-400 truncate">
                    yourstore.com › categories › {slug || "category-slug"}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {seoDesc || description || "No description provided."}
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* ── Sidebar ─── */}
          <div className="top-5 sticky space-y-5">
            <Card title="Visibility">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Active
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Show this category in the store
                    </p>
                  </div>
                  <Switch checked={active} onCheckedChange={setActive} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Featured
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Highlight on homepage
                    </p>
                  </div>
                  <Switch checked={featured} onCheckedChange={setFeatured} />
                </div>
              </div>
            </Card>

            <Card title="Parent Category">
              <p className="text-xs text-muted-foreground -mt-1 mb-1">
                Leave empty to create a top-level category.
              </p>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className={sel}
              >
                <option value="">— None (top level) —</option>
                {PARENT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.depth === 1 ? "  ↳ " : ""}
                    {o.name}
                  </option>
                ))}
              </select>
            </Card>
          </div>
        </motion.div>

        {/* Sticky bottom bar */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-background/80 backdrop-blur-md border-t border-border/60 flex items-center justify-between gap-4 z-10">
          <p className="text-xs text-muted-foreground hidden sm:block">
            Unsaved changes will be lost if you navigate away.
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => router.push("/store/categories")}
              className="rounded-sm border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all cursor-pointer shadow-sm shadow-primary/20">
              <Send size={14} />
              Publish
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
