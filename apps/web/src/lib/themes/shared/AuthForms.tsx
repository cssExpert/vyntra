"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useCustomerAuth } from "@/lib/themes/useCustomerAuth";
import { formatPhoneInput } from "./phoneMask";
import { requestPasswordReset, resetPassword as resetPasswordRequest } from "@/lib/themes/passwordReset";
import { ApiError } from "@/lib/storefrontApi";

interface AuthFormProps {
  orgId: string;
  accentColor?: string;
  onSuccess?: () => void;
}

interface RegisterFormProps extends AuthFormProps {
  /** Pre-selected CustomerGroup (from the signup page's account-type cards). */
  customerGroupId?: string;
  /** When the chosen group requiresApproval, register() issues no session — called with the "awaiting approval" message instead of onSuccess. */
  onPending?: (message: string) => void;
  /** Renders "ACCOUNT INFORMATION"/"CONTACT INFORMATION" section headers, matching the full signup page layout. Flat field list (no headers) when false, for the compact modal. */
  sectioned?: boolean;
}

export function SectionHeader({ label, accentColor }: { label: string; accentColor: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="inline-block w-4 h-0.5 rounded-full" style={{ backgroundColor: accentColor }} />
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}

export function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
  minLength,
  accentColor,
  autoComplete,
  rightSlot,
  disabled,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  accentColor: string;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-gray-400 dark:text-gray-500">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          type={type}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            borderColor: focused ? accentColor : "var(--border, #e5e7eb)",
            boxShadow: focused ? `0 0 0 3px ${accentColor}26` : "none",
            paddingRight: rightSlot ? "2.5rem" : undefined,
          }}
        />
        {rightSlot}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3 py-2 text-[13px] text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

function SubmitButton({ loading, disabled, accentColor, children }: { loading: boolean; disabled?: boolean; accentColor: string; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full h-11 flex items-center justify-center rounded-full text-white text-sm font-bold uppercase tracking-wide transition-all disabled:opacity-50"
      style={{ backgroundColor: accentColor }}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

export function LoginForm({ orgId, accentColor = "#3b82f6", onSuccess }: AuthFormProps) {
  const { login, loading, error, clearError } = useCustomerAuth(orgId);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
      onSuccess?.();
    } catch {
      // error already captured in the store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FloatingInput id="login-email" label="Email" type="email" required autoComplete="email" value={email} onChange={setEmail} accentColor={accentColor} />
      <FloatingInput
        id="login-password"
        label="Password"
        type={showPassword ? "text" : "password"}
        required
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
        accentColor={accentColor}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      {error && <ErrorBanner message={error} />}
      <SubmitButton loading={loading} accentColor={accentColor}>Sign In</SubmitButton>
    </form>
  );
}

export function RegisterForm({ orgId, accentColor = "#3b82f6", onSuccess, customerGroupId, onPending, sectioned = false }: RegisterFormProps) {
  const { register, loading, error, clearError } = useCustomerAuth(orgId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [zip, setZip] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mismatchError, setMismatchError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setMismatchError(null);
    if (password !== confirmPassword) {
      setMismatchError("Passwords don't match");
      return;
    }
    try {
      const result = await register({
        name,
        email,
        password,
        phone: phone || undefined,
        customerGroupId,
        ...(sectioned && { address: { line1, line2: line2 || undefined, city, state, country, zip } }),
      });
      if (result.pending) {
        onPending?.(result.message ?? "Your account is awaiting approval.");
      } else {
        onSuccess?.();
      }
    } catch {
      // error already captured in the store
    }
  };

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {sectioned && <SectionHeader label="Account Information" accentColor={accentColor} />}
      <div className={sectioned ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
        <FloatingInput id="register-name" label="Full name" required autoComplete="name" value={name} onChange={setName} accentColor={accentColor} />
        <FloatingInput id="register-email" label="Email" type="email" required autoComplete="email" value={email} onChange={setEmail} accentColor={accentColor} />
      </div>
      <FloatingInput
        id="register-password"
        label="Password (min. 8 characters)"
        type={showPassword ? "text" : "password"}
        required
        minLength={8}
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        accentColor={accentColor}
        rightSlot={passwordToggle}
      />
      <FloatingInput
        id="register-confirm-password"
        label="Confirm password"
        type={showPassword ? "text" : "password"}
        required
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        accentColor={accentColor}
      />
      {sectioned && <SectionHeader label="Contact Information" accentColor={accentColor} />}
      <FloatingInput
        id="register-phone"
        label="Phone (optional)"
        autoComplete="tel"
        value={phone}
        onChange={(v) => setPhone(formatPhoneInput(v))}
        accentColor={accentColor}
      />
      {sectioned && (
        <>
          <SectionHeader label="Address" accentColor={accentColor} />
          <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2">Saved as your default shipping &amp; billing address.</p>
          <FloatingInput id="register-line1" label="Address line 1" required autoComplete="address-line1" value={line1} onChange={setLine1} accentColor={accentColor} />
          <FloatingInput id="register-line2" label="Address line 2 (optional)" autoComplete="address-line2" value={line2} onChange={setLine2} accentColor={accentColor} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingInput id="register-city" label="City" required autoComplete="address-level2" value={city} onChange={setCity} accentColor={accentColor} />
            <FloatingInput id="register-state" label="State / Province" required autoComplete="address-level1" value={state} onChange={setState} accentColor={accentColor} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingInput id="register-country" label="Country" required autoComplete="country-name" value={country} onChange={setCountry} accentColor={accentColor} />
            <FloatingInput id="register-zip" label="ZIP / Postal code" required autoComplete="postal-code" value={zip} onChange={setZip} accentColor={accentColor} />
          </div>
        </>
      )}
      {mismatchError && <ErrorBanner message={mismatchError} />}
      {error && <ErrorBanner message={error} />}
      <SubmitButton loading={loading} accentColor={accentColor}>Create Account</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm({ orgId, accentColor = "#3b82f6" }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await requestPasswordReset(orgId, email);
      setSent(res.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong — please try again");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return <p className="text-sm text-gray-600 dark:text-gray-400">{sent}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FloatingInput id="forgot-email" label="Email" type="email" required autoComplete="email" value={email} onChange={setEmail} accentColor={accentColor} />
      {error && <ErrorBanner message={error} />}
      <SubmitButton loading={loading} accentColor={accentColor}>Send Reset Link</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ orgId, accentColor = "#3b82f6", token, onSuccess }: AuthFormProps & { token: string | null }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (!token) {
      setError("This reset link is missing its token — please use the link from your email.");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordRequest(orgId, token, newPassword);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "This reset link is invalid or has expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FloatingInput
        id="reset-new-password"
        label="New password (min. 8 characters)"
        type={showPassword ? "text" : "password"}
        required
        minLength={8}
        autoComplete="new-password"
        value={newPassword}
        onChange={setNewPassword}
        accentColor={accentColor}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      <FloatingInput
        id="reset-confirm-password"
        label="Confirm new password"
        type={showPassword ? "text" : "password"}
        required
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        accentColor={accentColor}
      />
      {error && <ErrorBanner message={error} />}
      <SubmitButton loading={loading} disabled={!token} accentColor={accentColor}>Reset Password</SubmitButton>
    </form>
  );
}
