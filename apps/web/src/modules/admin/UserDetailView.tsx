"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  LogIn,
  Shield,
  ShieldCheck,
  Edit2,
  KeyRound,
  Lock,
  Unlock,
  Trash2,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { admin, type AdminUser } from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/common/Modal";
import { TableActionMenu } from "@/components/common/TableActionMenu";

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
}

type Tab = "overview" | "activity";

function UserDetailInner({ userId }: { userId: string }) {
  const t = useTranslations("admin.users");
  const router = useRouter();
  const [user, setUser] = useState<UserWithActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Action feedback + modals (mirrors the Users list quick actions).
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const flash = (type: "error" | "success", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedUser = await admin.listUsers();
      const foundUser = fetchedUser.find((u) => u.id === userId);
      if (foundUser) {
        const userWithActivity: UserWithActivity = {
          ...foundUser,
          lastLoginAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          jobTitle: "Senior Manager",
          phone: "+1 (555) 123-4567",
          address: "123 Main Street",
          city: "San Francisco",
          state: "CA",
          country: "United States",
          department: "Engineering",
        };
        setUser(userWithActivity);
      }
    } catch (e) {
      console.error("Failed to load user:", e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

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

  const handleToggleLock = async () => {
    if (!user) return;
    try {
      const updated = await admin.setUserActive(user.id, !user.isActive);
      setUser({ ...user, ...updated });
      flash(
        "success",
        updated.isActive
          ? t("accountUnlocked", { defaultValue: "Account unlocked" })
          : t("accountLocked", { defaultValue: "Account locked" }),
      );
    } catch (e) {
      flash(
        "error",
        e instanceof Error
          ? e.message
          : t("failedToggleLock", { defaultValue: "Failed to toggle lock" }),
      );
    }
  };

  const handlePromote = async () => {
    if (!user) return;
    if (user.organizationId && user.roles.some((r) => r.organizationId)) {
      flash(
        "error",
        t("cannotPromoteCompanyUser", {
          defaultValue: "Cannot promote company users to super admin",
        }),
      );
      return;
    }
    if (
      !confirm(
        t("promoteConfirm", {
          defaultValue: `Promote ${user.email} to super admin?`,
        }),
      )
    )
      return;
    try {
      const updated = await admin.promoteUser(user.id);
      setUser({ ...user, ...updated });
      flash(
        "success",
        t("userPromoted", { defaultValue: "User promoted to super admin" }),
      );
    } catch (e) {
      flash(
        "error",
        e instanceof Error
          ? e.message
          : t("failedPromote", { defaultValue: "Failed to promote" }),
      );
    }
  };

  const openPasswordModal = () => {
    setPasswordData({ password: "", confirm: "" });
    setShowPassword(false);
    setPasswordError("");
    setIsPasswordModalOpen(true);
  };

  const handleChangePassword = async () => {
    if (!user) return;
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
      await admin.setUserPassword(user.id, passwordData.password);
      setIsPasswordModalOpen(false);
      flash("success", "Password updated");
    } catch (e) {
      setPasswordError(
        e instanceof Error ? e.message : "Failed to change password",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleEdit = () => {
    // No admin update endpoint yet — mirrors the Users list behavior.
    flash("error", "Edit user API endpoint not yet available");
  };

  const handleDelete = () => {
    // No admin delete endpoint yet — mirrors the Users list behavior.
    setIsDeleteConfirmOpen(false);
    flash("error", "Delete user API endpoint not yet available");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TableActionMenu
            dropdownWidth="w-52"
            items={[
              {
                label: "Edit",
                icon: <Edit2 size={14} />,
                onClick: handleEdit,
              },
              {
                label: "Change Password",
                icon: <KeyRound size={14} />,
                onClick: openPasswordModal,
              },
              {
                label: user.isActive ? "Lock Account" : "Unlock Account",
                icon: user.isActive ? <Lock size={14} /> : <Unlock size={14} />,
                onClick: handleToggleLock,
              },
              ...(user.isActive && !user.superAdmin && !user.organizationId
                ? [
                    {
                      label: "Make Super Admin",
                      icon: <ShieldCheck size={14} />,
                      onClick: handlePromote,
                    },
                  ]
                : []),
              {
                label: "Delete",
                icon: <Trash2 size={14} />,
                onClick: () => setIsDeleteConfirmOpen(true),
                variant: "danger" as const,
                separator: true,
              },
            ]}
          />
          <button
            onClick={() => router.push("/admin/users")}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition"
          >
            <ArrowLeft size={16} />
            Back to List
          </button>
        </div>
      </div>

      {/* Action feedback */}
      {feedback && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm flex items-center justify-between ${
            feedback.type === "error"
              ? "bg-error/10 border-error/20 text-error"
              : "bg-success/10 border-success/20 text-success"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Status Badges */}
      <div className="flex items-center gap-3">
        {user.superAdmin ? (
          <StatusBadge variant="purple" label="Super Admin" />
        ) : (
          <StatusBadge variant="muted" label="Member" />
        )}
        {user.isActive ? (
          <StatusBadge variant="success" label="Active" />
        ) : (
          <StatusBadge variant="muted" label="Locked" />
        )}
        {user.organization && (
          <StatusBadge variant="default" label={user.organization.name} />
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 px-1 font-medium text-sm transition-colors border-b-2 ${
              activeTab === "overview"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`pb-4 px-1 font-medium text-sm transition-colors border-b-2 ${
              activeTab === "activity"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Activity
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Account Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Mail size={18} />
                  Account Information
                </h3>
                <div className="space-y-3 ml-8">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Email
                    </p>
                    <p className="text-foreground font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Status
                    </p>
                    <div className="flex gap-2">
                      {user.isActive ? (
                        <StatusBadge
                          variant="success"
                          label="Active"
                          size="sm"
                        />
                      ) : (
                        <StatusBadge variant="muted" label="Locked" size="sm" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Building size={18} />
                  Organization
                </h3>
                <div className="space-y-3 ml-8">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Name
                    </p>
                    <p className="text-foreground font-medium">
                      {user.organization?.name ?? "Platform User"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Role Info */}
              {user.roles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Shield size={18} />
                    Roles
                  </h3>
                  <div className="flex flex-wrap gap-2 ml-8">
                    {user.roles.map((r, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground"
                      >
                        {r.role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Professional Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Briefcase size={18} />
                  Professional Information
                </h3>
                <div className="space-y-3 ml-8">
                  {user.jobTitle && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Job Title
                      </p>
                      <p className="text-foreground font-medium">
                        {user.jobTitle}
                      </p>
                    </div>
                  )}
                  {user.department && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Department
                      </p>
                      <p className="text-foreground font-medium">
                        {user.department}
                      </p>
                    </div>
                  )}
                  {user.phone && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Phone
                      </p>
                      <p className="text-foreground font-medium flex items-center gap-2">
                        <Phone size={14} />
                        {user.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Info */}
              {(user.address || user.city || user.state || user.country) && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <MapPin size={18} />
                    Address
                  </h3>
                  <div className="space-y-3 ml-8">
                    {user.address && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          Street
                        </p>
                        <p className="text-foreground font-medium">
                          {user.address}
                        </p>
                      </div>
                    )}
                    {(user.city || user.state || user.country) && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          City, State, Country
                        </p>
                        <p className="text-foreground font-medium">
                          {[user.city, user.state, user.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock size={18} />
              Login Activity
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LogIn size={16} className="text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Last Login</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(user.lastLoginAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  📊 Full login history feature coming soon. Will include:
                </p>
                <ul className="text-xs text-blue-900 dark:text-blue-300 list-disc list-inside mt-2 space-y-1">
                  <li>Login timestamps and duration</li>
                  <li>IP addresses and geolocation</li>
                  <li>Device information</li>
                  <li>Failed login attempts</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
        description={`Set a new password for ${user.email}`}
        maxWidth="md"
        footer={
          <>
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              disabled={passwordSaving}
              className="px-4 py-2 bg-primary hover:bg-primary-600 text-primary-foreground rounded-lg text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {passwordSaving ? "Saving…" : "Update Password"}
            </button>
          </>
        }
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              New Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordData.password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, password: e.target.value })
                }
                placeholder="At least 8 characters"
                className="w-full px-3 py-2 pr-10 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Confirm Password <span className="text-error">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={passwordData.confirm}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirm: e.target.value })
              }
              placeholder="Re-enter the new password"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {passwordError && (
            <p className="text-xs text-error">{passwordError}</p>
          )}

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-900 dark:text-amber-300">
              🔒 The user will need to use this new password the next time they
              log in.
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Delete User?"
        description={`Are you sure you want to permanently delete ${user.email}? This action cannot be undone.`}
        iconVariant="danger"
        maxWidth="md"
        footer={
          <>
            <button
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-error hover:bg-error/90 text-white rounded-lg text-sm font-medium transition"
            >
              Delete User
            </button>
          </>
        }
      />
    </div>
  );
}

export function UserDetailView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("admin.users");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolved) => setUserId(resolved.id));
  }, [params]);

  if (!userId) return null;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserDetailInner userId={userId} />
    </Suspense>
  );
}
