"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { Switch } from "@/components/ui/switch";
import { ImageUploadWithStorage } from "@/components/common/ImageUploadWithStorage";
import { useAuth } from "@/providers/AuthProvider";
import { Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storeCategories } from "@/lib/api";
import type { StoreCategory } from "../store.types";

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
const itemVariant = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: "easeOut" } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildParentList(
  cats: StoreCategory[],
  excludeIds: Set<string>,
): Array<StoreCategory & { depth: number }> {
  const result: Array<StoreCategory & { depth: number }> = [];
  const addLevel = (parentId: string | null | undefined, depth: number) => {
    const children = cats
      .filter(
        (c) =>
          (c.parentId ?? null) === (parentId ?? null) &&
          !excludeIds.has(c.id),
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
    children.forEach((c) => {
      result.push({ ...c, depth });
      addLevel(c.id, depth + 1);
    });
  };
  addLevel(null, 0);
  return result;
}

function slugify(v: string): string {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={itemVariant}
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

function FormSkeleton() {
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

// ─── AddCategoryView ──────────────────────────────────────────────────────────

export interface AddCategoryViewProps {
  mode?: "add" | "edit";
  categoryId?: string;
}

export function AddCategoryView({
  mode = "add",
  categoryId,
}: AddCategoryViewProps) {
  const t = useTranslations("store.categories");
  const isLoaded = usePageLoad(500);
  const { user } = useAuth();
  const uploadCompanyId = user?.organizationId || "superadmin";
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [parentId, setParentId] = useState("");
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(mode === "edit");
  const [notFound, setNotFound] = useState(false);
  const [parentOptions, setParentOptions] = useState<
    Array<StoreCategory & { depth: number }>
  >([]);
  const [originalCat, setOriginalCat] = useState<StoreCategory | null>(null);

  useEffect(() => {
    let active = true;

    storeCategories.list({ take: 500 }).then((res) => {
      if (!active) return;
      const cats: StoreCategory[] = res.data.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parentId: c.parentId ?? undefined,
        description: c.description ?? undefined,
        imageUrl: c.imageUrl ?? undefined,
        status: (c.status === "active" ? "active" : "inactive") as "active" | "inactive",
        featured: c.featured ?? false,
        sortOrder: c.sortOrder,
        productCount: 0,
        seoTitle: c.seoTitle ?? undefined,
        seoDescription: c.seoDescription ?? undefined,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));

      const excludeIds = new Set<string>();
      if (mode === "edit" && categoryId) {
        excludeIds.add(categoryId);
        const addDescendants = (id: string) => {
          cats.filter((c) => c.parentId === id).forEach((child) => {
            excludeIds.add(child.id);
            addDescendants(child.id);
          });
        };
        addDescendants(categoryId);
      }
      setParentOptions(buildParentList(cats, excludeIds));

      if (mode === "edit" && categoryId) {
        const cat = cats.find((c) => c.id === categoryId);
        if (!cat) {
          setNotFound(true);
          setIsDataLoading(false);
          return;
        }
        setOriginalCat(cat);
        setName(cat.name);
        setSlug(cat.slug);
        setDescription(cat.description || "");
        setImage(cat.imageUrl || null);
        setParentId(cat.parentId || "");
        setActive(cat.status === "active");
        setFeatured(cat.featured || false);
        setSeoTitle(cat.seoTitle || "");
        setSeoDesc(cat.seoDescription || "");
        setIsDataLoading(false);
      }
    }).catch(() => {
      if (!active) return;
      setIsDataLoading(false);
    });

    return () => { active = false; };
  }, [mode, categoryId]);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(v));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: description.trim() || undefined,
        imageUrl: image || undefined,
        parentId: parentId || undefined,
        status: active ? "active" : "inactive",
        featured,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDesc.trim() || undefined,
      };

      if (mode === "edit" && categoryId) {
        await storeCategories.update(categoryId, payload);
      } else {
        await storeCategories.create(payload);
      }
      router.push("/store/categories");
    } catch (err) {
      console.error("Save failed:", err);
      alert(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const isEdit = mode === "edit";
  const pageTitle = isEdit ? t("editCategory") : t("addCategory");

  if (!isLoaded || isDataLoading) {
    return <FormSkeleton />;
  }

  if (notFound) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 min-h-96"
      >
        <p className="text-muted-foreground">Category not found.</p>
        <Button onClick={() => router.push("/store/categories")}>
          Back to Categories
        </Button>
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
            isEdit ? t("updateCategoryDetails") : t("createNewCategory")
          }
          breadcrumbs={[
            { label: t("store"), href: "/store" },
            { label: t("title"), href: "/store/categories" },
            { label: pageTitle },
          ]}
        >
          <button
            onClick={() => router.push("/store/categories")}
            className="rounded-sm border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer"
          >
            {t("cancel")}
          </button>
          <Button
            size="lg"
            radius="sm"
            className="px-4"
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {isEdit ? t("saveChanges") : t("save")}
          </Button>
        </PageHeader>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start"
        >
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-5">
            <Card title={t("basicInformation")}>
              <F
                label={
                  <>
                    {t("categoryName")}{" "}
                    <span className="text-destructive">*</span>
                  </>
                }
              >
                <Input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Summer Collection"
                  className={inp}
                />
              </F>
              <F label={t("slug")}>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="summer-collection"
                  className={inp}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Auto-generated from name. Edit to customise.
                </p>
              </F>
              <F label={t("description")}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe this category…"
                  className={ta}
                />
              </F>
            </Card>

            <Card title={t("thumbnailImage")}>
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

            <Card title={t("seo")}>
              <F label={t("seoTitle")}>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Category SEO title…"
                  className={inp}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {seoTitle.length}/60
                </p>
              </F>
              <F label={t("metaDescription")}>
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
                    {t("preview")}
                  </p>
                  <p className="text-[13px] text-blue-500 font-medium truncate">
                    {seoTitle || name}
                  </p>
                  <p className="text-[11px] text-green-600 dark:text-green-400 truncate">
                    yourstore.com &rsaquo; categories &rsaquo;{" "}
                    {slug || "category-slug"}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {seoDesc || description || t("noDescriptionProvided")}
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* ── Sidebar ── */}
          <div className="top-5 sticky space-y-5">
            <Card title={t("visibility")}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("active")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("showInStore")}
                    </p>
                  </div>
                  <Switch checked={active} onCheckedChange={setActive} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("featured")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("highlightHomepage")}
                    </p>
                  </div>
                  <Switch checked={featured} onCheckedChange={setFeatured} />
                </div>
              </div>
            </Card>

            <Card title={t("parentCategory")}>
              <p className="text-xs text-muted-foreground -mt-1 mb-1">
                {t("leaveEmpty")}
              </p>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className={sel}
              >
                <option value="">{t("none")}</option>
                {parentOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {" ".repeat(o.depth * 4)}
                    {o.depth > 0 ? "↳ " : ""}
                    {o.name}
                  </option>
                ))}
              </select>
            </Card>
          </div>
        </motion.div>

        {/* Sticky bottom save bar */}
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-background/80 backdrop-blur-md border-t border-border/60 flex items-center justify-between gap-4 z-10">
          <p className="text-xs text-muted-foreground hidden sm:block">
            {t("unsavedChanges")}
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => router.push("/store/categories")}
              className="rounded-sm border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all cursor-pointer shadow-sm shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {isEdit ? t("saveChanges") : t("publish")}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
