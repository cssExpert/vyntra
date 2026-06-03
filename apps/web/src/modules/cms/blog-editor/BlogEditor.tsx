"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, Check } from "lucide-react";
import type { CmsBlog } from "../blog-data";
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
  type BlogEditorStatus,
  type BlogFormState,
} from "./types";

// Map the list-row status to the editor's richer status enum.
function mapStatus(status?: CmsBlog["status"]): BlogEditorStatus {
  if (status === "Public") return "published";
  if (status === "Private") return "draft";
  return "draft";
}

export interface BlogEditorProps {
  /** When provided, the editor is in "edit" mode and prefills from this record. */
  blog?: CmsBlog;
}

export function BlogEditor({ blog }: BlogEditorProps) {
  const router = useRouter();
  const { toasts, addToast, dismiss } = useToasts();

  const [form, setForm] = useState<BlogFormState>(() => {
    const base = emptyBlogForm();
    if (!blog) return base;
    return {
      ...base,
      title: blog.title,
      slug: blog.slug,
      author: base.author,
      status: mapStatus(blog.status),
      seoTitle: blog.title.substring(0, 60),
    };
  });

  const [activeTab, setActiveTab] = useState<EditorTab>("editor");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(blog));
  const [seoTitleManuallyEdited, setSeoTitleManuallyEdited] = useState(
    Boolean(blog),
  );
  const [seoDescManuallyEdited, setSeoDescManuallyEdited] = useState(false);

  const patch = (partial: Partial<BlogFormState>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  // Auto-sync slug from the title (unless the user edited it).
  useEffect(() => {
    if (!slugManuallyEdited && form.title) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title, slugManuallyEdited]);

  // Auto-sync SEO title from the title.
  useEffect(() => {
    if (!seoTitleManuallyEdited) {
      setForm((prev) => ({ ...prev, seoTitle: prev.title.substring(0, 60) }));
    }
  }, [form.title, seoTitleManuallyEdited]);

  // Auto-sync SEO description from the excerpt.
  useEffect(() => {
    if (!seoDescManuallyEdited) {
      setForm((prev) => ({ ...prev, seoDesc: prev.excerpt.substring(0, 160) }));
    }
  }, [form.excerpt, seoDescManuallyEdited]);

  // Recompute read time from content length (strip HTML tags first).
  useEffect(() => {
    const text = stripHtml(form.content);
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 220));
    setForm((prev) =>
      prev.readTime === minutes ? prev : { ...prev, readTime: minutes },
    );
  }, [form.content]);

  const seoScore = useMemo(() => calculateSeoScore(form), [form]);

  const handlePublish = () => {
    if (!form.title.trim()) {
      addToast("Title is required to save the post", "error");
      setActiveTab("editor");
      return;
    }
    setShowSummary(true);
  };

  const goBack = () => router.push("/cms/blogs");

  return (
    <div className="pb-16">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3.5 mb-6 bg-background/90 backdrop-blur-md border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={goBack}
            className="w-9 h-9 shrink-0 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title="Back to blog list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-foreground truncate">
              {blog ? "Edit Blog Post" : "Add New Blog Post"}
            </h1>
            <p className="text-[11px] text-muted-foreground truncate">
              {blog ? blog.title : "Draft a new article with live SEO + preview"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <span>SEO</span>
            <span className="font-extrabold">{seoScore}%</span>
          </div>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all"
          >
            <Eye className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          <button
            onClick={handlePublish}
            className="px-4 py-2 bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Save &amp; Publish</span>
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left column */}
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
                  onBack={() => setActiveTab("seo")}
                  onPublish={handlePublish}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right column — sticky on scroll */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 self-start">
          <EditorSidebar
            form={form}
            seoScore={seoScore}
            onInspect={() => setIsPreviewOpen(true)}
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
        form={form}
        seoScore={seoScore}
        onCopyLink={() => addToast("Copied feed slug URL", "info")}
      />
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
