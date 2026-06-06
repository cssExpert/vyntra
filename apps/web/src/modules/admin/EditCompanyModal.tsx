"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import {
  admin,
  type AdminCompany,
  type AdminPackage,
  type UpdateCompanyPayload,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { adminInput } from "./AdminGuard";

interface EditCompanyModalProps {
  company: AdminCompany | null;
  packages: AdminPackage[];
  onClose: () => void;
  onSaved: (name: string) => void;
  onError: (message: string) => void;
}

export function EditCompanyModal({
  company,
  packages,
  onClose,
  onSaved,
  onError,
}: EditCompanyModalProps) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<UpdateCompanyPayload>({});

  useEffect(() => {
    if (!company) return;
    setForm({
      name: company.name,
      legalName: company.legalName ?? "",
      industry: company.industry ?? "",
      address: company.address ?? "",
      logoUrl: company.logoUrl ?? "",
      email: company.email ?? "",
      phone: company.phone ?? "",
      website: company.website ?? "",
      isActive: company.isActive,
      maxUsers: company.maxUsers,
      packageSlug: company.subscription?.package.slug ?? packages[0]?.slug,
    });
  }, [company, packages]);

  const set = (patch: Partial<UpdateCompanyPayload>) =>
    setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    if (!company) return;
    setBusy(true);
    try {
      // Send only fields that changed from the original to keep the payload tight.
      const payload: UpdateCompanyPayload = {
        name: form.name?.trim() || undefined,
        legalName: form.legalName?.trim() || undefined,
        industry: form.industry?.trim() || undefined,
        address: form.address?.trim() || undefined,
        logoUrl: form.logoUrl?.trim() || undefined,
        email: form.email?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        website: form.website?.trim() || undefined,
        isActive: form.isActive,
        maxUsers: form.maxUsers ? Number(form.maxUsers) : undefined,
      };
      if (
        form.packageSlug &&
        form.packageSlug !== company.subscription?.package.slug
      ) {
        payload.packageSlug = form.packageSlug;
      }
      await admin.updateCompany(company.id, payload);
      onSaved(form.name?.trim() || company.name);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to update company");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={!!company}
      onClose={busy ? () => {} : onClose}
      maxWidth="xl"
      icon={<Pencil className="h-5 w-5" />}
      title="Edit Company"
      description="Update company details, plan, and operational status."
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={busy || !form.name?.trim()}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 transition cursor-pointer disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save Changes"}
          </button>
        </div>
      }
    >
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company Name">
            <input
              className={adminInput}
              value={form.name ?? ""}
              onChange={(e) => set({ name: e.target.value })}
            />
          </Field>
          <Field label="Legal / Business Name">
            <input
              className={adminInput}
              value={form.legalName ?? ""}
              onChange={(e) => set({ legalName: e.target.value })}
            />
          </Field>
          <Field label="Industry / Domain">
            <input
              className={adminInput}
              value={form.industry ?? ""}
              onChange={(e) => set({ industry: e.target.value })}
            />
          </Field>
          <Field label="Website">
            <input
              className={adminInput}
              value={form.website ?? ""}
              onChange={(e) => set({ website: e.target.value })}
            />
          </Field>
          <Field label="Logo URL">
            <input
              className={adminInput}
              value={form.logoUrl ?? ""}
              onChange={(e) => set({ logoUrl: e.target.value })}
            />
          </Field>
          <Field label="Contact Email">
            <input
              className={adminInput}
              value={form.email ?? ""}
              onChange={(e) => set({ email: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <input
              className={adminInput}
              value={form.phone ?? ""}
              onChange={(e) => set({ phone: e.target.value })}
            />
          </Field>
          <Field label="Max Users">
            <input
              type="number"
              min={1}
              className={adminInput}
              value={form.maxUsers ?? 1}
              onChange={(e) => set({ maxUsers: Number(e.target.value) })}
            />
          </Field>
          <Field label="Plan">
            <select
              className={adminInput}
              value={form.packageSlug ?? ""}
              onChange={(e) => set({ packageSlug: e.target.value })}
            >
              {packages.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className={adminInput}
              value={form.isActive ? "active" : "suspended"}
              onChange={(e) => set({ isActive: e.target.value === "active" })}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </Field>
          <Field label="Business Address" full>
            <textarea
              className={cn(adminInput, "min-h-[72px] resize-y")}
              value={form.address ?? ""}
              onChange={(e) => set({ address: e.target.value })}
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
