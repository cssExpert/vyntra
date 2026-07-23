"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Home,
  ShoppingBag,
  Phone,
  BookOpen,
  Navigation,
  Rows,
  LayoutTemplate,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import {
  cmsThemes,
  cmsPages,
  type ThemeInstallPreview,
  type ThemeInstallResult,
} from "@/lib/api";
import { getThemePageDefaults } from "@/lib/themes/pageDefaultsResolver";

const PAGE_ICONS: Record<string, React.ElementType> = {
  home: Home,
  shop: ShoppingBag,
  "contact-us": Phone,
  "about-us": FileText,
  blog: BookOpen,
};

interface Props {
  open: boolean;
  themeIdentifier: string;
  themeName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ThemeInstallModal({
  open,
  themeIdentifier,
  themeName,
  onClose,
  onSuccess,
}: Props) {
  const [preview, setPreview] = useState<ThemeInstallPreview | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [installMenus, setInstallMenus] = useState(true);
  const [installLayout, setInstallLayout] = useState(true);
  const [overwrite, setOverwrite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [result, setResult] = useState<ThemeInstallResult | null>(null);

  useEffect(() => {
    if (!open) {
      setResult(null);
      setPreview(null);
      return;
    }
    setLoading(true);
    cmsThemes
      .installPreview(themeIdentifier)
      .then((data) => {
        setPreview(data);
        setSelectedPages(
          new Set(data.pages.filter((p) => !p.exists).map((p) => p.slug)),
        );
        setInstallMenus(true);
        setInstallLayout(true);
        setOverwrite(false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, themeIdentifier]);

  function togglePage(slug: string) {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }

  function toggleAll() {
    if (!preview) return;
    if (selectedPages.size === preview.pages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(preview.pages.map((p) => p.slug)));
    }
  }

  async function handleInstall() {
    setInstalling(true);
    try {
      const res = await cmsThemes.install(themeIdentifier, {
        pageSlugs: [...selectedPages],
        installMenus,
        installLayout,
        overwrite,
      });

      // Seed installed pages with default block content from the theme
      if (res.pages.installed.length > 0) {
        const defaults = getThemePageDefaults(themeIdentifier);
        await Promise.allSettled(
          res.pages.installed
            .filter((slug) => defaults[slug])
            .map((slug) =>
              cmsPages.save(slug, {
                content: JSON.stringify(defaults[slug]),
                publish: true,
              }),
            ),
        );
      }

      setResult(res);
      const didInstallSomething =
        res.pages.installed.length > 0 ||
        res.menus.installed.length > 0 ||
        res.layout !== null;
      if (didInstallSomething) onSuccess();
    } catch {
      setResult({
        pages: { installed: [], skipped: [] },
        menus: { installed: [], skipped: [] },
        layout: null,
      });
    } finally {
      setInstalling(false);
    }
  }

  const existingPagesSelected =
    preview?.pages.filter((p) => selectedPages.has(p.slug) && p.exists) ?? [];
  const existingMenus = preview?.menus.filter((m) => m.exists) ?? [];
  const showOverwriteWarning =
    (existingPagesSelected.length > 0 && selectedPages.size > 0) ||
    (installMenus && existingMenus.length > 0) ||
    (installLayout && preview?.layout.exists);

  const totalActions =
    selectedPages.size +
    (installMenus ? (preview?.menus.length ?? 0) : 0) +
    (installLayout ? 1 : 0);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={`Install ${themeName} Starter Content`}
      description="Set up your site with demo pages, navigation menus, and a default layout — ready to customise."
      icon={<Download size={18} />}
      maxWidth="lg"
      footer={
        <>
          <div className="flex items-center justify-between pt-1 gap-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {totalActions === 0
                ? "Nothing selected"
                : `${totalActions} item${totalActions !== 1 ? "s" : ""} to install`}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleInstall}
                disabled={totalActions === 0 || installing}
                className="bg-[#e4611e] hover:bg-[#cf5519] text-white"
              >
                {installing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Installing…
                  </>
                ) : (
                  <>
                    <Download size={13} /> Install {totalActions} Item
                    {totalActions !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      }
    >
      <div className="px-6 pb-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={22} className="animate-spin text-muted-foreground" />
          </div>
        ) : result ? (
          /* ── Result screen ─────────────────────────────────────────────── */
          <div className="space-y-3">
            {result.pages.installed.length > 0 && (
              <ResultRow
                icon={<CheckCircle2 size={16} className="text-emerald-600" />}
                color="emerald"
                label={`${result.pages.installed.length} page${result.pages.installed.length !== 1 ? "s" : ""} installed`}
                detail={result.pages.installed.join(", ")}
              />
            )}
            {result.menus.installed.length > 0 && (
              <ResultRow
                icon={<CheckCircle2 size={16} className="text-emerald-600" />}
                color="emerald"
                label={`${result.menus.installed.length} menu${result.menus.installed.length !== 1 ? "s" : ""} installed`}
                detail={result.menus.installed.join(", ")}
              />
            )}
            {result.layout && (
              <ResultRow
                icon={<CheckCircle2 size={16} className="text-emerald-600" />}
                color="emerald"
                label={`Layout "${result.layout}" set as default`}
                detail="Navigation and footer columns wired up"
              />
            )}
            {result.pages.skipped.length > 0 && (
              <ResultRow
                icon={<AlertTriangle size={16} className="text-amber-600" />}
                color="amber"
                label={`${result.pages.skipped.length} page${result.pages.skipped.length !== 1 ? "s" : ""} skipped (already exist)`}
                detail={result.pages.skipped.join(", ")}
              />
            )}
            {result.menus.skipped.length > 0 && (
              <ResultRow
                icon={<AlertTriangle size={16} className="text-amber-600" />}
                color="amber"
                label={`${result.menus.skipped.length} menu${result.menus.skipped.length !== 1 ? "s" : ""} skipped (already exist)`}
                detail={result.menus.skipped.join(", ")}
              />
            )}
            <Button
              onClick={onClose}
              className="w-full mt-2 bg-[#e4611e] hover:bg-[#cf5519] text-white"
            >
              Done
            </Button>
          </div>
        ) : (
          preview && (
            /* ── Selection screen ──────────────────────────────────────────── */
            <>
              {/* ── Pages ── */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={13} className="text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      Pages
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      ({preview.pages.length})
                    </span>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={toggleAll}
                    className="text-[11px] h-auto p-0"
                  >
                    {selectedPages.size === preview.pages.length
                      ? "Deselect all"
                      : "Select all"}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {preview.pages.map((page) => {
                    const Icon = PAGE_ICONS[page.slug] ?? FileText;
                    const checked = selectedPages.has(page.slug);
                    return (
                      <label
                        key={page.slug}
                        className={[
                          "flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none",
                          checked
                            ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20"
                            : "border-border hover:border-orange-300",
                        ].join(" ")}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePage(page.slug)}
                          className="accent-orange-500 w-3.5 h-3.5 shrink-0"
                        />
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: "#e4611e18" }}
                        >
                          <Icon size={13} style={{ color: "#e4611e" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-foreground">
                              {page.title}
                            </span>
                            {page.isLandingPage && (
                              <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                Home
                              </span>
                            )}
                            {page.exists && (
                              <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                                Exists
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            /{page.slug}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>

              <div className="border-t border-border" />

              {/* ── Menus ── */}
              <section className="space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={installMenus}
                    onChange={(e) => setInstallMenus(e.target.checked)}
                    className="accent-orange-500 w-3.5 h-3.5"
                  />
                  <Navigation size={13} className="text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Menus
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ({preview.menus.length} menus)
                  </span>
                </label>
                {installMenus && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5">
                    {preview.menus.map((menu) => (
                      <div
                        key={menu.slug}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-muted/20"
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: "#e4611e18" }}
                        >
                          {menu.role === "nav" ? (
                            <Navigation
                              size={12}
                              style={{ color: "#e4611e" }}
                            />
                          ) : (
                            <Rows size={12} style={{ color: "#e4611e" }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-foreground">
                              {menu.name}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {menu.itemCount} links
                            </span>
                            {menu.exists && (
                              <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                                Exists
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground capitalize">
                            {menu.menuType}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ── Layout ── */}
              <section>
                <label className="flex items-center gap-2.5 px-3 py-3 rounded-xl border border-border bg-muted/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={installLayout}
                    onChange={(e) => setInstallLayout(e.target.checked)}
                    className="accent-orange-500 w-3.5 h-3.5 shrink-0"
                  />
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#e4611e18" }}
                  >
                    <LayoutTemplate size={13} style={{ color: "#e4611e" }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        Default Layout — &rdquo;{preview.layout.name}&rdquo;
                      </span>
                      {preview.layout.exists && (
                        <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                          Exists
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Wires menus to nav & footer · set as default for all pages
                    </p>
                  </div>
                </label>
              </section>

              {/* ── Overwrite warning ── */}
              {showOverwriteWarning && (
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overwrite}
                    onChange={(e) => setOverwrite(e.target.checked)}
                    className="mt-0.5 accent-orange-500 w-3.5 h-3.5 shrink-0"
                  />
                  <div>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                      Overwrite existing items
                    </p>
                    <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-0.5">
                      Some pages / menus already exist. Check this to replace
                      them with demo content.
                    </p>
                  </div>
                </label>
              )}
            </>
          )
        )}
      </div>
    </Modal>
  );
}

function ResultRow({
  icon,
  color,
  label,
  detail,
}: {
  icon: React.ReactNode;
  color: "emerald" | "amber";
  label: string;
  detail: string;
}) {
  const bg =
    color === "emerald"
      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
      : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800";
  const text =
    color === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : "text-amber-700 dark:text-amber-400";
  const sub =
    color === "emerald"
      ? "text-emerald-600 dark:text-emerald-500"
      : "text-amber-600 dark:text-amber-500";

  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${bg}`}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className={`text-xs font-semibold ${text}`}>{label}</p>
        <p className={`text-[11px] mt-0.5 ${sub}`}>{detail}</p>
      </div>
    </div>
  );
}
