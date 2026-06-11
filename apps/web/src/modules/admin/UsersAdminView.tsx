"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  Plus,
  Search,
  X,
  Lock,
  Unlock,
  Trash2,
  Eye,
  EyeOff,
  KeyRound,
  Edit2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnPinningState,
  type Column,
} from "@tanstack/react-table";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { admin, type AdminUser } from "@/lib/api";
import { AdminGuard } from "./AdminGuard";
import { Modal } from "@/components/common/Modal";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { Button } from "@/components/ui/button";

interface UserWithActivity extends AdminUser {
  lastLoginAt?: string;
  lastActivityAt?: string;
  jobTitle?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  department?: string;
  bio?: string;
  avatarUrl?: string;
}

const columnHelper = createColumnHelper<UserWithActivity>();

interface ScrollState {
  left: boolean;
  right: boolean;
}

function getPinStyles(
  column: Column<UserWithActivity>,
  isHeader = false,
  scroll: ScrollState = { left: false, right: false },
): React.CSSProperties {
  const isPinned = column.getIsPinned();
  if (!isPinned) return {};

  const isLastLeft = isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRight = isPinned === "right" && column.getIsFirstColumn("right");

  const showShadow =
    (isLastLeft && scroll.left) || (isFirstRight && scroll.right);

  return {
    position: "sticky",
    left: isPinned === "left" ? column.getStart("left") : undefined,
    right: isPinned === "right" ? column.getAfter("right") : undefined,
    zIndex: 2,
    backgroundColor: isHeader ? "hsl(var(--muted))" : "hsl(var(--card))",
    boxShadow: showShadow
      ? isLastLeft
        ? "inset -1px 0 0 hsl(var(--border)), 6px 0 10px rgba(0,0,0,0.18)"
        : "inset 1px 0 0 hsl(var(--border)), -6px 0 10px rgba(0,0,0,0.18)"
      : undefined,
  };
}

function Inner() {
  const t = useTranslations("admin.users");
  const router = useRouter();
  const [users, setUsers] = useState<UserWithActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithActivity | null>(
    null,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ["email"],
    right: ["actions"],
  });

  // Scroll-aware pin shadows
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState<ScrollState>({
    left: false,
    right: false,
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () =>
      setScroll({
        left: el.scrollLeft > 0,
        right: el.scrollLeft < el.scrollWidth - el.clientWidth - 1,
      });
    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    jobTitle: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    department: "",
    organizationId: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("never", { defaultValue: "Never" });
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      return diffHours === 0
        ? t("justNow", { defaultValue: "Just now" })
        : `${diffHours}h ${t("ago", { defaultValue: "ago" })}`;
    }
    if (diffDays === 1) return t("yesterday", { defaultValue: "Yesterday" });
    if (diffDays < 7)
      return `${diffDays}d ${t("ago", { defaultValue: "ago" })}`;
    return date.toLocaleDateString();
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("email", {
        header: t("email", { defaultValue: "Email" }),
        size: 220,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div
              onClick={() => openDetailPage(user)}
              className="cursor-pointer hover:opacity-75 transition"
            >
              <p
                className={`font-medium underline ${
                  !user.isActive
                    ? "line-through text-muted-foreground"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {user.name ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          );
        },
      }),
      columnHelper.accessor("organization", {
        header: t("organization", { defaultValue: "Organization" }),
        size: 180,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <span className="text-sm text-muted-foreground">
              {user.organization?.name ??
                (user.superAdmin
                  ? t("platform", { defaultValue: "Platform" })
                  : "—")}
            </span>
          );
        },
      }),
      columnHelper.accessor("superAdmin", {
        header: t("type", { defaultValue: "Type" }),
        size: 140,
        cell: ({ row }) => {
          const user = row.original;
          return user.superAdmin ? (
            <StatusBadge
              variant="purple"
              label={t("superAdmin", { defaultValue: "Super Admin" })}
              size="sm"
            />
          ) : (
            <StatusBadge
              variant="muted"
              label={t("member", { defaultValue: "Member" })}
              size="sm"
            />
          );
        },
      }),
      columnHelper.accessor("isActive", {
        header: t("status", { defaultValue: "Status" }),
        size: 140,
        cell: ({ getValue }) => {
          const isActive = getValue();
          return isActive ? (
            <StatusBadge
              variant="success"
              label={t("active", { defaultValue: "Active" })}
              size="sm"
            />
          ) : (
            <StatusBadge
              variant="muted"
              label={t("locked", { defaultValue: "Locked" })}
              size="sm"
            />
          );
        },
      }),
      columnHelper.accessor("lastLoginAt", {
        header: t("lastLogin", { defaultValue: "Last Login" }),
        size: 140,
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => (
          <div className="text-right">
            {t("actions", { defaultValue: "Actions" })}
          </div>
        ),
        size: 100,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex justify-end">
              <TableActionMenu
                items={[
                  {
                    label: t("viewDetails", { defaultValue: "View Details" }),
                    icon: <Eye size={14} />,
                    onClick: () => openDetailPage(user),
                  },
                  {
                    label: t("edit", { defaultValue: "Edit" }),
                    icon: <Edit2 size={14} />,
                    onClick: () => openEditModal(user),
                  },
                  {
                    label: t("changePassword", {
                      defaultValue: "Change Password",
                    }),
                    icon: <KeyRound size={14} />,
                    onClick: () => openPasswordModal(user),
                  },
                  {
                    label: user.isActive
                      ? t("lockAccount", { defaultValue: "Lock Account" })
                      : t("unlockAccount", { defaultValue: "Unlock Account" }),
                    icon: user.isActive ? (
                      <Lock size={14} />
                    ) : (
                      <Unlock size={14} />
                    ),
                    onClick: () => handleToggleLock(user),
                  },
                  ...(user.isActive && !user.superAdmin && !user.organizationId
                    ? [
                        {
                          label: t("makeSuperAdmin", {
                            defaultValue: "Make Super Admin",
                          }),
                          icon: <ShieldCheck size={14} />,
                          onClick: () => handlePromote(user),
                        },
                      ]
                    : []),
                  {
                    label: t("delete", { defaultValue: "Delete" }),
                    icon: <Trash2 size={14} />,
                    onClick: () => {
                      setSelectedUser(user);
                      setIsDeleteConfirmOpen(true);
                    },
                    variant: "danger" as const,
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

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const fetchedUsers = await admin.listUsers();
      // Add mock activity data
      const usersWithActivity: UserWithActivity[] = fetchedUsers.map((u) => ({
        ...u,
        lastLoginAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        lastActivityAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      }));
      setUsers(usersWithActivity);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
      ),
    [users, searchTerm],
  );

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: { globalFilter: searchTerm, sorting, columnPinning },
    onGlobalFilterChange: setSearchTerm,
    onSortingChange: setSorting,
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const openDetailPage = (user: UserWithActivity) => {
    router.push(`/admin/users/${user.id}`);
  };

  const openAddModal = () => {
    setSelectedUser(null);
    setFormData({
      email: "",
      name: "",
      jobTitle: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      department: "",
      organizationId: "",
      isActive: true,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const openEditModal = (user: UserWithActivity) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      name: user.name ?? "",
      jobTitle: user.jobTitle ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
      city: user.city ?? "",
      state: user.state ?? "",
      country: user.country ?? "",
      department: user.department ?? "",
      organizationId: user.organizationId ?? "",
      isActive: user.isActive,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openPasswordModal = (user: UserWithActivity) => {
    setSelectedUser(user);
    setPasswordData({ password: "", confirm: "" });
    setShowPassword(false);
    setPasswordError("");
    setIsPasswordModalOpen(true);
  };

  const handleChangePassword = async () => {
    if (!selectedUser) return;
    if (passwordData.password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (passwordData.password !== passwordData.confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    setPasswordError("");
    try {
      await admin.setUserPassword(selectedUser.id, passwordData.password);
      setIsPasswordModalOpen(false);
    } catch (e) {
      setPasswordError(
        e instanceof Error ? e.message : "Failed to change password",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.name.trim()) errors.name = "Name is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;
    try {
      // TODO: Call API endpoint when available
      // const newUser = await admin.createUser(formData);
      // setUsers([...users, newUser]);
      setError("Add user API endpoint not yet available");
      setTimeout(() => setError(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add user");
    }
  };

  const handleEditUser = async () => {
    if (!validateForm() || !selectedUser) return;
    try {
      // TODO: Call API endpoint when available
      // const updated = await admin.updateUser(selectedUser.id, formData);
      // setUsers(users.map(u => u.id === selectedUser.id ? updated : u));
      setError("Edit user API endpoint not yet available");
      setTimeout(() => setError(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update user");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      // TODO: Call API endpoint when available
      // await admin.deleteUser(selectedUser.id);
      // setUsers(users.filter(u => u.id !== selectedUser.id));
      setError("Delete user API endpoint not yet available");
      setIsDeleteConfirmOpen(false);
      setTimeout(() => setError(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete user");
    }
  };

  const handleToggleLock = async (user: UserWithActivity) => {
    try {
      const updated = await admin.setUserActive(user.id, !user.isActive);
      setUsers(users.map((u) => (u.id === user.id ? { ...u, ...updated } : u)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to toggle lock");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handlePromote = async (user: UserWithActivity) => {
    // Prevent company users from being promoted to super admin
    if (user.organizationId && user.roles.some((r) => r.organizationId)) {
      setError(
        t("cannotPromoteCompanyUser", {
          defaultValue: "Cannot promote company users to super admin",
        }),
      );
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (
      !confirm(
        `${t("promote", { defaultValue: "Promote" })} ${user.email} ${t("toSuperAdmin", { defaultValue: "to super admin?" })}`,
      )
    )
      return;
    try {
      const updated = await admin.promoteUser(user.id);
      setUsers(users.map((u) => (u.id === user.id ? updated : u)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to promote");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={t("title")}
          description={`${filteredUsers.length} ${filteredUsers.length === 1 ? t("user", { defaultValue: "user" }) : t("users", { defaultValue: "users" })} across every organization`}
        />
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition"
        >
          <Plus className="h-4 w-4" />
          {t("add")}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("search", {
            defaultValue: "Search by email or name...",
          })}
          className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto" ref={scrollRef}>
          {loading ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              {t("loading", { defaultValue: "Loading…" })}
            </div>
          ) : table.getRowModel().rows.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              {t("noResults", { defaultValue: "No users found" })}
            </div>
          ) : (
            <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border bg-muted/40"
                  >
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const sorted = header.column.getIsSorted();
                      return (
                        <th
                          key={header.id}
                          onClick={
                            canSort
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                          className={`px-4 py-3 font-medium text-left ${
                            canSort
                              ? "cursor-pointer hover:text-foreground"
                              : ""
                          }`}
                          style={{
                            width: header.getSize(),
                            ...getPinStyles(header.column, true, scroll),
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                            {canSort &&
                              (sorted === "asc" ? (
                                <ChevronUp
                                  size={14}
                                  className="text-primary shrink-0"
                                />
                              ) : sorted === "desc" ? (
                                <ChevronDown
                                  size={14}
                                  className="text-primary shrink-0"
                                />
                              ) : (
                                <ChevronsUpDown
                                  size={14}
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
              <tbody className="divide-y divide-border">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-muted/20 transition-colors ${
                      !row.original.isActive ? "bg-muted/10" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3"
                        style={{
                          width: cell.column.getSize(),
                          ...getPinStyles(cell.column, false, scroll),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t("addUser", { defaultValue: "Add New User" })}
        description={t("createNewUser", {
          defaultValue: "Create a new system user account",
        })}
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" radius="lg" className="text-muted-foreground hover:text-foreground"
              onClick={() => setIsAddModalOpen(false)}
            >
              {t("cancel", { defaultValue: "Cancel" })}
            </Button>
            <button
              onClick={handleAddUser}
              className="px-4 py-2 bg-primary hover:bg-primary-600 text-primary-foreground rounded-lg text-sm font-medium transition"
            >
              {t("createUser", { defaultValue: "Create User" })}
            </button>
          </>
        }
      >
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Account Info */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("accountInformation", { defaultValue: "Account Information" })}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t("emailAddress", { defaultValue: "Email Address" })}{" "}
                  <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder={t("userEmailPlaceholder", {
                    defaultValue: "user@example.com",
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {formErrors.email && (
                  <p className="text-xs text-error mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t("fullName", { defaultValue: "Full Name" })}{" "}
                  <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={t("fullNamePlaceholder", {
                    defaultValue: "John Doe",
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {formErrors.name && (
                  <p className="text-xs text-error mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t("jobTitle", { defaultValue: "Job Title" })}
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                  placeholder={t("jobTitlePlaceholder", {
                    defaultValue: "e.g. Senior Manager",
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t("department", { defaultValue: "Department" })}
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder={t("departmentPlaceholder", {
                    defaultValue: "e.g. Sales, Engineering",
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t("phoneNumber", { defaultValue: "Phone Number" })}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder={t("phoneNumberPlaceholder", {
                    defaultValue: "+1 (555) 000-0000",
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t("initialStatus", { defaultValue: "Initial Status" })}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: true })}
                    className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      formData.isActive
                        ? "bg-success/10 border-success text-success"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t("active", { defaultValue: "Active" })}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isActive: false })
                    }
                    className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      !formData.isActive
                        ? "bg-muted border-border text-foreground"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t("locked", { defaultValue: "Locked" })}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="space-y-3 border-t border-border pt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("address", { defaultValue: "Address" })}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t("streetAddress", { defaultValue: "Street Address" })}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder={t("streetAddressPlaceholder", {
                    defaultValue: "123 Main Street",
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    {t("city", { defaultValue: "City" })}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder={t("cityPlaceholder", {
                      defaultValue: "San Francisco",
                    })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    {t("stateProvince", { defaultValue: "State/Province" })}
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder={t("stateProvincePlaceholder", {
                      defaultValue: "CA",
                    })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    {t("country", { defaultValue: "Country" })}
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    placeholder={t("countryPlaceholder", {
                      defaultValue: "United States",
                    })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t("editUser", { defaultValue: "Edit User" })}
        description={`${t("updateDetails", { defaultValue: "Update details for" })} ${selectedUser?.email}`}
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" radius="lg" className="text-muted-foreground hover:text-foreground"
              onClick={() => setIsEditModalOpen(false)}
            >
              {t("cancel", { defaultValue: "Cancel" })}
            </Button>
            <button
              onClick={handleEditUser}
              className="px-4 py-2 bg-primary hover:bg-primary-600 text-primary-foreground rounded-lg text-sm font-medium transition"
            >
              {t("saveChanges", { defaultValue: "Save Changes" })}
            </button>
          </>
        }
      >
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Account Info */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("accountInformation", { defaultValue: "Account Information" })}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t("emailAddress", { defaultValue: "Email Address" })}{" "}
                  <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {formErrors.email && (
                  <p className="text-xs text-error mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t("fullName", { defaultValue: "Full Name" })}{" "}
                  <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {formErrors.name && (
                  <p className="text-xs text-error mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t("jobTitle", { defaultValue: "Job Title" })}
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                  placeholder={t("jobTitlePlaceholder", {
                    defaultValue: "e.g. Senior Manager",
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t("department", { defaultValue: "Department" })}
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder={t("departmentPlaceholder", {
                    defaultValue: "e.g. Sales, Engineering",
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t("phoneNumber", { defaultValue: "Phone Number" })}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder={t("phoneNumberPlaceholder", {
                    defaultValue: "+1 (555) 000-0000",
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t("organization", { defaultValue: "Organization" })}
                </label>
                <div className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-muted/30 text-muted-foreground">
                  {selectedUser?.organization?.name ??
                    t("platformUser", { defaultValue: "Platform User" })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("viewOnly", { defaultValue: "View only" })}
                </p>
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="space-y-3 border-t border-border pt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("address", { defaultValue: "Address" })}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t("streetAddress", { defaultValue: "Street Address" })}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder={t("streetAddressPlaceholder", {
                    defaultValue: "123 Main Street",
                  })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    {t("city", { defaultValue: "City" })}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder={t("cityPlaceholder", {
                      defaultValue: "San Francisco",
                    })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    {t("stateProvince", { defaultValue: "State/Province" })}
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder={t("stateProvincePlaceholder", {
                      defaultValue: "CA",
                    })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    {t("country", { defaultValue: "Country" })}
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    placeholder={t("countryPlaceholder", {
                      defaultValue: "United States",
                    })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="space-y-3 border-t border-border pt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("accountStatus", { defaultValue: "Account Status" })}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: true })}
                className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  formData.isActive
                    ? "bg-success/10 border-success text-success"
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {t("active", { defaultValue: "Active" })}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: false })}
                className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  !formData.isActive
                    ? "bg-muted border-border text-foreground"
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {t("locked", { defaultValue: "Locked" })}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title={t("changePassword", { defaultValue: "Change Password" })}
        description={`${t("setPassword", { defaultValue: "Set a new password for" })} ${selectedUser?.email}`}
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" radius="lg" className="text-muted-foreground hover:text-foreground"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              {t("cancel", { defaultValue: "Cancel" })}
            </Button>
            <button
              onClick={handleChangePassword}
              disabled={passwordSaving}
              className="px-4 py-2 bg-primary hover:bg-primary-600 text-primary-foreground rounded-lg text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {passwordSaving
                ? t("saving", { defaultValue: "Saving…" })
                : t("updatePassword", { defaultValue: "Update Password" })}
            </button>
          </>
        }
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t("newPassword", { defaultValue: "New Password" })}{" "}
              <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordData.password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, password: e.target.value })
                }
                placeholder={t("passwordPlaceholder", {
                  defaultValue: "At least 8 characters",
                })}
                className="w-full px-3 py-2 pr-10 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                aria-label={
                  showPassword
                    ? t("hidePassword", { defaultValue: "Hide password" })
                    : t("showPassword", { defaultValue: "Show password" })
                }
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t("confirmPassword", { defaultValue: "Confirm Password" })}{" "}
              <span className="text-error">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={passwordData.confirm}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirm: e.target.value })
              }
              placeholder={t("confirmPasswordPlaceholder", {
                defaultValue: "Re-enter the new password",
              })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {passwordError && (
            <p className="text-xs text-error">{passwordError}</p>
          )}

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-900 dark:text-amber-300">
              🔒{" "}
              {t("passwordWarning", {
                defaultValue:
                  "The user will need to use this new password the next time they log in.",
              })}
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title={t("deleteUser", { defaultValue: "Delete User?" })}
        description={`${t("deleteWarning", { defaultValue: "Are you sure you want to permanently delete" })} ${selectedUser?.email}? ${t("cannotUndo", { defaultValue: "This action cannot be undone." })}`}
        iconVariant="danger"
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" radius="lg" className="text-muted-foreground hover:text-foreground"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              {t("cancel", { defaultValue: "Cancel" })}
            </Button>
            <button
              onClick={handleDeleteUser}
              className="px-4 py-2 bg-error hover:bg-error/90 text-white rounded-lg text-sm font-medium transition"
            >
              {t("deleteUser", { defaultValue: "Delete User" })}
            </button>
          </>
        }
      />
    </div>
  );
}

export function UsersAdminView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
