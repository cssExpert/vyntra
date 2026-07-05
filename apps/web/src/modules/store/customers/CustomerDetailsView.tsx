"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Mail, MessageSquare, Loader2, Save, Pencil, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CustomerStatus, StoreCustomer } from "../store.types";
import { CUSTOMER_STATUS_BADGES } from "../store.constants";
import { formatStorePrice, toStoreCustomer } from "../store.utils";
import { storeCustomerGroups, storeCustomers, type ApiCustomerGroup } from "@/lib/api";

const CUSTOMER_STATUSES: CustomerStatus[] = ["active", "blocked", "unverified"];

interface CustomerDetailsViewProps {
  customerId: string;
}

export function CustomerDetailsView({ customerId }: CustomerDetailsViewProps) {
  const t = useTranslations("store.customers");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customer, setCustomer] = useState<StoreCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [groups, setGroups] = useState<ApiCustomerGroup[]>([]);
  const [customerGroupId, setCustomerGroupId] = useState<string>("");
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [groupSaveError, setGroupSaveError] = useState<string | null>(null);
  const [groupSaved, setGroupSaved] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState<CustomerStatus>("active");
  const [editIsVip, setEditIsVip] = useState(false);
  const [editErrors, setEditErrors] = useState<{ name?: string; email?: string }>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  const startEditing = (c: StoreCustomer) => {
    setEditName(c.name);
    setEditEmail(c.email);
    setEditPhone(c.phone ?? "");
    setEditStatus(c.status);
    setEditIsVip(c.isVip ?? false);
    setEditErrors({});
    setProfileSaveError(null);
    setIsEditing(true);
  };

  useEffect(() => {
    const fetchCustomer = async () => {
      setIsLoading(true);
      try {
        const found = await storeCustomers.get(customerId);
        const mapped = toStoreCustomer(found);
        setCustomer(mapped);
        setCustomerGroupId(found.customerGroupId ?? "");
        if (searchParams.get("edit")) startEditing(mapped);
      } catch {
        setCustomer(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const handleSaveProfile = async () => {
    const errors: typeof editErrors = {};
    if (!editName.trim()) errors.name = t("errorNameRequired", { defaultValue: "Name is required." });
    if (!editEmail.trim()) errors.email = t("errorEmailRequired", { defaultValue: "Email is required." });
    else if (!/^\S+@\S+\.\S+$/.test(editEmail)) errors.email = t("errorEmailInvalid", { defaultValue: "Enter a valid email address." });
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSavingProfile(true);
    setProfileSaveError(null);
    try {
      const updated = await storeCustomers.update(customerId, {
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim() || undefined,
        status: editStatus,
        isVip: editIsVip,
      });
      setCustomer(toStoreCustomer(updated));
      setIsEditing(false);
    } catch (err) {
      setProfileSaveError(err instanceof Error ? err.message : t("profileSaveFailed", { defaultValue: "Couldn't save changes. Please try again." }));
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    storeCustomerGroups.list().then((res) => setGroups(res.data)).catch(() => {});
  }, []);

  const handleSaveGroup = async () => {
    setIsSavingGroup(true);
    setGroupSaveError(null);
    setGroupSaved(false);
    try {
      await storeCustomers.updateGroup(customerId, customerGroupId || null);
      setGroupSaved(true);
    } catch {
      setGroupSaveError("Couldn't save the customer group. Please try again.");
    } finally {
      setIsSavingGroup(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-96"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </motion.div>
    );
  }

  if (!customer) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 min-h-96"
      >
        <p className="text-muted-foreground">{t("noCustomers")}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </motion.div>
    );
  }

  const statusBadge = CUSTOMER_STATUS_BADGES[customer.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title={customer.name}
        description={customer.email}
        breadcrumbs={[
          { label: t("store"), href: "/store" },
          { label: t("title"), href: "/store/customers" },
          { label: customer.name },
        ]}
      >
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="lg" onClick={() => setIsEditing(false)} disabled={isSavingProfile}>
                <X size={16} />
                {t("cancel", { defaultValue: "Cancel" })}
              </Button>
              <Button size="lg" onClick={handleSaveProfile} disabled={isSavingProfile}>
                <Save size={16} />
                {isSavingProfile ? t("saving", { defaultValue: "Saving…" }) : t("save", { defaultValue: "Save" })}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="lg" onClick={() => startEditing(customer)}>
                <Pencil size={16} />
                {t("edit", { defaultValue: "Edit" })}
              </Button>
              <Button variant="outline" size="lg">
                <Mail size={16} />
                {t("email")}
              </Button>
              <Button variant="outline" size="lg">
                <MessageSquare size={16} />
                {t("message")}
              </Button>
            </>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl space-y-4">
            {isEditing ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("customerHeader", { defaultValue: "Name" })}</p>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  {editErrors.name && <p className="mt-1 text-xs text-destructive">{editErrors.name}</p>}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("email")}</p>
                  <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                  {editErrors.email && <p className="mt-1 text-xs text-destructive">{editErrors.email}</p>}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("phone")}</p>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </div>
                {profileSaveError && <p className="text-xs text-destructive">{profileSaveError}</p>}
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("email")}</p>
                  <p className="text-sm">{customer.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("phone")}</p>
                  <p className="text-sm">{customer.phone || "—"}</p>
                </div>
                {customer.country && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Country</p>
                    <p className="text-sm">{customer.country}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Customer Stats */}
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("status")}</p>
              {isEditing ? (
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as CustomerStatus)}
                  className="h-9 w-full rounded-sm border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all cursor-pointer"
                >
                  {CUSTOMER_STATUSES.map((s) => (
                    <option key={s} value={s}>{t(CUSTOMER_STATUS_BADGES[s].label)}</option>
                  ))}
                </select>
              ) : (
                <p className="text-sm">{t(statusBadge.label)}</p>
              )}
            </div>
            {isEditing && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{t("vip", { defaultValue: "VIP" })}</p>
                <Switch checked={editIsVip} onCheckedChange={setEditIsVip} />
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("totalOrders")}</p>
              <p className="text-xl font-bold">{customer.totalOrders || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("lifetimeValue")}</p>
              <p className="text-xl font-bold">{formatStorePrice(customer.totalSpent || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="font-semibold mb-4">{t("details")}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t("joinedDate")}</p>
            <p>{new Date(customer.registeredAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("lastOrder")}</p>
            <p>{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : "—"}</p>
          </div>
        </div>
      </div>

      {/* Customer Group */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="font-semibold mb-1">Customer Group</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Controls pricing, product visibility, and B2B purchasing rules for this customer.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <select
            value={customerGroupId}
            onChange={(e) => { setCustomerGroupId(e.target.value); setGroupSaved(false); }}
            className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all cursor-pointer sm:w-64"
          >
            <option value="">No group</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <Button onClick={handleSaveGroup} disabled={isSavingGroup} size="sm">
            <Save size={14} /> {isSavingGroup ? "Saving…" : "Save"}
          </Button>
          {groupSaved && <span className="text-xs text-success">Saved.</span>}
        </div>
        {groupSaveError && <p className="text-xs text-destructive mt-2">{groupSaveError}</p>}
      </div>
    </motion.div>
  );
}
