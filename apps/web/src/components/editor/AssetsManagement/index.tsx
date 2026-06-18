"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Search,
  Grid,
  List,
  Trash2,
  Copy,
  ExternalLink,
  HardDrive,
  Info,
  Layers,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";
import { mediaAssets, type MediaAsset } from "@/lib/api";
import { storageService } from "@/lib/storage";
import { useAuth } from "@/providers/AuthProvider";

// ── Helpers ────────────────────────────────────────────────────────────────────

type FileCategory = "all" | "image" | "video" | "audio" | "document";

function mimeToCategory(fileType: string): Exclude<FileCategory, "all"> {
  if (fileType.startsWith("image/")) return "image";
  if (fileType.startsWith("video/")) return "video";
  if (fileType.startsWith("audio/")) return "audio";
  return "document";
}

function mimeToFormat(fileType: string): string {
  const sub = fileType.split("/")[1] ?? fileType;
  return sub.replace(/^x-/, "").replace(/^vnd\./, "").toUpperCase().slice(0, 6);
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AssetsManagement() {
  const { user } = useAuth();
  const companyId = user?.organizationId ?? "superadmin";

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FileCategory>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const centerScrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ── Data loading ────────────────────────────────────────────────────────────

  const load = useCallback(
    async (pageNum: number, replace: boolean) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await mediaAssets.list({
          module: "cms",
          page: pageNum,
          limit: 30,
        });
        setAssets((prev) => (replace ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
        setHasMore(res.hasMore);
        setPage(pageNum);
        if (replace && res.items.length > 0 && !selectedAsset) {
          setSelectedAsset(res.items[0]);
        }
      } catch {
        triggerToast("Failed to load assets");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    load(1, true);
  }, [load]);

  // Infinite scroll sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          load(page + 1, false);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, load]);

  // Scroll fade tracking
  const updateScrollFades = useCallback(() => {
    const el = centerScrollRef.current;
    if (!el) return;
    setShowTopFade(el.scrollTop > 8);
    setShowBottomFade(el.scrollTop + el.clientHeight < el.scrollHeight - 8);
  }, []);

  useEffect(() => {
    updateScrollFades();
  }, [assets, viewMode, updateScrollFades]);

  // ── Client-side filtering ───────────────────────────────────────────────────

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (
        activeCategory !== "all" &&
        mimeToCategory(a.fileType) !== activeCategory
      )
        return false;
      if (
        searchQuery &&
        !a.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [assets, activeCategory, searchQuery]);

  const counts = useMemo(
    () => ({
      all: assets.length,
      image: assets.filter((a) => a.fileType.startsWith("image/")).length,
      video: assets.filter((a) => a.fileType.startsWith("video/")).length,
      audio: assets.filter((a) => a.fileType.startsWith("audio/")).length,
      document: assets.filter(
        (a) =>
          !a.fileType.startsWith("image/") &&
          !a.fileType.startsWith("video/") &&
          !a.fileType.startsWith("audio/"),
      ).length,
    }),
    [assets],
  );

  // ── Upload ──────────────────────────────────────────────────────────────────

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      await storageService.upload({
        file,
        companyId,
        module: "cms",
        subtype: "general",
        onProgress: setUploadProgress,
      });
      triggerToast("Asset uploaded successfully!");
      await load(1, true);
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDeleteAsset = async (id: string) => {
    try {
      await mediaAssets.delete(id);
      const remaining = assets.filter((a) => a.id !== id);
      setAssets(remaining);
      setTotal((t) => t - 1);
      if (selectedAsset?.id === id) {
        setSelectedAsset(remaining[0] ?? null);
      }
      triggerToast("Asset deleted.");
    } catch {
      triggerToast("Delete failed.");
    }
  };

  // ── Clipboard ───────────────────────────────────────────────────────────────

  const copyToClipboard = (text: string, msg = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text).catch(() => {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
    triggerToast(msg);
  };

  // ── Code snippet ────────────────────────────────────────────────────────────

  const getNextJsSnippet = (asset: MediaAsset): string => {
    const cat = mimeToCategory(asset.fileType);
    if (cat === "image") {
      return `import Image from 'next/image';\n\n<Image\n  src="${asset.url}"\n  alt="${asset.fileName}"\n  width={800}\n  height={600}\n  className="rounded-sm object-cover"\n/>`;
    }
    if (cat === "video") {
      return `<video\n  controls\n  preload="metadata"\n  className="w-full rounded-xl"\n>\n  <source src="${asset.url}" type="${asset.fileType}" />\n</video>`;
    }
    return `<a\n  href="${asset.url}"\n  download\n  className="flex items-center gap-2 hover:underline"\n>\n  Download ${asset.fileName} (${formatBytes(asset.size)})\n</a>`;
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full w-full select-none flex-col overflow-hidden font-sans transition-colors duration-250 antialiased bg-muted text-foreground dark:bg-background dark:text-muted-foreground">
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md transition-all border-border bg-card text-foreground dark:border-border/80 dark:bg-card/95 dark:text-muted-foreground">
          <span>{toastMsg}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={handleUpload}
      />

      <div className="@container flex flex-1 overflow-hidden">
        {/* ── Left sidebar: filters ─────────────────────────────────────────── */}
        <aside className="hidden w-64 min-w-64 max-w-64 shrink-0 flex-col border-r p-4 md:flex justify-between overflow-y-auto transition-colors border-border bg-muted/50 text-muted-foreground dark:border-border/80 dark:bg-card/30 dark:text-muted-foreground">
          <div className="space-y-6">
            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary hover:bg-primary py-3 px-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50 shadow-md shadow-primary/10 dark:hover:bg-primary dark:text-primary-foreground"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Uploading ({uploadProgress}%)</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload New Asset</span>
                </>
              )}
            </button>

            {/* Category filters */}
            <div className="space-y-1">
              <span className="px-2 text-[10px] font-bold tracking-wider uppercase text-muted-foreground dark:text-muted-foreground">
                Categories
              </span>

              {(
                [
                  { id: "all", label: "All Media", Icon: Layers },
                  { id: "image", label: "Images", Icon: ImageIcon },
                  { id: "video", label: "Videos", Icon: Video },
                  { id: "audio", label: "Audio Tracks", Icon: Music },
                  { id: "document", label: "Documents", Icon: FileText },
                ] as const
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveCategory(id);
                    setSearchQuery("");
                  }}
                  className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm transition ${
                    activeCategory === id
                      ? "bg-muted text-primary font-semibold dark:bg-muted/10 dark:text-primary"
                      : "text-muted-foreground hover:bg-card hover:text-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded bg-muted/60 dark:bg-foreground ${
                      activeCategory === id
                        ? "text-primary dark:text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {counts[id]}
                  </span>
                </button>
              ))}
            </div>

            {/* Storage indicator */}
            <div className="rounded-xl bottom-0 sticky border p-3 border-border bg-card shadow-sm dark:border-border dark:bg-card">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
                  Total assets
                </span>
                <span className="font-semibold text-muted-foreground">
                  {total}
                </span>
              </div>
              <button
                onClick={() => load(1, true)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <RefreshCw
                  className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </aside>

        {/* ── Center: file grid ─────────────────────────────────────────────── */}
        <main className="flex flex-1 min-w-0 flex-col overflow-hidden transition-colors bg-card dark:bg-background">
          {/* Toolbar */}
          <div className="sticky flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5 border-border dark:border-border">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="xl"
                className="w-full rounded-sm border pl-10 pr-4 min-h-10 max-h-10 text-sm focus:outline-none focus:border-primary! focus:ring-2 focus:ring-ring/20! transition border-border bg-muted text-foreground placeholder-muted-foreground dark:border-border dark:bg-card dark:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-px bg-muted dark:bg-foreground" />
              <div className="flex items-center rounded-sm p-1 border min-h-10 bg-muted border-border dark:bg-card dark:border-border">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition ${viewMode === "grid" ? "bg-primary text-white dark:bg-primary dark:text-primary-foreground" : "text-muted-foreground hover:text-foreground dark:hover:text-primary"}`}
                  title="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded transition ${viewMode === "list" ? "bg-primary text-white dark:bg-primary dark:text-primary-foreground" : "text-muted-foreground hover:text-foreground dark:hover:text-primary"}`}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Scroll fade wrapper */}
          <div className="relative flex-1 min-h-0 min-w-0">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-10 z-10 transition-opacity duration-200 bg-linear-to-b from-white dark:from-muted to-transparent"
              style={{ opacity: showTopFade ? 1 : 0 }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12.5 z-10 transition-opacity duration-200 bg-linear-to-t from-white dark:from-muted to-transparent"
              style={{ opacity: showBottomFade ? 1 : 0 }}
            />

            <div
              ref={centerScrollRef}
              onScroll={updateScrollFades}
              className="absolute inset-0 flex flex-col overflow-y-auto overflow-x-hidden p-4"
            >
              {loading ? (
                // Skeleton
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-video rounded-lg bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="flex h-full min-h-85 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center border-border bg-muted/20 dark:border-border dark:bg-card/10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border mb-4 bg-muted border-border dark:bg-card dark:border-border">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground dark:text-muted-foreground">
                    {searchQuery || activeCategory !== "all"
                      ? "No matching assets"
                      : "No assets yet"}
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {searchQuery || activeCategory !== "all"
                      ? "Try a different search or category."
                      : "Upload images, videos, or documents to get started."}
                  </p>
                  {!searchQuery && activeCategory === "all" && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-5 rounded-sm bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary transition"
                    >
                      Upload Asset
                    </button>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                  {filteredAssets.map((asset) => {
                    const cat = mimeToCategory(asset.fileType);
                    const isSelected = selectedAsset?.id === asset.id;
                    return (
                      <div
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`group relative flex flex-col overflow-hidden rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary ring-1 ring-ring bg-primary/40 dark:border-primary dark:ring-1 dark:ring-ring dark:bg-card"
                            : "border-border bg-card hover:border-primary hover:bg-muted dark:border-border dark:bg-card/60 dark:hover:border-border/75 dark:hover:bg-card"
                        }`}
                      >
                        <div className="relative aspect-video w-full flex items-center justify-center overflow-hidden border-b bg-muted border-border dark:bg-background dark:border-border">
                          {cat === "image" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={asset.url}
                              alt={asset.fileName}
                              className="h-full w-full object-cover group-hover:scale-105 transition duration-350"
                              loading="lazy"
                            />
                          ) : cat === "video" ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black">
                              <Video className="h-8 w-8 text-primary" />
                            </div>
                          ) : cat === "audio" ? (
                            <div className="flex flex-col items-center gap-1.5">
                              <Music className="h-8 w-8 text-emerald-500" />
                              <span className="text-[10px] text-emerald-600 font-mono">
                                Audio
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1.5">
                              <FileText className="h-8 w-8 text-cyan-500" />
                              <span className="text-[10px] text-cyan-600 font-mono">
                                {mimeToFormat(asset.fileType)}
                              </span>
                            </div>
                          )}

                          <span className="absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[9px] font-mono tracking-wider uppercase border bg-card/95 text-muted-foreground border-border shadow-sm dark:bg-card dark:text-muted-foreground dark:border-border">
                            {mimeToFormat(asset.fileType)}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAsset(asset.id);
                            }}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1.5 rounded-sm transition border bg-card/95 hover:bg-red-50 text-muted-foreground hover:text-red-500 border-border shadow-sm dark:bg-card/90 dark:hover:bg-red-500/20 dark:text-muted-foreground dark:hover:text-red-400 dark:border-border"
                            title="Delete asset"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="p-3">
                          <p
                            className="truncate text-xs font-semibold transition group-hover:text-primary text-foreground dark:text-muted-foreground"
                            title={asset.fileName}
                          >
                            {asset.fileName}
                          </p>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{formatBytes(asset.size)}</span>
                            <span className="capitalize opacity-60">
                              {asset.subtype ?? cat}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // List view
                <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm dark:border-border dark:bg-card/10">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-border bg-muted dark:border-border dark:bg-card">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Format</th>
                        <th className="py-3 px-4">Size</th>
                        <th className="py-3 px-4">Subtype</th>
                        <th className="py-3 px-4">Uploaded</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs divide-border dark:divide-border/60">
                      {filteredAssets.map((asset) => {
                        const cat = mimeToCategory(asset.fileType);
                        const isSelected = selectedAsset?.id === asset.id;
                        return (
                          <tr
                            key={asset.id}
                            onClick={() => setSelectedAsset(asset)}
                            className={`group cursor-pointer transition ${
                              isSelected
                                ? "bg-primary/40 font-semibold dark:bg-muted/60 dark:font-medium"
                                : "hover:bg-muted dark:hover:bg-card/40"
                            }`}
                          >
                            <td className="py-3 px-4 flex items-center gap-2 min-w-50">
                              {cat === "image" ? (
                                <ImageIcon className="h-4 w-4 text-primary" />
                              ) : cat === "video" ? (
                                <Video className="h-4 w-4 text-purple-400" />
                              ) : cat === "audio" ? (
                                <Music className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <FileText className="h-4 w-4 text-cyan-400" />
                              )}
                              <span className="truncate max-w-xs text-foreground dark:text-muted-foreground">
                                {asset.fileName}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground uppercase font-mono">
                              {mimeToFormat(asset.fileType)}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground font-mono">
                              {formatBytes(asset.size)}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground capitalize">
                              {asset.subtype ?? cat}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {asset.createdAt.split("T")[0]}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAsset(asset.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Infinite scroll sentinel */}
              {!loading && <div ref={sentinelRef} className="h-4 mt-2" />}

              {loadingMore && (
                <div className="flex items-center justify-center py-4 gap-2 text-[11px] text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading more…
                </div>
              )}

              {!hasMore && assets.length > 0 && !loading && (
                <p className="text-center text-xs text-muted-foreground py-4">
                  All {total} asset{total !== 1 ? "s" : ""} loaded
                </p>
              )}
            </div>
          </div>
        </main>

        {/* ── Right panel: asset inspector ──────────────────────────────────── */}
        <aside className="w-80 min-w-80 max-w-80 shrink-0 border-l flex flex-col overflow-hidden transition-colors border-border bg-muted/30 dark:border-border/80 dark:bg-card/40">
          <div className="flex-1 min-h-0 overflow-y-auto p-4">
            {selectedAsset ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Asset Inspector
                    </span>
                  </div>

                  {/* Preview */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border flex items-center justify-center border-border bg-card shadow-sm dark:border-border dark:bg-background">
                    {mimeToCategory(selectedAsset.fileType) === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedAsset.url}
                        alt={selectedAsset.fileName}
                        className="h-full w-full object-cover"
                      />
                    ) : mimeToCategory(selectedAsset.fileType) === "video" ? (
                      <video
                        src={selectedAsset.url}
                        controls
                        className="h-full w-full object-contain"
                      />
                    ) : mimeToCategory(selectedAsset.fileType) === "audio" ? (
                      <div className="flex flex-col items-center gap-2">
                        <Music className="h-10 w-10 text-emerald-500" />
                        <audio controls src={selectedAsset.url} className="w-full mt-2 scale-90" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-10 w-10 text-cyan-500" />
                        <span className="text-xs text-muted-foreground">
                          {mimeToFormat(selectedAsset.fileType)} Document
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() =>
                        copyToClipboard(selectedAsset.url, "Asset URL copied!")
                      }
                      className="flex items-center justify-center gap-1.5 rounded-sm border px-3 py-2 text-xs font-semibold transition border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground shadow-xs dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy URL
                    </button>
                    <a
                      href={selectedAsset.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-sm border px-3 py-2 text-xs font-semibold transition border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground shadow-xs dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open Raw
                    </a>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-3.5 border-t pt-5 border-border dark:border-border">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Asset Specifications
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span
                        className="font-semibold truncate max-w-35 text-foreground dark:text-muted-foreground"
                        title={selectedAsset.fileName}
                      >
                        {selectedAsset.fileName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-semibold text-foreground dark:text-muted-foreground">
                        {mimeToFormat(selectedAsset.fileType)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size</span>
                      <span className="font-semibold text-foreground dark:text-muted-foreground">
                        {formatBytes(selectedAsset.size)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Module</span>
                      <span className="font-semibold capitalize text-foreground dark:text-muted-foreground">
                        {selectedAsset.module}
                        {selectedAsset.subtype
                          ? ` / ${selectedAsset.subtype}`
                          : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider</span>
                      <span className="font-semibold uppercase text-foreground dark:text-muted-foreground">
                        {selectedAsset.provider}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uploaded</span>
                      <span className="font-semibold text-foreground dark:text-muted-foreground">
                        {selectedAsset.createdAt.split("T")[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Code snippet */}
                <div className="space-y-3.5 border-t pt-5 border-border dark:border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Next.js Code
                    </span>
                    <button
                      onClick={() => {
                        copyToClipboard(
                          getNextJsSnippet(selectedAsset),
                          "Code snippet copied!",
                        );
                        setCopiedSnippet(true);
                        setTimeout(() => setCopiedSnippet(false), 2000);
                      }}
                      className="flex items-center gap-1 text-[10px] font-bold hover:underline text-primary hover:text-primary"
                    >
                      {copiedSnippet ? "Copied!" : "Copy Snippet"}
                    </button>
                  </div>
                  <div className="rounded-xl border p-3.5 font-mono text-[11px] leading-relaxed border-primary bg-card text-primary dark:border-border/15 dark:bg-foreground/50 dark:text-muted-foreground">
                    <pre className="overflow-x-auto whitespace-pre">
                      {getNextJsSnippet(selectedAsset)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Info className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">
                  No Asset Selected
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Select an asset to view its metadata and code snippet.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
