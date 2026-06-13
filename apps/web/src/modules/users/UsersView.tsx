"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Toaster, useToaster } from "@/components/common/Toaster";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { UsersPageSkeleton } from "@/components/common/DashboardSkeleton";
import {
  Plus,
  Search,
  X,
  Trash2,
  PencilLine,
  Lock,
  Unlock,
  Mail,
  Phone as PhoneIcon,
  User as UserIcon,
  AlertTriangle,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import {
  Column,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type FilterFn,
  type ColumnPinningState,
} from "@tanstack/react-table";

import SectionTitle from "@/components/common/SectionTitle";
import { Modal } from "@/components/common/Modal";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Type definitions for robust Next.js TypeScript support
export type UserRole = "USER" | "MANAGER" | "ADMIN" | "SUPPORT";
export type UserGroup =
  | "RETAILER"
  | "DISTRIBUTOR"
  | "WHOLESALER"
  | "ENTERPRISE";
export type UserStatus = "Active" | "Inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  group: UserGroup;
  status: UserStatus;
  locked: boolean;
  joined: string;
}

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  group: UserGroup;
  status: UserStatus;
  locked: boolean;
}

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

// Pre-seeded high quality initial user data
const INITIAL_USERS: User[] = [
  {
    id: "1",
    name: "Ravi Gupta",
    email: "ravigupts.exe@gmail.com",
    phone: "9811366107",
    role: "USER",
    group: "RETAILER",
    status: "Active",
    locked: false,
    joined: "27 May 2026",
  },
  {
    id: "2",
    name: "Vasudev Sharma",
    email: "vasu14082@gmail.com",
    phone: "8976352629",
    role: "USER",
    group: "RETAILER",
    status: "Active",
    locked: false,
    joined: "27 May 2026",
  },
  {
    id: "3",
    name: "Simaranjeet Singh",
    email: "simranjeet1012@gmail.com",
    phone: "7654321098",
    role: "USER",
    group: "RETAILER",
    status: "Inactive",
    locked: true,
    joined: "03 Dec 2025",
  },
  {
    id: "4",
    name: "Priya Patel",
    email: "priya.patel@sharmagroup.in",
    phone: "9123456789",
    role: "MANAGER",
    group: "WHOLESALER",
    status: "Active",
    locked: false,
    joined: "18 Apr 2026",
  },
  {
    id: "5",
    name: "Marcus Aurelius",
    email: "marcus.philosophy@empire.it",
    phone: "8887776665",
    role: "USER",
    group: "RETAILER",
    status: "Active",
    locked: false,
    joined: "01 Jan 2026",
  },
];

// Module-level TanStack helpers — no component state dependency
const columnHelper = createColumnHelper<User>();

const nameEmailFilter: FilterFn<User> = (
  row,
  _columnId,
  filterValue: string,
) => {
  const q = filterValue.toLowerCase();
  return (
    row.original.name.toLowerCase().includes(q) ||
    row.original.email.toLowerCase().includes(q)
  );
};

export function UsersView() {
  const t = useTranslations("users");
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const { toasts, addToast: showToast, dismiss } = useToaster();

  // Form states for Add/Edit
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    role: "USER",
    group: "RETAILER",
    status: "Active",
    locked: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const isLoaded = usePageLoad(700);

  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: t("table.name"),
        size: 210,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${
                  user.locked
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
              <span
                className={
                  user.locked
                    ? "line-through text-muted-foreground font-medium"
                    : ""
                }
              >
                {user.name}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("email", {
        header: t("table.email"),
        size: 230,
        cell: ({ getValue }) => getValue(),
      }),
      columnHelper.accessor("phone", {
        header: t("table.phone"),
        size: 150,
        enableSorting: false,
      }),
      columnHelper.accessor("role", {
        header: t("table.role"),
        size: 110,
        cell: ({ getValue }) => (
          <span className="inline-flex items-center justify-center bg-muted text-muted-foreground font-bold text-[11px] px-2.5 py-0.5 rounded-md tracking-wider">
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("group", {
        header: t("table.group"),
        size: 130,
        cell: ({ getValue }) => (
          <span className="inline-flex items-center justify-center bg-primary/10 text-primary font-bold text-[11px] px-2.5 py-1 rounded-full tracking-wider border border-primary/20">
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: t("table.status"),
        size: 110,
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <span
              className={`inline-flex items-center justify-center font-bold text-[11px] px-3 py-1 rounded-full ${
                status === "Active"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {status}
            </span>
          );
        },
      }),
      columnHelper.accessor("locked", {
        header: t("table.lock"),
        size: 110,
        enableSorting: false,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <button
              onClick={() => handleToggleLock(user.id, user.locked)}
              title={user.locked ? t("clickToUnlock") : t("clickToLock")}
              className={`flex items-center gap-1.5 font-medium transition-colors group ${
                user.locked
                  ? "text-rose-500 hover:text-rose-600"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {user.locked ? (
                <>
                  <Lock size={14} className="stroke-[2.5]" />
                  <span className="text-xs font-semibold">{t("locked")}</span>
                </>
              ) : (
                <span className="text-muted-foreground font-semibold group-hover:text-foreground">
                  —
                </span>
              )}
            </button>
          );
        },
      }),
      columnHelper.accessor("joined", {
        header: t("table.joined"),
        size: 140,
        enableSorting: false,
        cell: ({ getValue }) => getValue(),
      }),
      columnHelper.display({
        id: "actions",
        header: t("table.actions"),
        size: 80,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex justify-end">
              <TableActionMenu
                items={[
                  {
                    label: t("edit"),
                    icon: <PencilLine size={13} className="stroke-[2.5]" />,
                    onClick: () => handleEditUserClick(user),
                  },
                  {
                    label: t("delete"),
                    icon: <Trash2 size={13} />,
                    onClick: () => setDeletingUser(user),
                    variant: "danger",
                    separator: true,
                  },
                ]}
              />
            </div>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ["name"],
    right: ["actions"],
  });

  // Scroll-aware pinned-column shadow
  // Use state-backed ref so the effect fires only once the element is in the DOM.
  // useRef + [isLoaded] is too early — AnimatePresence mode="wait" mounts the
  // content asynchronously after the skeleton's exit animation, so the ref is
  // still null when isLoaded flips. A ref callback guarantees DOM presence.
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (!scrollEl) return;

    const update = () => {
      setCanScrollLeft(scrollEl.scrollLeft > 0);
      setCanScrollRight(
        scrollEl.scrollLeft < scrollEl.scrollWidth - scrollEl.clientWidth - 1,
      );
    };

    update();
    scrollEl.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(scrollEl);

    return () => {
      scrollEl.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [scrollEl]);

  const table = useReactTable({
    data: users,
    columns,
    state: { globalFilter: searchTerm, sorting, columnPinning },
    onGlobalFilterChange: setSearchTerm,
    onSortingChange: setSorting,
    onColumnPinningChange: setColumnPinning,
    globalFilterFn: nameEmailFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const getCommonPinningStyles = (
    column: Column<User>,
  ): React.CSSProperties => {
    const isPinned = column.getIsPinned();
    const isLastLeft = isPinned === "left" && column.getIsLastColumn("left");
    const isFirstRight =
      isPinned === "right" && column.getIsFirstColumn("right");

    return {
      position: isPinned ? "sticky" : undefined,
      left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
      right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
      zIndex: isPinned ? 2 : undefined,
      boxShadow:
        isLastLeft && canScrollLeft
          ? "4px 0 6px -2px rgba(0,0,0,0.08)"
          : isFirstRight && canScrollLeft
            ? "-4px 0 6px -2px rgba(0,0,0,0.08)"
            : undefined,
      transition: "box-shadow 0.2s ease",
    };
  };

  // Open Modal for creation
  const handleAddUserClick = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "USER",
      group: "RETAILER",
      status: "Active",
      locked: false,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Open Modal for editing
  const handleEditUserClick = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      group: user.group,
      status: user.status,
      locked: user.locked,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = t("errors.nameRequired");

    if (!formData.email.trim()) {
      newErrors.email = t("errors.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("errors.emailInvalid");
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t("errors.phoneRequired");
    } else if (!/^\d{10,12}$/.test(formData.phone.replace(/[\s-]/g, ""))) {
      newErrors.phone = t("errors.phoneInvalid");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit User Form (Create / Update)
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingUser) {
      // Edit mode
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                ...formData,
              }
            : u,
        ),
      );
      showToast(t("toasts.updated", { name: formData.name }));
    } else {
      // Add mode
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        joined: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
      setUsers((prev) => [newUser, ...prev]);
      showToast(t("toasts.added", { name: formData.name }));
    }
    setIsModalOpen(false);
  };

  // Quick Action: Toggle Lock
  const handleToggleLock = (userId: string, currentLockState: boolean) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, locked: !currentLockState } : u,
      ),
    );
    showToast(
      currentLockState ? t("toasts.unlocked") : t("toasts.locked"),
      currentLockState ? "success" : "info",
    );
  };

  // Safe Deletion with beautiful inline confirmation modal
  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    showToast(t("toasts.removed", { name: deletingUser.name }), "error");
    setDeletingUser(null);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
        <motion.div
          key="skeleton"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <UsersPageSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <>
            {/* Header Block matching visual layout */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <SectionTitle
                title={t("title")}
                paragraph={t("userCount", {
                  count: table.getRowModel().rows.length,
                })}
              />
              <div>
                <button
                  onClick={handleAddUserClick}
                  className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all duration-200 cursor-pointer group transform active:scale-[0.98]"
                >
                  <Plus
                    size={16}
                    className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 h-4 w-4"
                  />
                  <span>{t("addUser")}</span>
                </button>
              </div>
            </div>
            <Toaster toasts={toasts} onDismiss={dismiss} />

            <div className="max-w-7xl mx-auto">
              {/* Search Bar Block with precision borders */}
              <div className="mb-6 relative max-w-sm">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                  <Search size={17} />
                </span>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  size="xl"
                  className="w-full pl-10 pr-4 bg-background border border-border rounded-sm text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all shadow-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Main Users Table Board Container */}
              <div className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                {users.length > 0 ? (
                  <div
                    ref={setScrollEl}
                    className="overflow-x-auto overflow-y-auto"
                    style={{ maxHeight: "calc(100vh - 325px)" }}
                  >
                    <table
                      className="text-left border-collapse"
                      style={{
                        tableLayout: "fixed",
                        width: "100%",
                        minWidth: "1280px",
                      }}
                    >
                      <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr
                            key={headerGroup.id}
                            className="text-[13px] font-semibold text-muted-foreground select-none"
                          >
                            {headerGroup.headers.map((header) => {
                              const canSort = header.column.getCanSort();
                              const sorted = header.column.getIsSorted();
                              const isActions = header.id === "actions";
                              const isName = header.id === "name";
                              return (
                                <th
                                  key={header.id}
                                  onClick={
                                    canSort
                                      ? header.column.getToggleSortingHandler()
                                      : undefined
                                  }
                                  className={`sticky top-0 z-10 bg-muted border-b border-border font-semibold ${
                                    isActions
                                      ? "py-4 px-6 text-right"
                                      : isName
                                        ? "py-4 px-6"
                                        : "py-4 px-4"
                                  } ${canSort ? "cursor-pointer hover:text-foreground transition-colors" : ""}`}
                                  style={{
                                    ...getCommonPinningStyles(header.column),
                                    width: header.getSize(),
                                    ...(header.column.getIsPinned()
                                      ? { zIndex: 20 }
                                      : {}),
                                  }}
                                >
                                  <div
                                    className={`flex items-center gap-1 ${isActions ? "justify-end" : ""}`}
                                  >
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext(),
                                        )}
                                    {canSort &&
                                      (sorted === "asc" ? (
                                        <ChevronUp
                                          size={13}
                                          className="text-primary shrink-0"
                                        />
                                      ) : sorted === "desc" ? (
                                        <ChevronDown
                                          size={13}
                                          className="text-primary shrink-0"
                                        />
                                      ) : (
                                        <ChevronsUpDown
                                          size={13}
                                          className="text-muted-foreground/40 shrink-0"
                                        />
                                      ))}
                                  </div>
                                </th>
                              );
                            })}
                          </tr>
                        ))}
                      </thead>

                      <tbody className="divide-y divide-border text-[14px]">
                        <AnimatePresence initial={false}>
                          {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => {
                              const user = row.original;
                              return (
                                <motion.tr
                                  key={row.id}
                                  layoutId={`user-row-${row.id}`}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className={`group hover:bg-muted/40 transition-colors ${
                                    user.locked ? "bg-muted/20" : ""
                                  }`}
                                >
                                  {row.getVisibleCells().map((cell) => {
                                    const id = cell.column.id;
                                    const tdCls =
                                      id === "name"
                                        ? "py-4 px-6 font-bold text-foreground"
                                        : id === "email"
                                          ? "py-4 px-4 text-muted-foreground font-medium"
                                          : id === "phone"
                                            ? "py-4 px-4 text-muted-foreground tabular-nums"
                                            : id === "joined"
                                              ? "py-4 px-4 text-muted-foreground font-medium"
                                              : id === "actions"
                                                ? "py-4 px-6 text-right w-full"
                                                : "py-4 px-4";
                                    const isPinned = cell.column.getIsPinned();
                                    const pinnedCls = isPinned
                                      ? `transition-colors group-hover:bg-muted/40 ${
                                          user.locked
                                            ? "bg-muted/20"
                                            : "bg-card"
                                        }`
                                      : "";
                                    return (
                                      <td
                                        key={cell.id}
                                        className={`${tdCls} ${pinnedCls}`}
                                        style={{
                                          ...getCommonPinningStyles(
                                            cell.column,
                                          ),
                                          width: cell.column.getSize(),
                                        }}
                                      >
                                        {flexRender(
                                          cell.column.columnDef.cell,
                                          cell.getContext(),
                                        )}
                                      </td>
                                    );
                                  })}
                                </motion.tr>
                              );
                            })
                          ) : (
                            <tr key="no-results-row">
                              <td
                                colSpan={columns.length}
                                className="py-12 text-center text-muted-foreground bg-muted/10"
                              >
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <AlertTriangle
                                    className="text-muted-foreground/40"
                                    size={32}
                                  />
                                  <p className="font-semibold text-foreground">
                                    {t("noUsersFound")}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {t("noUsersFoundHint")}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Premium, majestic full-card empty state when there are 0 users in the entire list */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    className="py-20 px-8 text-center flex flex-col items-center justify-center max-w-xl mx-auto"
                  >
                    {/* Majestic SVG Onboarding Graphic */}
                    <div className="w-52 h-52 mb-6">
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        {/* Subtle Background Rings */}
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          className="stroke-slate-100/70 stroke-2 fill-none"
                          strokeDasharray="6 6"
                        />
                        <circle
                          cx="100"
                          cy="100"
                          r="60"
                          className="fill-primary/5"
                        />

                        {/* Modern abstract dashboard user icons with connecting lines */}
                        <line
                          x1="60"
                          y1="120"
                          x2="100"
                          y2="80"
                          className="stroke-slate-200 stroke-2"
                        />
                        <line
                          x1="140"
                          y1="120"
                          x2="100"
                          y2="80"
                          className="stroke-slate-200 stroke-2"
                        />

                        {/* Main Avatar Center */}
                        <circle
                          cx="100"
                          cy="80"
                          r="22"
                          className="fill-[#131553] shadow-md"
                        />
                        <path
                          d="M82 120 C 82 105, 118 105, 118 120"
                          className="fill-[#131553]"
                        />

                        {/* Auxiliary Left Avatar */}
                        <circle
                          cx="60"
                          cy="120"
                          r="14"
                          className="fill-[#e3e6fc]"
                        />
                        <path
                          d="M48 145 C 48 135, 72 135, 72 145"
                          className="fill-[#e3e6fc]"
                        />

                        {/* Auxiliary Right Avatar */}
                        <circle
                          cx="140"
                          cy="120"
                          r="14"
                          className="fill-[#e3e6fc]"
                        />
                        <path
                          d="M128 145 C 128 135, 152 135, 152 145"
                          className="fill-[#e3e6fc]"
                        />

                        {/* Pulsing Accent Rings */}
                        <circle
                          cx="100"
                          cy="80"
                          r="32"
                          className="stroke-primary/20 stroke-[1.5] fill-none"
                        />
                      </svg>
                    </div>

                    <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
                      {t("emptyTitle")}
                    </h3>
                    <p className="text-sm md:text-md text-muted-foreground mt-2.5 max-w-sm leading-relaxed">
                      {t("emptyDescription")}
                    </p>

                    <button
                      onClick={handleAddUserClick}
                      className="mt-6 inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all duration-200 cursor-pointer transform active:scale-95 group"
                    >
                      <Plus
                        size={16}
                        className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 h-4 w-4"
                      />
                      <span>{t("createFirstUser")}</span>
                    </button>
                  </motion.div>
                )}

                {/* Footer of user summary inside listing box */}
                <div className="bg-muted/60 px-6 py-4 border-t border-border text-xs text-muted-foreground flex items-center justify-between font-medium">
                  <span>
                    {t("showingEntries", {
                      shown: table.getRowModel().rows.length,
                      total: users.length,
                    })}
                  </span>
                  <span>{t("footerTagline")}</span>
                </div>
              </div>
            </div>

            {/* Add / Edit User Modal */}
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title={editingUser ? t("modal.editTitle") : t("modal.addTitle")}
              description={
                editingUser
                  ? t("modal.editDescription")
                  : t("modal.addDescription")
              }
              icon={
                editingUser ? (
                  <PencilLine size={18} className="stroke-[2.5]" />
                ) : (
                  <UserPlusIcon size={18} />
                )
              }
              maxWidth="lg"
              footer={
                <>
                  <Button
                    variant="ghost"
                    radius="sm"
                    className="h-auto py-3 font-semibold text-muted-foreground hover:text-foreground"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                  >
                    {t("modal.cancel")}
                  </Button>
                  <button
                    type="submit"
                    form="user-add-edit-form"
                    className="px-5 py-3 bg-primary hover:bg-primary-600 text-primary-foreground rounded-sm text-sm font-semibold transition-all shadow-sm active:scale-95"
                  >
                    {editingUser
                      ? t("modal.saveChanges")
                      : t("modal.createUser")}
                  </button>
                </>
              }
            >
              <form id="user-add-edit-form" onSubmit={handleFormSubmit}>
                <div className="p-6 space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      {t("form.fullName")}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground pointer-events-none">
                        <UserIcon size={16} />
                      </span>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g. Vasudev Sharma"
                        size="xl"
                        className={`w-full pl-10 pr-4 py-2.5 bg-background text-foreground placeholder:text-muted-foreground border rounded-sm text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring/20 ${
                          errors.name
                            ? "border-rose-400 focus:border-rose-500"
                            : "border-border focus:border-ring"
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-rose-500 mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      {t("form.emailAddress")}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground pointer-events-none">
                        <Mail size={16} />
                      </span>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="e.g. vasu14082@gmail.com"
                        size="xl"
                        className={`w-full pl-10 pr-4 py-2.5 bg-background text-foreground placeholder:text-muted-foreground border rounded-sm text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring/20 ${
                          errors.email
                            ? "border-rose-400 focus:border-rose-500"
                            : "border-border focus:border-ring"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-rose-500 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Grid: Phone & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                        {t("form.phoneNumber")}{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground pointer-events-none">
                          <PhoneIcon size={16} />
                        </span>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="e.g. 8976352629"
                          size="xl"
                          className={`w-full pl-10 pr-4 py-2.5 bg-background text-foreground placeholder:text-muted-foreground border rounded-sm text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring/20 ${
                            errors.phone
                              ? "border-rose-400 focus:border-rose-500"
                              : "border-border focus:border-ring"
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-rose-500 mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                        {t("form.systemRole")}
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role: e.target.value as UserRole,
                          })
                        }
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all font-semibold text-foreground"
                      >
                        <option value="USER">USER</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPPORT">SUPPORT</option>
                      </select>
                    </div>
                  </div>

                  {/* Grid: Group & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                        {t("form.commercialGroup")}
                      </label>
                      <select
                        value={formData.group}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            group: e.target.value as UserGroup,
                          })
                        }
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all font-semibold text-foreground"
                      >
                        <option value="RETAILER">RETAILER</option>
                        <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                        <option value="WHOLESALER">WHOLESALER</option>
                        <option value="ENTERPRISE">ENTERPRISE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                        {t("form.initialStatus")}
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, status: "Active" })
                          }
                          className={`flex-1 py-3 rounded-sm border text-xs font-bold transition-all ${
                            formData.status === "Active"
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-background border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          Active
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, status: "Inactive" })
                          }
                          className={`flex-1 py-3 rounded-sm border text-xs font-bold transition-all ${
                            formData.status === "Inactive"
                              ? "bg-muted border-border text-foreground"
                              : "bg-background border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          Inactive
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lock Toggle */}
                  <div className="p-3 bg-muted/50 rounded-xl flex items-center justify-between border border-border mt-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-sm flex items-center justify-center ${
                          formData.locked
                            ? "bg-rose-100 dark:bg-rose-950/50 text-rose-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {formData.locked ? (
                          <Lock size={15} />
                        ) : (
                          <Unlock size={15} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">
                          {t("form.lockTitle")}
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          {t("form.lockDescription")}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, locked: !formData.locked })
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                        formData.locked
                          ? "bg-rose-500"
                          : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform absolute ${
                          formData.locked ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
              isOpen={!!deletingUser}
              onClose={() => setDeletingUser(null)}
              title={t("deleteModal.title")}
              description={
                <>
                  {t("deleteModal.confirmPrefix")}{" "}
                  <strong className="text-foreground font-bold">
                    {deletingUser?.name}
                  </strong>
                  ? {t("deleteModal.confirmSuffix")}
                </>
              }
              icon={<HelpCircle size={20} />}
              iconVariant="danger"
              maxWidth="md"
              footer={
                <>
                  <Button
                    variant="ghost"
                    radius="sm"
                    className="font-semibold text-muted-foreground hover:text-foreground"
                    type="button"
                    onClick={() => setDeletingUser(null)}
                  >
                    {t("deleteModal.keepAccount")}
                  </Button>
                  <Button
                    variant="destructive"
                    radius="sm"
                    className="px-5 font-semibold active:scale-95"
                    type="button"
                    onClick={handleConfirmDelete}
                  >
                    {t("deleteModal.confirmDelete")}
                  </Button>
                </>
              }
            />
          </>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Inline Helper SVG Icon since lucide user-plus may vary in standard import paths
interface UserPlusIconProps {
  size?: number;
}
function UserPlusIcon({ size = 18 }: UserPlusIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}
