"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  RotateCw,
  FileText,
  ListPlus,
  Check,
  Copy,
  PencilLine,
  Trash2,
  X,
  Feather,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";

import MetaTitle from "./MetaTitle";
import OpenGraphs from "./OpenGraphs";
import Styles from "./Styles";
import Scripts from "./Scripts";
import Favicon from "./Favicon";

type MetaTag = { id: string; name: string; content: string };
type Page = {
  id: string;
  name: string;
  folder: string;
  fileName: string;
  settings: { pageTitle: string; metaTags: MetaTag[] };
};

const INITIAL_PAGES: Page[] = [
  {
    id: "home",
    name: "Home",
    folder: "dashboard",
    fileName: "page.tsx",
    settings: { pageTitle: "Home — My Site", metaTags: [] },
  },
  {
    id: "settings",
    name: "Settings",
    folder: "admin",
    fileName: "settings.tsx",
    settings: { pageTitle: "Settings", metaTags: [] },
  },
];

// ─── Page Settings Modal ──────────────────────────────────────────────────────
function PageSettingsDialog({
  page,
  open,
  onOpenChange,
  onSave,
}: {
  page: Page | undefined;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (id: string, settings: Page["settings"]) => void;
}) {
  const [pageTitle, setPageTitle] = useState("");
  const [metaTags, setMetaTags] = useState<MetaTag[]>([]);

  const pageRef = useRef(page);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    if (!page?.id) return;

    const timer = setTimeout(() => {
      // Read securely from the ref without needing it in the dependency array
      const currentPage = pageRef.current;
      if (currentPage) {
        setPageTitle(currentPage.settings.pageTitle);
        setMetaTags(currentPage.settings.metaTags.map((t) => ({ ...t })));
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [page?.id]); // Linter is happy because 'pageRef' doesn't need to be tracked

  const handleSave = () => {
    if (page) onSave(page.id, { pageTitle, metaTags });
    onOpenChange(false);
  };

  //const inputCls =
  //("w-full min-h-10 w-full min-w-0 border border-input px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 rounded-sm bg-card focus:border-primary! focus:ring-2 focus:ring-ring/20! dark:focus:border-primary! dark:focus-visible:ring-primary/25!");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-250! w-full p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold text-foreground dark:text-foreground">
            Page settings
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
            Edit settings for{" "}
            <span className="font-medium text-primary dark:text-primary">
              {page?.fileName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="meta" className="flex-1 gap-0">
          <div className="px-6 pt-4 border-b border-border dark:border-border">
            <TabsList
              variant="line"
              className="gap-4 h-auto pb-0 w-full justify-start rounded-none bg-transparent"
              data-horizontal
            >
              {["meta", "open graphs", "styles", "scripts", "favicon"].map(
                (tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="flex-0 pb-3 px-4 text-sm capitalize rounded-none border-0 data-[state=active]:text-primary data-[state=active]:after:bg-primary dark:data-[state=active]:after:bg-primary group-data-horizontal/tabs:after:-bottom-0.5!"
                  >
                    {tab === "meta"
                      ? "Meta tags"
                      : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                ),
              )}
            </TabsList>
          </div>

          <div className="px-8 md:px-16 py-8 max-h-125 overflow-y-auto bg-muted dark:bg-background">
            <TabsContent value="meta" className="space-y-5">
              <MetaTitle />
            </TabsContent>

            <TabsContent value="open graphs">
              <OpenGraphs />
            </TabsContent>

            <TabsContent value="styles">
              <Styles />
            </TabsContent>

            <TabsContent value="scripts">
              <Scripts />
            </TabsContent>

            <TabsContent value="favicon">
              <Favicon />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="px-6 py-4 border-t m-0! border-border dark:border-border bg-muted dark:bg-card flex-row justify-end gap-2 rounded-none">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="h-10 rounded-sm bg-primary hover:bg-primary dark:bg-primary dark:hover:bg-primary dark:text-primary-foreground"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AddressBar = () => {
  const [pageList, setPageList] = useState<Page[]>(INITIAL_PAGES);
  const [activePageId, setActivePageId] = useState("home");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [settingsPageId, setSettingsPageId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const addInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const activePage = useMemo(
    () => pageList.find((p) => p.id === activePageId) ?? pageList[0],
    [activePageId, pageList],
  );

  const settingsPage = useMemo(
    () => pageList.find((p) => p.id === settingsPageId),
    [settingsPageId, pageList],
  );

  const handleAddSave = () => {
    const trimmed = newPageName.trim();
    if (!trimmed) return;
    const id = trimmed.toLowerCase().replace(/\s+/g, "-");
    setPageList((prev) => [
      ...prev,
      {
        id,
        name: trimmed,
        folder: "pages",
        fileName: `${id}.tsx`,
        settings: { pageTitle: trimmed, metaTags: [] },
      },
    ]);
    setNewPageName("");
    setIsAdding(false);
  };

  const handleDuplicate = (page: Page) => {
    const newId = `${page.id}-${nanoid(4)}`;
    const copy: Page = {
      ...page,
      id: newId,
      name: `${page.name} Copy`,
      fileName: `${page.id}-copy.tsx`,
      settings: {
        ...page.settings,
        metaTags: page.settings.metaTags.map((t) => ({ ...t })),
      },
    };
    setPageList((prev) => {
      const idx = prev.findIndex((p) => p.id === page.id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const handleDelete = (id: string) => {
    setPageList((prev) => prev.filter((p) => p.id !== id));
    if (activePageId === id) {
      const remaining = pageList.filter((p) => p.id !== id);
      if (remaining.length > 0) setActivePageId(remaining[0].id);
    }
  };

  const handleEditStart = (page: Page) => {
    setEditingPageId(page.id);
    setEditingName(page.fileName);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const handleEditSave = (id: string) => {
    const trimmed = editingName.trim();
    if (trimmed) {
      setPageList((prev) =>
        prev.map((p) => (p.id === id ? { ...p, fileName: trimmed } : p)),
      );
    }
    setEditingPageId(null);
    setEditingName("");
  };

  const handleOpenSettings = (page: Page) => {
    setSettingsPageId(page.id);
    setDropdownOpen(false);
    setDialogOpen(true);
  };

  const handleSettingsSave = (id: string, settings: Page["settings"]) => {
    setPageList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, settings } : p)),
    );
  };

  const stopProp = (e: React.PointerEvent | React.MouseEvent) =>
    e.stopPropagation();

  const iconBtnCls =
    "h-6 w-6 flex items-center justify-center rounded transition-colors text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10";

  return (
    <>
      <div className="min-w-0 flex-1 mx-1 md:mx-4">
        <div className="flex flex-1 items-center justify-center">
          <div className="@container group focus-within:border-border relative bg-card dark:bg-muted flex h-9 flex-1 items-center overflow-hidden rounded-md border border-border dark:border-border p-1 transition-all sm:max-w-125">
            <Button
              variant="ghost"
              size="default"
              disabled
              className="pointer-events-auto h-5 w-5 rounded-md p-1 disabled:pointer-events-auto disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="default"
              disabled
              className="pointer-events-auto h-5 w-5 rounded-md p-1 disabled:pointer-events-auto disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>

            <div className="shrink-0 rounded-sm w-5 h-5 flex items-center justify-center bg-primary text-white dark:bg-primary dark:text-primary-foreground">
              <Feather className="w-3 h-3" />
            </div>

            <div className="flex h-full flex-1 cursor-text items-center pl-2 min-w-0">
              <p className="truncate text-xs font-medium text-muted-foreground dark:text-muted-foreground max-w-21 @[280px]:max-w-35 @[380px]:max-w-55 @[460px]:max-w-full">
                {activePage?.name}/{activePage?.folder}/{activePage?.fileName}
              </p>
            </div>

            <div className="flex items-center">
              <DropdownMenu
                open={dropdownOpen}
                onOpenChange={(open) => {
                  setDropdownOpen(open);
                  if (!open) {
                    setIsAdding(false);
                    setEditingPageId(null);
                  }
                }}
              >
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="default"
                      className="pointer-events-auto h-7 w-7 rounded-md p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary dark:text-muted-foreground dark:hover:text-primary hidden @[320px]:flex"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  }
                />

                <DropdownMenuContent align="end" className="min-w-75 p-1">
                  {/* Page rows */}
                  {pageList.map((page) => (
                    <div
                      key={page.id}
                      className="group/item relative flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted dark:hover:bg-muted transition-colors"
                      onPointerDown={stopProp}
                    >
                      {editingPageId === page.id ? (
                        /* Inline edit mode */
                        <div
                          className="flex flex-1 items-center gap-2"
                          onPointerDown={stopProp}
                        >
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <input
                            ref={editInputRef}
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === "Enter") handleEditSave(page.id);
                              if (e.key === "Escape") setEditingPageId(null);
                            }}
                            onBlur={() => handleEditSave(page.id)}
                            className="flex-1 text-xs border border-primary dark:border-primary rounded px-2 py-1 bg-card text-foreground dark:text-foreground outline-none"
                          />
                          <button
                            onPointerDown={stopProp}
                            onClick={() => handleEditSave(page.id)}
                            className={iconBtnCls}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Page name — click to select */}
                          <button
                            className={cn(
                              "flex flex-1 items-center gap-2 text-sm text-left min-w-0",
                              activePageId === page.id
                                ? "text-primary dark:text-primary"
                                : "text-muted-foreground dark:text-muted-foreground",
                            )}
                            onClick={() => {
                              setActivePageId(page.id);
                              setDropdownOpen(false);
                            }}
                          >
                            <FileText className="h-4 w-4 shrink-0" />
                            <span className="truncate">{page.fileName}</span>
                          </button>

                          {/* Hover action icons */}
                          <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
                            <button
                              onPointerDown={stopProp}
                              onClick={() => handleOpenSettings(page)}
                              className={iconBtnCls}
                              title="Settings"
                            >
                              <Settings className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onPointerDown={stopProp}
                              onClick={() => handleDuplicate(page)}
                              className={iconBtnCls}
                              title="Duplicate"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onPointerDown={stopProp}
                              onClick={() => handleEditStart(page)}
                              className={iconBtnCls}
                              title="Rename"
                            >
                              <PencilLine className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onPointerDown={stopProp}
                              onClick={() => handleDelete(page.id)}
                              className={cn(
                                iconBtnCls,
                                "hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10",
                              )}
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  <DropdownMenuSeparator />

                  {/* Inline add form */}
                  {isAdding && (
                    <div
                      className="px-2 py-1.5 flex items-center gap-2"
                      onPointerDown={stopProp}
                    >
                      <input
                        ref={addInputRef}
                        value={newPageName}
                        onChange={(e) => setNewPageName(e.target.value)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") handleAddSave();
                          if (e.key === "Escape") setIsAdding(false);
                        }}
                        placeholder="Page name…"
                        className="flex-1 text-xs rounded-sm border border-border dark:border-border bg-card text-foreground dark:text-foreground px-2 py-1.5 min-h-8 max-h-8 outline-none focus:border-primary dark:focus:border-primary placeholder:text-muted-foreground"
                      />
                      <button
                        onPointerDown={stopProp}
                        onClick={handleAddSave}
                        className="shrink-0 h-8 w-8 flex items-center justify-center rounded-md bg-primary dark:bg-primary text-white dark:text-primary-foreground hover:bg-primary transition-colors"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onPointerDown={stopProp}
                        onClick={() => setIsAdding(false)}
                        className="shrink-0 h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted dark:hover:bg-muted transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Add a page */}
                  <div
                    role="button"
                    onPointerDown={stopProp}
                    onClick={() => {
                      setIsAdding(true);
                      setTimeout(() => addInputRef.current?.focus(), 0);
                    }}
                    className="flex items-center justify-center gap-2 p-2.25 rounded-md text-sm cursor-pointer text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors"
                  >
                    <ListPlus className="h-4 w-4" />
                    Add a page
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="default"
                        className="pointer-events-auto h-7 w-7 rounded-md p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary dark:text-muted-foreground dark:hover:text-primary hidden @[320px]:flex"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <TooltipContent>Refresh page</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Page Settings Modal — rendered outside dropdown to avoid portal conflicts */}
      <PageSettingsDialog
        page={settingsPage}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSettingsSave}
      />
    </>
  );
};

export default AddressBar;
