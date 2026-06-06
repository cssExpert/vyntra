import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";

type AssetFolder = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
};

type AssetFile = {
  id: string;
  name: string;
  type: string;
  url: string;
  size: string;
  format: string;
  parentId: string | null;
  createdAt: string;
  resolution?: string;
  duration?: string;
  pages?: number;
};
import {
  Upload,
  Folder,
  FolderPlus,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Search,
  Grid,
  List,
  Trash2,
  Copy,
  ChevronRight,
  X,
  Check,
  ExternalLink,
  HardDrive,
  Info,
  Layers,
  RefreshCw,
} from "lucide-react";

// Mock Initial Data for Assets
const INITIAL_FOLDERS = [
  {
    id: "f-1",
    name: "Hero Backgrounds",
    parentId: null,
    createdAt: "2026-05-10",
  },
  {
    id: "f-2",
    name: "Logos & Branding",
    parentId: null,
    createdAt: "2026-05-12",
  },
  {
    id: "f-3",
    name: "Product Screenshots",
    parentId: "f-1",
    createdAt: "2026-05-15",
  },
  { id: "f-4", name: "Audio Tracks", parentId: null, createdAt: "2026-05-18" },
];

const INITIAL_FILES = [
  {
    id: "img-1",
    name: "neon-linear-hero.png",
    type: "image",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    size: "1.2 MB",
    resolution: "1920x1080",
    format: "PNG",
    parentId: "f-1",
    createdAt: "2026-05-11",
  },
  {
    id: "img-2",
    name: "abstract-wave-flow.jpg",
    type: "image",
    url: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&auto=format&fit=crop&q=60",
    size: "840 KB",
    resolution: "2400x1600",
    format: "JPEG",
    parentId: "f-1",
    createdAt: "2026-05-14",
  },
  {
    id: "img-3",
    name: "company-logo-dark.svg",
    type: "image",
    url: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800&auto=format&fit=crop&q=60",
    size: "14 KB",
    resolution: "Vector",
    format: "SVG",
    parentId: "f-2",
    createdAt: "2026-05-12",
  },
  {
    id: "img-4",
    name: "app-dashboard-v2.png",
    type: "image",
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
    size: "2.4 MB",
    resolution: "2880x1800",
    format: "PNG",
    parentId: "f-3",
    createdAt: "2026-05-16",
  },
  {
    id: "vid-1",
    name: "promo-cinematic-intro.mp4",
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-32115-large.mp4",
    size: "14.8 MB",
    duration: "0:15",
    resolution: "1080p",
    format: "MP4",
    parentId: null,
    createdAt: "2026-05-20",
  },
  {
    id: "aud-1",
    name: "ambient-background-synth.mp3",
    type: "audio",
    url: "#",
    size: "4.2 MB",
    duration: "3:45",
    format: "MP3",
    parentId: "f-4",
    createdAt: "2026-05-19",
  },
  {
    id: "doc-1",
    name: "terms-and-conditions-v1.pdf",
    type: "document",
    url: "#",
    size: "245 KB",
    pages: 12,
    format: "PDF",
    parentId: null,
    createdAt: "2026-05-02",
  },
  {
    id: "img-5",
    name: "user-avatar-placeholder.png",
    type: "image",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60",
    size: "45 KB",
    resolution: "500x500",
    format: "PNG",
    parentId: null,
    createdAt: "2026-05-25",
  },
];

export default function AssetsManagement() {
  // Set default theme state to 'light' so it reloads in crisp pure white
  // const [theme, setTheme] = useState("light"); // 'light' | 'dark'
  const [folders, setFolders] = useState<AssetFolder[]>(INITIAL_FOLDERS);
  const [files, setFiles] = useState<AssetFile[]>(INITIAL_FILES);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null); // null = Root
  const [selectedAsset, setSelectedAsset] = useState<AssetFile | null>(
    INITIAL_FILES[0],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all"); // 'all', 'image', 'video', 'audio', 'document'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // New Folder creation states
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Scroll fade state for center section
  const centerScrollRef = useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const updateScrollFades = useCallback(() => {
    const el = centerScrollRef.current;
    if (!el) return;
    setShowTopFade(el.scrollTop > 8);
    setShowBottomFade(el.scrollTop + el.clientHeight < el.scrollHeight - 8);
  }, []);

  // Toast helper
  const triggerToast = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Breadcrumbs tracker
  const breadcrumbs = useMemo(() => {
    const list: { id: string | null; name: string }[] = [
      { id: null, name: "Assets Root" },
    ];
    if (!currentFolderId) return list;

    const path: typeof folders = [];
    let current = folders.find((f) => f.id === currentFolderId);
    while (current) {
      path.unshift(current);
      const parentId = current.parentId;
      current = folders.find((f) => f.id === parentId);
    }
    return [...list, ...path];
  }, [currentFolderId, folders]);

  // Combined Filtering: Category + Search + Current Folder ID
  const filteredFolders = useMemo(() => {
    if (searchQuery || activeCategory !== "all") return [];
    return folders.filter((folder) => folder.parentId === currentFolderId);
  }, [folders, currentFolderId, searchQuery, activeCategory]);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesFolder =
        searchQuery || activeCategory !== "all"
          ? true
          : file.parentId === currentFolderId;
      const matchesSearch = file.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || file.type === activeCategory;
      return matchesFolder && matchesSearch && matchesCategory;
    });
  }, [files, currentFolderId, searchQuery, activeCategory]);

  useEffect(() => {
    updateScrollFades();
  }, [filteredFiles, filteredFolders, viewMode, updateScrollFades]);

  // Simulated Mock Upload
  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const randomImages = [
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
              "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800",
              "https://images.unsplash.com/photo-1618005198143-d3668002479e?w=800",
            ];
            const newFile = {
              id: `img-${Date.now()}`,
              name: `uploaded-design-${Math.floor(Math.random() * 105)}.png`,
              type: "image",
              url: randomImages[
                Math.floor(Math.random() * randomImages.length)
              ],
              size: "1.4 MB",
              resolution: "2000x2000",
              format: "PNG",
              parentId: currentFolderId,
              createdAt: new Date().toISOString().split("T")[0],
            };
            setFiles((prevFiles) => [newFile, ...prevFiles]);
            setSelectedAsset(newFile);
            setIsUploading(false);
            triggerToast("Asset uploaded and optimized successfully!");
          }, 300);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  // Add Folder logic
  const handleCreateFolder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const newFolder = {
      id: `f-${Date.now()}`,
      name: newFolderName,
      parentId: currentFolderId,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setFolders([...folders, newFolder]);
    setNewFolderName("");
    setShowNewFolderModal(false);
    triggerToast(`Folder "${newFolder.name}" created.`);
  };

  // Delete Asset logic
  const handleDeleteAsset = (assetId: string, isFolder = false) => {
    if (isFolder) {
      setFolders(folders.filter((f) => f.id !== assetId));
      setFiles(
        files.map((file) =>
          file.parentId === assetId ? { ...file, parentId: null } : file,
        ),
      );
      triggerToast("Folder deleted. Contents moved to root.");
    } else {
      const remainingFiles = files.filter((f) => f.id !== assetId);
      setFiles(remainingFiles);
      if (selectedAsset?.id === assetId) {
        setSelectedAsset(remainingFiles[0] || null);
      }
      triggerToast("File deleted successfully.");
    }
  };

  // Copy to clipboard fallback wrapper
  const copyToClipboard = (text: string, message = "Copied to clipboard!") => {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    triggerToast(message);
  };

  // Generate Next.js code snippets for selected asset
  const getNextJsSnippet = (asset: AssetFile | null) => {
    if (!asset) return "";
    if (asset.type === "image") {
      const dimensions = asset.resolution
        ? asset.resolution.split("x")
        : [800, 600];
      const width = dimensions[0] || 800;
      const height = dimensions[1] || 600;
      return `import Image from 'next/image';\n\n<Image\n  src="${asset.url}"\n  alt="${asset.name}"\n  width={${width}}\n  height={${height}}\n  placeholder="blur"\n  blurDataURL="/placeholder.svg"\n  className="rounded-sm object-cover"\n/>`;
    } else if (asset.type === "video") {
      return `<video \n  controls\n  preload="metadata"\n  className="w-full rounded-xl"\n>\n  <source src="${asset.url}" type="video/mp4" />\n  Your browser does not support the video tag.\n</video>`;
    } else {
      return `// Dynamic asset import link\n<a \n  href="${asset.url}" \n  download\n  className="flex items-center gap-2 hover:underline"\n>\n  Download ${asset.name} (${asset.size})\n</a>`;
    }
  };

  // Calculated categories counts
  const counts = useMemo(() => {
    return {
      all: files.length,
      image: files.filter((f) => f.type === "image").length,
      video: files.filter((f) => f.type === "video").length,
      audio: files.filter((f) => f.type === "audio").length,
      document: files.filter((f) => f.type === "document").length,
    };
  }, [files]);

  return (
    <div className="flex h-full w-full select-none flex-col overflow-hidden font-sans transition-colors duration-250 antialiased bg-muted text-foreground dark:bg-background dark:text-muted-foreground">
      {/* Dynamic Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md transition-all border-border bg-card text-foreground dark:border-border/80 dark:bg-card/95 dark:text-muted-foreground">
          <Check className="h-4 w-4 text-emerald-500" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="@container flex flex-1 overflow-hidden">
        {/* Left Column: Sidebar Filters */}
        <aside className="hidden w-64 min-w-64 max-w-64 shrink-0 flex-col border-r p-4 md:flex justify-between overflow-y-auto transition-colors border-border bg-muted/50 text-muted-foreground dark:border-border/80 dark:bg-card/30 dark:text-muted-foreground">
          <div className="space-y-6">
            <div>
              <button
                onClick={handleSimulatedUpload}
                disabled={isUploading}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary hover:bg-primary dark:bg-primary py-3 px-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50 shadow-md shadow-primary/10 dark:hover:bg-primary dark:text-primary-foreground"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Uploading ({uploadProgress}%)</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload New Assets</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Filter Navigation */}
            <div className="space-y-1">
              <span className="px-2 text-[10px] font-bold tracking-wider uppercase text-muted-foreground dark:text-muted-foreground">
                Categories
              </span>

              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className={`group/dark flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm transition ${
                  activeCategory === "all"
                    ? "bg-muted text-primary font-semibold dark:bg-muted/10 dark:text-primary dark:font-medium"
                    : "text-muted-foreground hover:bg-card hover:text-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="h-4 w-4" />
                  <span>All Media</span>
                </div>
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded bg-muted/60 dark:bg-foreground ${
                    activeCategory === "all"
                      ? "text-primary dark:text-primary"
                      : "text-muted-foreground dark:text-muted-foreground"
                  }`}
                >
                  {counts.all}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveCategory("image");
                  setSearchQuery("");
                }}
                className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm transition ${
                  activeCategory === "image"
                    ? "bg-muted text-primary font-semibold dark:bg-muted/10 dark:text-primary dark:font-medium"
                    : "text-muted-foreground hover:bg-card hover:text-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="h-4 w-4" />
                  <span>Images</span>
                </div>
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded bg-muted/60 dark:bg-foreground ${
                    activeCategory === "image"
                      ? "text-primary dark:text-primary"
                      : "text-muted-foreground dark:text-muted-foreground"
                  }`}
                >
                  {counts.image}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveCategory("video");
                  setSearchQuery("");
                }}
                className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm transition ${
                  activeCategory === "video"
                    ? "bg-muted text-primary font-semibold dark:bg-muted/10 dark:text-primary dark:font-medium"
                    : "text-muted-foreground hover:bg-card hover:text-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Video className="h-4 w-4" />
                  <span>Videos</span>
                </div>
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded bg-muted/60 dark:bg-foreground ${
                    activeCategory === "video"
                      ? "text-primary dark:text-primary"
                      : "text-muted-foreground dark:text-muted-foreground"
                  }`}
                >
                  {counts.video}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveCategory("audio");
                  setSearchQuery("");
                }}
                className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm transition ${
                  activeCategory === "audio"
                    ? "bg-muted text-primary font-semibold dark:bg-muted/10 dark:text-primary dark:font-medium"
                    : "text-muted-foreground hover:bg-card hover:text-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Music className="h-4 w-4" />
                  <span>Audio Tracks</span>
                </div>
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded bg-muted/60 dark:bg-foreground ${
                    activeCategory === "audio"
                      ? "text-primary dark:text-primary"
                      : "text-muted-foreground dark:text-muted-foreground"
                  }`}
                >
                  {counts.audio}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveCategory("document");
                  setSearchQuery("");
                }}
                className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm transition ${
                  activeCategory === "document"
                    ? "bg-muted text-primary font-semibold dark:bg-muted/10 dark:text-primary dark:font-medium"
                    : "text-muted-foreground hover:bg-card hover:text-foreground dark:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4" />
                  <span>Documents</span>
                </div>
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded bg-muted/60 dark:bg-foreground ${
                    activeCategory === "document"
                      ? "text-primary dark:text-primary"
                      : "text-muted-foreground dark:text-muted-foreground"
                  }`}
                >
                  {counts.document}
                </span>
              </button>
            </div>

            {/* Simulated Storage Status Card */}
            <div className="rounded-xl bottom-0 sticky border p-3 border-border bg-card shadow-sm dark:border-border dark:bg-card">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                  Storage Pool
                </span>
                <span className="font-semibold text-muted-foreground dark:text-muted-foreground">
                  23.8 MB / 100 MB
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden bg-muted dark:bg-muted">
                <div className="h-full w-[24%] rounded-full bg-linear-to-r from-primary to-pink-500" />
              </div>
              <p className="mt-2 text-[10px] leading-normal text-muted-foreground dark:text-muted-foreground">
                Free accounts optimized down to 100MB max payload per
                deployment.
              </p>
            </div>
          </div>
        </aside>

        {/* Center Column: Files Grid & Browsing View */}
        <main className="flex flex-1 min-w-0 flex-col overflow-hidden transition-colors bg-card dark:bg-background">
          {/* Top Actions: Search and Views bar */}
          <div className="sticky flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5 border-border dark:border-border">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search assets, tag files or dimensions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-sm border py-2.5 pl-10 pr-4 min-h-10 max-h-10 text-sm focus:outline-none focus:border-primary! focus:ring-2 focus:ring-ring/20! dark:focus:border-primary! dark:focus-visible:ring-primary/25! transition border-border bg-muted text-foreground placeholder-muted-foreground dark:border-border dark:bg-card dark:text-muted-foreground dark:placeholder-muted-foreground"
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
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="flex items-center gap-2 rounded-sm border px-3.5 py-2.5 min-h-10 max-h-10 text-xs font-semibold transition border-border bg-muted text-muted-foreground hover:bg-muted hover:text-foreground dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-card dark:hover:text-white"
              >
                <FolderPlus className="h-3.5 w-3.5 text-primary" />
                <span>New Folder</span>
              </button>

              <div className="h-8 w-px bg-muted dark:bg-foreground" />

              {/* Grid / List toggle */}
              <div className="flex items-center rounded-sm p-1 border min-h-10 bg-muted border-border dark:bg-card dark:border-border">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition ${viewMode === "grid" ? "bg-primary text-white  dark:bg-primary dark:text-primary-foreground" : "text-muted-foreground hover:text-foreground dark:hover:text-primary"}`}
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
            {/* Top fade — visible after scrolling down */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-10 z-10 transition-opacity duration-200 bg-linear-to-b from-white dark:from-muted to-transparent"
              style={{ opacity: showTopFade ? 1 : 0 }}
            />
            {/* Bottom fade — visible when more content is below */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12.5 z-10 transition-opacity duration-200 bg-linear-to-t from-white dark:from-muted to-transparent"
              style={{ opacity: showBottomFade ? 1 : 0 }}
            />
            <div
              ref={centerScrollRef}
              onScroll={updateScrollFades}
              className="absolute inset-0 flex flex-col overflow-y-auto overflow-x-hidden p-4"
            >
              {/* New Folder Modal */}
              {showNewFolderModal && (
                <div className="mb-3 rounded-xl border p-4 border-primary/20 bg-primary/30 dark:bg-primary/20">
                  <form
                    onSubmit={handleCreateFolder}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center"
                  >
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold tracking-wider uppercase mb-1 text-muted-foreground dark:text-muted-foreground">
                        Create Folder in Current Location
                      </label>
                      <input
                        type="text"
                        placeholder="Enter folder name..."
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        className="w-full rounded-sm border px-3 py-1.5 text-xs focus:border-primary focus:outline-none border-border bg-card text-foreground dark:border-border dark:bg-card dark:text-muted-foreground"
                        autoFocus
                      />
                    </div>
                    <div className="flex items-end gap-2 pt-4 sm:pt-0">
                      <button
                        type="submit"
                        className="rounded-sm bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary transition"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewFolderModal(false);
                          setNewFolderName("");
                        }}
                        className="rounded-sm px-4 py-2 text-xs font-semibold transition bg-muted hover:bg-muted dark:bg-muted dark:hover:bg-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Breadcrumbs Navigation */}
              <div className="flex items-center flex-wrap gap-1.5 pb-3 text-xs text-muted-foreground">
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.id || "root"}>
                    {idx > 0 && (
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    )}
                    <button
                      onClick={() => {
                        setCurrentFolderId(crumb.id);
                        setSearchQuery("");
                      }}
                      className={`rounded-md px-2 py-1 font-medium transition ${
                        idx === breadcrumbs.length - 1
                          ? "text-primary bg-primary/10 dark:text-primary dark:bg-primary/10"
                          : "hover:text-foreground hover:bg-muted dark:hover:text-muted-foreground dark:hover:bg-card"
                      }`}
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* Main Grid/List Container */}
              <div className="min-h-0">
                {filteredFolders.length === 0 && filteredFiles.length === 0 ? (
                  <div className="flex h-full min-h-85 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center border-border bg-muted/20 dark:border-border dark:bg-card/10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border mb-4 bg-muted border-border dark:bg-card dark:border-border">
                      <Folder className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground dark:text-muted-foreground">
                      No assets in this directory
                    </h3>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground dark:text-muted-foreground">
                      Upload fresh images, templates, audios or create nested
                      subfolders to structure your site&rsquo;s codebase assets.
                    </p>
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={handleSimulatedUpload}
                        className="rounded-sm bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary transition"
                      >
                        Upload Asset
                      </button>
                      <button
                        onClick={() => setShowNewFolderModal(true)}
                        className="rounded-sm border px-4 py-2 text-xs font-semibold transition bg-card border-border text-muted-foreground hover:bg-muted dark:bg-card dark:border-border dark:text-muted-foreground dark:hover:bg-muted"
                      >
                        Add Folder
                      </button>
                    </div>
                  </div>
                ) : viewMode === "grid" ? (
                  // Grid Layout
                  <div className="space-y-6">
                    {/* Folders Subdivision */}
                    {filteredFolders.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground dark:text-muted-foreground mb-3">
                          Folders
                        </h4>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                          {filteredFolders.map((folder) => (
                            <div
                              key={folder.id}
                              className="group relative flex items-center justify-between rounded-lg border p-3 transition cursor-pointer border-border bg-muted hover:border-border hover:bg-muted dark:border-border/80 dark:bg-card dark:hover:border-border dark:hover:bg-card"
                              onClick={() => setCurrentFolderId(folder.id)}
                            >
                              <div className="flex items-center gap-3 min-w-0 mr-2">
                                {/* Sleek themed container for the folder icon to look super clean */}
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-500 dark:bg-amber-500/15">
                                  <Folder className="h-5 w-5 fill-amber-500/20 text-amber-500" />
                                </div>
                                <div className="min-w-0">
                                  <p
                                    className="truncate text-sm font-semibold text-foreground dark:text-muted-foreground"
                                    title={folder.name}
                                  >
                                    {folder.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground dark:text-muted-foreground truncate whitespace-nowrap">
                                    Created {folder.createdAt}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAsset(folder.id, true);
                                }}
                                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1.5 rounded-sm transition border bg-card/95 hover:bg-red-50 text-muted-foreground hover:text-red-500 border-border shadow-sm dark:bg-card/90 dark:hover:bg-red-500/20 dark:text-muted-foreground dark:hover:text-red-400 dark:border-border dark:hover:border-red-800/25"
                                title="Delete folder"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Files Subdivision (Using auto-fill grid preventing squishing) */}
                    {filteredFiles.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground dark:text-muted-foreground mb-3">
                          Files
                        </h4>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                          {filteredFiles.map((file) => {
                            const isSelected = selectedAsset?.id === file.id;
                            return (
                              <div
                                key={file.id}
                                onClick={() => setSelectedAsset(file)}
                                className={`group relative flex flex-col overflow-hidden rounded-lg border cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-primary ring-1 ring-ring bg-primary/40 dark:border-primary dark:ring-1 dark:ring-ring dark:bg-card"
                                    : "border-border bg-card hover:border-primary hover:bg-muted dark:border-border dark:bg-card/60 dark:hover:border-border/75 dark:hover:bg-card"
                                }`}
                              >
                                {/* File Preview area */}
                                <div className="relative aspect-video w-full flex items-center justify-center overflow-hidden border-b bg-muted border-border dark:bg-background dark:border-border">
                                  {file.type === "image" ? (
                                    <img
                                      src={file.url}
                                      alt={file.name}
                                      className="h-full w-full object-cover group-hover:scale-105 transition duration-350"
                                      loading="lazy"
                                    />
                                  ) : file.type === "video" ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                                      <Video className="h-8 w-8 text-primary" />
                                      <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1 py-0.5 text-[9px] font-mono text-muted-foreground">
                                        {file.duration}
                                      </span>
                                    </div>
                                  ) : file.type === "audio" ? (
                                    <div className="flex flex-col items-center gap-1.5">
                                      <Music className="h-8 w-8 text-emerald-500" />
                                      <span className="text-[10px] text-emerald-600 font-mono">
                                        Audio Asset
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center gap-1.5">
                                      <FileText className="h-8 w-8 text-cyan-500" />
                                      <span className="text-[10px] text-cyan-600 font-mono">
                                        {file.format}
                                      </span>
                                    </div>
                                  )}

                                  {/* Corner Badges */}
                                  <span className="absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[9px] font-mono tracking-wider uppercase border bg-card/95 text-muted-foreground border-border shadow-sm dark:bg-card dark:text-muted-foreground dark:border-border">
                                    {file.format}
                                  </span>
                                </div>

                                {/* Name and Meta */}
                                <div className="p-3">
                                  <p
                                    className="truncate text-xs font-semibold transition group-hover:text-primary text-foreground dark:text-muted-foreground"
                                    title={file.name}
                                  >
                                    {file.name}
                                  </p>
                                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground dark:text-muted-foreground">
                                    <span>{file.size}</span>
                                    {file.resolution && (
                                      <span>{file.resolution}</span>
                                    )}
                                  </div>
                                </div>

                                {/* Hover overlay quick deletion */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAsset(file.id);
                                  }}
                                  className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1.5 rounded-sm transition border bg-card/95 hover:bg-red-50 text-muted-foreground hover:text-red-500 border-border shadow-sm dark:bg-card/90 dark:hover:bg-red-500/20 dark:text-muted-foreground dark:hover:text-red-400 dark:border-border dark:hover:border-red-800/25"
                                  title="Delete File"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // List Layout
                  <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm dark:border-border dark:bg-card/10">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-border bg-muted dark:border-border dark:bg-card">
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Format</th>
                          <th className="py-3 px-4">Size</th>
                          <th className="py-3 px-4">Resolution / Info</th>
                          <th className="py-3 px-4">Created</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-xs divide-border dark:divide-border/60">
                        {/* Folders in list */}
                        {filteredFolders.map((folder) => (
                          <tr
                            key={folder.id}
                            onClick={() => setCurrentFolderId(folder.id)}
                            className="group cursor-pointer transition hover:bg-muted dark:hover:bg-card/40"
                          >
                            <td className="py-3 px-4 font-semibold text-muted-foreground flex items-center gap-2">
                              <Folder className="h-4 w-4 text-amber-500 fill-amber-500/10" />
                              <span className="text-foreground dark:text-muted-foreground">
                                {folder.name}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              Directory
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              --
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              Folder Path
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {folder.createdAt}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAsset(folder.id, true);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {/* Files in list */}
                        {filteredFiles.map((file) => {
                          const isSelected = selectedAsset?.id === file.id;
                          return (
                            <tr
                              key={file.id}
                              onClick={() => setSelectedAsset(file)}
                              className={`group cursor-pointer transition ${
                                isSelected
                                  ? "bg-primary/40 font-semibold dark:bg-muted/60 dark:font-medium"
                                  : "hover:bg-muted dark:hover:bg-card/40"
                              }`}
                            >
                              <td className="py-3 px-4 flex items-center gap-2 min-w-50">
                                {file.type === "image" ? (
                                  <ImageIcon className="h-4 w-4 text-primary" />
                                ) : file.type === "video" ? (
                                  <Video className="h-4 w-4 text-purple-400" />
                                ) : file.type === "audio" ? (
                                  <Music className="h-4 w-4 text-emerald-400" />
                                ) : (
                                  <FileText className="h-4 w-4 text-cyan-400" />
                                )}
                                <span className="truncate max-w-xs text-foreground dark:text-muted-foreground">
                                  {file.name}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground uppercase font-mono">
                                {file.format}
                              </td>
                              <td className="py-3 px-4 text-muted-foreground font-mono">
                                {file.size}
                              </td>
                              <td className="py-3 px-4 text-muted-foreground font-mono">
                                {file.resolution || file.duration || "--"}
                              </td>
                              <td className="py-3 px-4 text-muted-foreground">
                                {file.createdAt}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAsset(file.id);
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
              </div>
            </div>
          </div>
          <div className="w-full flex h-4" />
          {/* end scroll fade wrapper */}
        </main>

        {/* Right Column: Asset Details Inspector */}
        <aside className="w-80 min-w-80 max-w-80 shrink-0 border-l flex flex-col overflow-hidden transition-colors border-border bg-muted/30 dark:border-border/80 dark:bg-card/40">
          <div className="flex-1 min-h-0 overflow-y-auto p-4">
            {selectedAsset ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-muted-foreground">
                      Asset Inspector
                    </span>
                  </div>

                  {/* Medium Image Preview container */}
                  <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-xl border flex items-center justify-center border-border bg-card shadow-sm dark:border-border dark:bg-background">
                    {selectedAsset.type === "image" ? (
                      <img
                        src={selectedAsset.url}
                        alt={selectedAsset.name}
                        className="h-full w-full object-cover"
                      />
                    ) : selectedAsset.type === "video" ? (
                      <video
                        src={selectedAsset.url}
                        controls
                        className="h-full w-full object-contain"
                      />
                    ) : selectedAsset.type === "audio" ? (
                      <div className="flex flex-col items-center gap-2">
                        <Music className="h-10 w-10 text-emerald-450" />
                        <span className="text-xs text-muted-foreground">
                          Audio Track (MP3)
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-10 w-10 text-cyan-455" />
                        <span className="text-xs text-muted-foreground">
                          PDF Document File
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() =>
                        copyToClipboard(selectedAsset.url, "Asset URL copied!")
                      }
                      className="flex items-center justify-center gap-1.5 rounded-sm border px-3 py-2 text-xs font-semibold transition border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground shadow-xs dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy URL</span>
                    </button>
                    <a
                      href={selectedAsset.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-sm border px-3 py-2 text-xs font-semibold transition border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground shadow-xs dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open Raw</span>
                    </a>
                  </div>
                </div>

                {/* Metadata Details Table */}
                <div className="space-y-3.5 border-t pt-5 border-border dark:border-border">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-muted-foreground">
                    Asset Specifications
                  </span>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span
                        className="font-semibold truncate max-w-35 text-foreground dark:text-muted-foreground"
                        title={selectedAsset.name}
                      >
                        {selectedAsset.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-semibold uppercase text-foreground dark:text-muted-foreground">
                        {selectedAsset.type} ({selectedAsset.format})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Size</span>
                      <span className="font-semibold text-foreground dark:text-muted-foreground">
                        {selectedAsset.size}
                      </span>
                    </div>
                    {selectedAsset.resolution && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Resolution
                        </span>
                        <span className="font-semibold text-foreground dark:text-muted-foreground">
                          {selectedAsset.resolution}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created At</span>
                      <span className="font-semibold text-foreground dark:text-muted-foreground">
                        {selectedAsset.createdAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Developer Optimization Snippet */}
                <div className="space-y-3.5 border-t pt-5 border-border dark:border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-muted-foreground">
                      Next.js Framework Code
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
                      className="flex items-center gap-1 text-[10px] font-bold hover:underline text-primary hover:text-primary dark:text-primary dark:hover:text-primary"
                    >
                      {copiedSnippet ? "Copied!" : "Copy Snippet"}
                    </button>
                  </div>

                  <div className="rounded-xl border p-3.5 font-mono text-[11px] leading-relaxed border-primary bg-card text-primary dark:border-border/15 dark:bg-foreground/50 dark:text-muted-foreground">
                    <pre className="overflow-x-auto whitespace-pre">
                      {getNextJsSnippet(selectedAsset)}
                    </pre>
                  </div>
                  <p className="text-[10px] leading-normal text-muted-foreground dark:text-muted-foreground">
                    Our integration uses{" "}
                    <code className="text-muted-foreground dark:text-muted-foreground">
                      next/image
                    </code>{" "}
                    with static sizing fallback properties to prevent Layout
                    Shift.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Info className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">
                  No Asset Selected
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Select an asset to view metadata and copy Next.js import
                  statements.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
