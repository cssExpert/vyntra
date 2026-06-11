"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  Copy,
  ImagePlus,
  KeyRound,
  Package as PackageIcon,
  UserPlus,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { admin, type AdminPackage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { adminInput } from "./AdminGuard";
import { formatPrice, generateSecurePassword } from "./companyUtils";
import { LogoUploader } from "./LogoUploader";
import { Button } from "@/components/ui/button";

// ── Phone masking ─────────────────────────────────────────────────────────────
// Normalises input to a readable phone string as the user types.
// Strips everything except digits and a leading +, then groups digits naturally.
// E.g. "+1 555 000 1234" or "+44 7911 123456"
function maskPhone(raw: string): string {
  // Allow leading + then digits only
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) {
    const rest = digits.slice(1).replace(/\D/g, "");
    // Group: country (1-3 digits), then sets of 3-4
    const parts: string[] = [];
    if (rest.length > 0) parts.push(rest.slice(0, Math.min(3, rest.length)));
    if (rest.length > 3) parts.push(rest.slice(3, Math.min(7, rest.length)));
    if (rest.length > 7) parts.push(rest.slice(7, Math.min(11, rest.length)));
    if (rest.length > 11) parts.push(rest.slice(11, 15));
    return "+" + parts.join(" ");
  }
  // No leading + — group as 10-digit domestic style
  digits = digits.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  if (digits.length <= 10)
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
}

function handlePhoneKeyDown(
  e: React.KeyboardEvent<HTMLInputElement>,
  value: string,
  onChange: (v: string) => void,
) {
  // Allow normal navigation keys
  if (
    [
      "Backspace",
      "Delete",
      "Tab",
      "MoveLeft",
      "MoveRight",
      "Home",
      "End",
    ].includes(e.key)
  )
    return;
  // Block anything that isn't a digit, +, or clipboard shortcut
  if (!/[\d+]/.test(e.key) && !e.ctrlKey && !e.metaKey && e.key.length === 1) {
    e.preventDefault();
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface AddCompanyModalProps {
  isOpen: boolean;
  packages: AdminPackage[];
  onClose: () => void;
  onCreated: (name: string) => void;
  onError: (message: string) => void;
}

type TranslationFunction = any;

type FormState = {
  name: string;
  legalName: string;
  industry: string;
  website: string;
  address: string;
  email: string;
  phone: string;
  // Branding step
  logoUrl: string;
  primaryColor: string;
  // Package
  packageSlug: string;
  // Administrator
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
};

type TouchedState = Partial<Record<keyof FormState, boolean>>;

// ── Validation ────────────────────────────────────────────────────────────────

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isUrl = (v: string) => {
  try {
    const u = new URL(v.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};
const isPhone = (v: string) => /^[+\d][\d\s\-().]{6,19}$/.test(v.trim());

function validate(
  form: FormState,
  t: TranslationFunction,
): Partial<Record<keyof FormState, string>> {
  const e: Partial<Record<keyof FormState, string>> = {};

  if (!form.name.trim()) {
    e.name = t("nameRequired", { defaultValue: "Company name is required." });
  } else if (form.name.trim().length < 2) {
    e.name = t("nameTooShort", {
      defaultValue: "Must be at least 2 characters.",
    });
  }

  if (!form.email.trim()) {
    e.email = t("emailRequired", {
      defaultValue: "Contact email is required.",
    });
  } else if (!isEmail(form.email)) {
    e.email = t("emailInvalid", {
      defaultValue: "Enter a valid email address.",
    });
  }

  if (form.website.trim() && !isUrl(form.website)) {
    e.website = t("websiteInvalid", {
      defaultValue: "Enter a valid URL (e.g. https://acme.com).",
    });
  }

  if (form.phone.trim() && !isPhone(form.phone)) {
    e.phone = t("phoneInvalid", {
      defaultValue: "Enter a valid phone number.",
    });
  }

  if (!form.packageSlug) {
    e.packageSlug = t("packageRequired", {
      defaultValue: "Please select a plan.",
    });
  }

  if (!form.adminFirstName.trim()) {
    e.adminFirstName = t("adminFirstNameRequired", {
      defaultValue: "First name is required.",
    });
  }

  if (!form.adminEmail.trim()) {
    e.adminEmail = t("adminEmailRequired", {
      defaultValue: "Admin email is required.",
    });
  } else if (!isEmail(form.adminEmail)) {
    e.adminEmail = t("adminEmailInvalid", {
      defaultValue: "Enter a valid email address.",
    });
  }

  if (!form.adminPassword) {
    e.adminPassword = t("passwordRequired", {
      defaultValue: "Password is required.",
    });
  } else if (form.adminPassword.length < 8) {
    e.adminPassword = t("passwordMinLength", {
      defaultValue: "Password must be at least 8 characters.",
    });
  }

  return e;
}

// Fields required for each step to be "completable"
const STEP_FIELDS: Record<number, (keyof FormState)[]> = {
  1: ["name", "email", "website", "phone"],
  2: ["packageSlug"],
  3: [], // branding is fully optional
  4: ["adminFirstName", "adminEmail", "adminPassword"],
};

// ── Password strength ─────────────────────────────────────────────────────────

function passwordStrength(pw: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
} {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const capped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
  return {
    score: capped,
    label: ["", "Weak", "Fair", "Good", "Strong"][capped],
  };
}

const strengthColors = [
  "",
  "bg-error",
  "bg-warning",
  "bg-info",
  "bg-success",
] as const;
const strengthTextColors = [
  "",
  "text-error",
  "text-warning",
  "text-info",
  "text-success",
] as const;

// ── Stepper config ────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Company", icon: Building2 },
  { id: 2, label: "Package", icon: PackageIcon },
  { id: 3, label: "Branding", icon: ImagePlus },
  { id: 4, label: "Administrator", icon: UserPlus },
] as const;

const EMPTY_FORM: FormState = {
  name: "",
  legalName: "",
  industry: "",
  website: "",
  address: "",
  email: "",
  phone: "",
  logoUrl: "",
  primaryColor: "#3b82f6",
  packageSlug: "",
  adminFirstName: "",
  adminLastName: "",
  adminEmail: "",
  adminPassword: "",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function AddCompanyModal({
  isOpen,
  packages,
  onClose,
  onCreated,
  onError,
}: AddCompanyModalProps) {
  const t = useTranslations("admin.companies");
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<FormState>(() => ({
    ...EMPTY_FORM,
    packageSlug: packages[0]?.slug ?? "",
  }));
  const [touched, setTouched] = useState<TouchedState>({});
  const [forceShow, setForceShow] = useState<TouchedState>({});

  const allErrors = useMemo(() => validate(form, t), [form, t]);

  const visibleError = useCallback(
    (field: keyof FormState) =>
      touched[field] || forceShow[field] ? allErrors[field] : undefined,
    [touched, forceShow, allErrors],
  );

  const stepClean = useMemo(
    () => STEP_FIELDS[step].every((f) => !allErrors[f]),
    [step, allErrors],
  );

  const set = (patch: Partial<FormState>) =>
    setForm((f) => ({ ...f, ...patch }));
  const touch = (field: keyof FormState) =>
    setTouched((t) => ({ ...t, [field]: true }));

  const reset = () => {
    setForm({ ...EMPTY_FORM, packageSlug: packages[0]?.slug ?? "" });
    setStep(1);
    setTouched({});
    setForceShow({});
    setCopied(false);
  };

  const close = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const handleContinue = () => {
    if (!stepClean) {
      const reveal = STEP_FIELDS[step].reduce<TouchedState>(
        (acc, f) => ({ ...acc, [f]: true }),
        {},
      );
      setForceShow((fs) => ({ ...fs, ...reveal }));
      return;
    }
    setStep((s) => s + 1);
  };

  const generate = () => {
    set({ adminPassword: generateSecurePassword() });
    setCopied(false);
    touch("adminPassword");
  };

  const copyPassword = async () => {
    if (!form.adminPassword) return;
    try {
      await navigator.clipboard.writeText(form.adminPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const submit = async () => {
    const all4 = STEP_FIELDS[4].reduce<TouchedState>(
      (acc, f) => ({ ...acc, [f]: true }),
      {},
    );
    setForceShow((fs) => ({ ...fs, ...all4 }));
    if (!stepClean) return;

    setBusy(true);
    try {
      await admin.createCompany({
        name: form.name.trim(),
        legalName: form.legalName.trim() || undefined,
        industry: form.industry.trim() || undefined,
        website: form.website.trim() || undefined,
        logoUrl: form.logoUrl || undefined,
        address: form.address.trim() || undefined,
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        packageSlug: form.packageSlug,
        adminFirstName: form.adminFirstName.trim(),
        adminLastName: form.adminLastName.trim() || undefined,
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
      });
      const name = form.name.trim();
      reset();
      onClose();
      onCreated(name);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to create company");
    } finally {
      setBusy(false);
    }
  };

  const pwStrength = passwordStrength(form.adminPassword);

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      maxWidth="xl"
      icon={<Building2 className="h-5 w-5" />}
      title="Add Company"
      description="Onboard a new company, assign a plan, and provision its first administrator."
      footer={
        <div className="flex w-full items-center justify-between">
          <Button variant="outline" radius="lg" className="px-3 font-normal"
            onClick={() => (step === 1 ? close() : setStep((s) => s - 1))}
            disabled={busy}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {step < 4 ? (
            <button
              onClick={handleContinue}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 transition cursor-pointer"
            >
              {step === 3 ? "Continue" : "Continue"}
            </button>
          ) : (
            <Button radius="lg" className="bg-foreground px-4 font-semibold text-background hover:bg-foreground hover:opacity-90"
              onClick={submit}
              disabled={busy}
            >
              {busy ? "Creating…" : "Create Company"}
            </Button>
          )}
        </div>
      }
    >
      <div className="px-6 py-5">
        {/* Stepper */}
        <ol className="mb-6 flex items-center">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <li
                key={s.id}
                className="flex flex-1 items-center last:flex-none"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border text-sm transition-colors",
                      done
                        ? "border-primary bg-primary text-primary-foreground"
                        : active
                          ? "border-primary text-primary"
                          : "border-border text-muted-foreground",
                    )}
                  >
                    {done ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      active || done
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span
                    className={cn(
                      "mx-2 h-px flex-1 transition-colors",
                      step > s.id ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* ── Step 1 — Company Details ── */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Company Name" required error={visibleError("name")}>
              <Input
                value={form.name}
                placeholder="Acme Corp"
                autoFocus
                hasError={!!visibleError("name")}
                onChange={(v) => set({ name: v })}
                onBlur={() => touch("name")}
              />
            </Field>

            <Field label="Legal / Business Name">
              <Input
                value={form.legalName}
                placeholder="Acme Corporation Inc."
                onChange={(v) => set({ legalName: v })}
              />
            </Field>

            <Field label="Industry / Domain">
              <Input
                value={form.industry}
                placeholder="SaaS, Retail, Healthcare…"
                onChange={(v) => set({ industry: v })}
              />
            </Field>

            <Field label="Website" error={visibleError("website")}>
              <Input
                value={form.website}
                placeholder="https://acme.com"
                hasError={!!visibleError("website")}
                onChange={(v) => set({ website: v })}
                onBlur={() => touch("website")}
              />
            </Field>

            <Field label="Contact Email" required error={visibleError("email")}>
              <Input
                type="email"
                value={form.email}
                placeholder="hello@acme.com"
                hasError={!!visibleError("email")}
                onChange={(v) => set({ email: v })}
                onBlur={() => touch("email")}
              />
            </Field>

            <Field label="Phone" error={visibleError("phone")}>
              <input
                type="tel"
                inputMode="tel"
                className={cn(
                  adminInput,
                  visibleError("phone") &&
                    "border-error focus:border-error focus:ring-error/20",
                )}
                value={form.phone}
                placeholder="+1 555 000 1234"
                onChange={(e) => {
                  set({ phone: maskPhone(e.target.value) });
                }}
                onKeyDown={(e) =>
                  handlePhoneKeyDown(e, form.phone, (v) => set({ phone: v }))
                }
                onBlur={() => touch("phone")}
                maxLength={20}
              />
            </Field>

            <Field label="Business Address" full>
              <textarea
                className={cn(adminInput, "min-h-[72px] resize-y")}
                value={form.address}
                onChange={(e) => set({ address: e.target.value })}
                placeholder="123 Market St, Suite 400, San Francisco, CA 94103"
              />
            </Field>
          </div>
        )}

        {/* ── Step 2 — Package ── */}
        {step === 2 && (
          <div className="space-y-3">
            {packages.length === 0 ? (
              <p className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                No packages available. Create one under Packages first.
              </p>
            ) : (
              packages.map((p) => {
                const selected = form.packageSlug === p.slug;
                return (
                  <label
                    key={p.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:bg-muted/30",
                    )}
                  >
                    <input
                      type="radio"
                      name="package"
                      className="mt-1 cursor-pointer accent-[var(--color-primary,#3b82f6)]"
                      checked={selected}
                      onChange={() => set({ packageSlug: p.slug })}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-foreground">
                          {p.name}
                        </p>
                        <span className="text-sm font-semibold text-foreground">
                          {formatPrice(p.priceCents, p.billingCycle)}
                        </span>
                      </div>
                      {p.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {p.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        Up to {p.maxUsers} users ·{" "}
                        {p.modules.length ? p.modules.join(", ") : "no modules"}
                      </p>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        )}

        {/* ── Step 3 — Branding ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
              Branding is optional — you can update it anytime from the
              company&apos;s edit page.
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Company Logo
              </label>
              <LogoUploader
                value={form.logoUrl}
                onChange={(v) => set({ logoUrl: v })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Primary Brand Colour
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => set({ primaryColor: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-background p-1"
                />
                <input
                  className={cn(adminInput, "w-32 font-mono uppercase")}
                  value={form.primaryColor}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) set({ primaryColor: v });
                  }}
                  maxLength={7}
                  placeholder="#3b82f6"
                />
                <div
                  className="h-10 w-10 rounded-lg border border-border shadow-sm"
                  style={{ backgroundColor: form.primaryColor }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Used as the platform accent colour for this company&apos;s
                workspace.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 4 — First Administrator ── */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <KeyRound className="h-3.5 w-3.5 shrink-0" />
              This user is created as the company&apos;s first{" "}
              <span className="font-medium text-foreground">ORG_ADMIN</span> and
              can sign in immediately.
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="First Name"
                required
                error={visibleError("adminFirstName")}
              >
                <Input
                  value={form.adminFirstName}
                  placeholder="Jane"
                  autoFocus
                  hasError={!!visibleError("adminFirstName")}
                  onChange={(v) => set({ adminFirstName: v })}
                  onBlur={() => touch("adminFirstName")}
                />
              </Field>

              <Field label="Last Name">
                <Input
                  value={form.adminLastName}
                  placeholder="Doe"
                  onChange={(v) => set({ adminLastName: v })}
                />
              </Field>

              <Field
                label="Admin Email"
                required
                full
                error={visibleError("adminEmail")}
              >
                <Input
                  type="email"
                  value={form.adminEmail}
                  placeholder="jane@acme.com"
                  hasError={!!visibleError("adminEmail")}
                  onChange={(v) => set({ adminEmail: v })}
                  onBlur={() => touch("adminEmail")}
                />
              </Field>

              <Field
                label="Password"
                required
                full
                error={visibleError("adminPassword")}
              >
                <div className="flex gap-2">
                  <input
                    className={cn(
                      adminInput,
                      "font-mono",
                      visibleError("adminPassword") &&
                        "border-error focus:border-error focus:ring-error/20",
                    )}
                    value={form.adminPassword}
                    onChange={(e) => {
                      set({ adminPassword: e.target.value });
                      touch("adminPassword");
                    }}
                    onBlur={() => touch("adminPassword")}
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={generate}
                    className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted transition cursor-pointer whitespace-nowrap"
                  >
                    Generate
                  </button>
                  <button
                    type="button"
                    onClick={copyPassword}
                    disabled={!form.adminPassword}
                    className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted transition cursor-pointer disabled:opacity-50"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {form.adminPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((seg) => (
                        <div
                          key={seg}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors",
                            pwStrength.score >= seg
                              ? strengthColors[pwStrength.score]
                              : "bg-muted",
                          )}
                        />
                      ))}
                    </div>
                    {pwStrength.label && (
                      <p
                        className={cn(
                          "text-xs font-medium",
                          strengthTextColors[pwStrength.score],
                        )}
                      >
                        {pwStrength.label}
                      </p>
                    )}
                  </div>
                )}

                <p className="mt-1.5 text-xs text-muted-foreground">
                  Copy and share it securely — it won&apos;t be shown again.
                </p>
              </Field>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  full,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-error">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function Input({
  type = "text",
  value,
  placeholder,
  autoFocus,
  hasError,
  onChange,
  onBlur,
}: {
  type?: string;
  value: string;
  placeholder?: string;
  autoFocus?: boolean;
  hasError?: boolean;
  onChange: (v: string) => void;
  onBlur?: () => void;
}) {
  return (
    <input
      type={type}
      className={cn(
        adminInput,
        hasError && "border-error focus:border-error focus:ring-error/20",
      )}
      value={value}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  );
}
