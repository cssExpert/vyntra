"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MoveLeft, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CmsBlogDetail, CmsBlogSaveDto, OrgMember } from "@/lib/api";
import {
  apiGetOrgMembers,
  cmsBlogs,
  cmsBlogCategories,
  cmsBlogTags,
} from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { EditorStepTabs, type EditorTab } from "./EditorStepTabs";
import { WritingTab } from "./WritingTab";
import { MetadataTab } from "./MetadataTab";
import { SeoTab } from "./SeoTab";
import { PublishTab } from "./PublishTab";
import { EditorSidebar } from "./EditorSidebar";
import { DevicePreviewModal } from "./DevicePreviewModal";
import { PublishSummaryModal } from "./PublishSummaryModal";
import { ToastStack, useToasts } from "./Toasts";
import {
  calculateSeoScore,
  emptyBlogForm,
  slugify,
  stripHtml,
  type AuthorProfile,
  type BlogEditorStatus,
  type BlogFormState,
} from "./types";

function mapStatus(
  published: boolean,
  publishedAt: string | null,
): BlogEditorStatus {
  if (published) return "published";
  if (publishedAt && new Date(publishedAt) > new Date()) return "scheduled";
  return "draft";
}

function authorNameToId(
  name: string | null,
  profiles: AuthorProfile[],
): string {
  if (!name) return profiles[0]?.id ?? "";
  const match = profiles.find((p) => p.name === name);
  return match?.id ?? profiles[0]?.id ?? "";
}

function authorIdToName(id: string, profiles: AuthorProfile[]): string {
  const match = profiles.find((p) => p.id === id);
  return match?.name ?? id;
}

function detailToForm(
  blog: CmsBlogDetail,
  profiles: AuthorProfile[],
): BlogFormState {
  const base = emptyBlogForm();
  return {
    ...base,
    title: blog.title,
    subtitle: blog.subtitle ?? "",
    slug: blog.slug,
    content: blog.body ?? "",
    excerpt: blog.excerpt ?? "",
    coverImage: blog.coverImage ?? base.coverImage,
    tags: blog.tags ?? [],
    category: blog.category
      ? blog.category
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [],
    seoTitle: blog.seoTitle ?? blog.title.substring(0, 60),
    seoDesc: blog.metaDesc ?? "",
    keywords: blog.keywords ?? "",
    author: authorNameToId(blog.author, profiles),
    status: mapStatus(blog.published, blog.publishedAt ?? null),
    visibility: (blog.visibility as BlogFormState["visibility"]) ?? "public",
    allowComments: blog.allowComments,
    isFeatured: blog.isFeatured,
    pinToTop: blog.pinToTop,
    publishDate: blog.publishedAt
      ? new Date(blog.publishedAt).toISOString().split("T")[0]
      : base.publishDate,
    publishTime: blog.publishedAt
      ? new Date(blog.publishedAt).toISOString().split("T")[1].substring(0, 5)
      : base.publishTime,
  };
}

export interface BlogEditorProps {
  /** When provided, the editor is in "edit" mode and prefills from this record. */
  blog?: CmsBlogDetail;
}

export function BlogEditor({ blog }: BlogEditorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toasts, addToast, dismiss } = useToasts();
  const [saving, setSaving] = useState(false);
  const [savedBlog, setSavedBlog] = useState<CmsBlogDetail | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableAuthors, setAvailableAuthors] = useState<AuthorProfile[]>([]);

  const [form, setForm] = useState<BlogFormState>(() =>
    blog ? emptyBlogForm() : emptyBlogForm(),
  );

  const [activeTab, setActiveTab] = useState<EditorTab>("editor");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    cmsBlogCategories
      .list()
      .then((cats) => setAvailableCategories(cats.map((c) => c.name)))
      .catch(() => {});
    cmsBlogTags
      .list()
      .then((tags) => setAvailableTags(tags.map((t) => t.name)))
      .catch(() => {});

    apiGetOrgMembers()
      .then((members) => {
        const profiles: AuthorProfile[] = members.map((m: OrgMember) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role
            .toLowerCase()
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
        }));
        setAvailableAuthors(profiles);

        // Prefill form: editing an existing blog → match stored author name;
        // new blog → default to the current logged-in user.
        setForm((prev) => {
          if (blog) {
            return { ...prev, ...detailToForm(blog, profiles) };
          }
          const currentUserProfile = profiles.find((p) => p.id === user?.id);
          return {
            ...prev,
            author: currentUserProfile?.id ?? profiles[0]?.id ?? "",
          };
        });
      })
      .catch(() => {
        // If members can't be loaded (e.g. super-admin), fall back to current user only
        if (user) {
          const fallback: AuthorProfile[] = [
            {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          ];
          setAvailableAuthors(fallback);
          setForm((prev) => ({
            ...prev,
            ...(blog ? detailToForm(blog, fallback) : { author: user.id }),
          }));
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTagCreate = async (name: string) => {
    try {
      await cmsBlogTags.findOrCreate(name);
      setAvailableTags((prev) =>
        prev.includes(name)
          ? prev
          : [...prev, name].sort((a, b) => a.localeCompare(b)),
      );
    } catch {
      // tag still gets added to the post even if catalog sync fails
    }
  };

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(blog));
  const [seoTitleManuallyEdited, setSeoTitleManuallyEdited] = useState(
    Boolean(blog),
  );
  const [seoDescManuallyEdited, setSeoDescManuallyEdited] = useState(
    Boolean(blog?.metaDesc),
  );
  const [readTimeManuallyEdited, setReadTimeManuallyEdited] = useState(false);

  const patch = (partial: Partial<BlogFormState>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  useEffect(() => {
    if (!slugManuallyEdited && form.title) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title, slugManuallyEdited]);

  useEffect(() => {
    if (!seoTitleManuallyEdited) {
      setForm((prev) => ({ ...prev, seoTitle: prev.title.substring(0, 60) }));
    }
  }, [form.title, seoTitleManuallyEdited]);

  useEffect(() => {
    if (!seoDescManuallyEdited) {
      setForm((prev) => ({ ...prev, seoDesc: prev.excerpt.substring(0, 160) }));
    }
  }, [form.excerpt, seoDescManuallyEdited]);

  useEffect(() => {
    if (readTimeManuallyEdited) return;
    const text = stripHtml(form.content);
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 220));
    setForm((prev) =>
      prev.readTime === minutes ? prev : { ...prev, readTime: minutes },
    );
  }, [form.content, readTimeManuallyEdited]);

  const seoScore = useMemo(() => calculateSeoScore(form), [form]);

  const buildDto = (): CmsBlogSaveDto => ({
    title: form.title,
    subtitle: form.subtitle || undefined,
    slug: form.slug,
    body: form.content || undefined,
    excerpt: form.excerpt || undefined,
    coverImage: form.coverImage || undefined,
    tags: form.tags,
    author: authorIdToName(form.author, availableAuthors),
    category: form.category.length > 0 ? form.category.join(",") : undefined,
    seoTitle: form.seoTitle || undefined,
    metaDesc: form.seoDesc || undefined,
    keywords: form.keywords || undefined,
    published: form.status === "published",
    publishedAt:
      form.status === "draft"
        ? null
        : `${form.publishDate}T${form.publishTime}:00`,
    visibility: form.visibility,
    allowComments: form.allowComments,
    isFeatured: form.isFeatured,
    pinToTop: form.pinToTop,
  });

  const handlePublish = async () => {
    if (!form.title.trim()) {
      addToast("Title is required to save the post", "error");
      setActiveTab("editor");
      return;
    }
    if (!form.slug.trim()) {
      addToast("Slug is required", "error");
      setActiveTab("editor");
      return;
    }

    setSaving(true);
    try {
      const dto = buildDto();
      const result = blog
        ? await cmsBlogs.update(blog.id, dto)
        : await cmsBlogs.create(dto);
      setSavedBlog(result);
      setShowSummary(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save blog post";
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => router.push("/cms/blogs");

  return (
    <div className="w-full -mt-4 md:-mt-6 pb-16">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-11 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3.5 mb-6 bg-background/90 backdrop-blur-md border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={goBack}
            className="w-9 h-9 shrink-0 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title="Back to blog list"
          >
            <MoveLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-foreground truncate">
              {blog ? "Edit Blog Post" : "Add New Blog Post"}
            </h1>
            <p className="text-[11px] text-muted-foreground truncate">
              {blog
                ? blog.title
                : "Draft a new article with live SEO + preview"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <span>SEO</span>
            <span className="font-extrabold">{seoScore}%</span>
          </div>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            startIcon={<Eye className="w-4 h-4 text-primary" />}
          >
            <span className="hidden sm:inline">Preview</span>
          </Button>

          <Button
            size="lg"
            startIcon={<Check />}
            onClick={handlePublish}
            className="active:scale-[0.98]"
          >
            <span>{saving ? "Saving…" : "Save & Publish"}</span>
          </Button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        <div className="lg:col-span-8 space-y-6">
          <EditorStepTabs active={activeTab} onChange={setActiveTab} />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {activeTab === "editor" && (
                <WritingTab
                  form={form}
                  patch={patch}
                  slugManuallyEdited={slugManuallyEdited}
                  setSlugManuallyEdited={setSlugManuallyEdited}
                  onNext={() => setActiveTab("metadata")}
                  onToast={addToast}
                />
              )}
              {activeTab === "metadata" && (
                <MetadataTab
                  form={form}
                  patch={patch}
                  availableCategories={availableCategories}
                  availableTags={availableTags}
                  onTagCreate={handleTagCreate}
                  onBack={() => setActiveTab("editor")}
                  onNext={() => setActiveTab("seo")}
                  onToast={addToast}
                />
              )}
              {activeTab === "seo" && (
                <SeoTab
                  form={form}
                  patch={patch}
                  setSeoTitleManuallyEdited={setSeoTitleManuallyEdited}
                  setSeoDescManuallyEdited={setSeoDescManuallyEdited}
                  onBack={() => setActiveTab("metadata")}
                  onNext={() => setActiveTab("publish")}
                />
              )}
              {activeTab === "publish" && (
                <PublishTab
                  form={form}
                  patch={patch}
                  availableAuthors={availableAuthors}
                  onBack={() => setActiveTab("seo")}
                  onPublish={handlePublish}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-24 self-start">
          <EditorSidebar
            form={form}
            patch={patch}
            seoScore={seoScore}
            availableAuthors={availableAuthors}
            onInspect={() => setIsPreviewOpen(true)}
            readTimeManuallyEdited={readTimeManuallyEdited}
            onReadTimeManualEdit={() => setReadTimeManuallyEdited(true)}
            onReadTimeAutoReset={() => setReadTimeManuallyEdited(false)}
          />
        </div>
      </motion.div>

      {/* ── Overlays ───────────────────────────────────────────────────── */}
      <DevicePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        form={form}
      />
      <PublishSummaryModal
        isOpen={showSummary}
        onClose={() => {
          setShowSummary(false);
          goBack();
        }}
        form={savedBlog ? detailToForm(savedBlog, availableAuthors) : form}
        seoScore={seoScore}
        availableAuthors={availableAuthors}
        onCopyLink={() => addToast("Copied feed slug URL", "info")}
      />
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
