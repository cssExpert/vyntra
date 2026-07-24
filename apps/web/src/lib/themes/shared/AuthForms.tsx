"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useCustomerAuth } from "@/lib/themes/useCustomerAuth";

interface AuthFormProps {
  orgId: string;
  accentColor?: string;
  onSuccess?: () => void;
}

function FloatingInput({
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
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white"
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

function ErrorBanner({ message }: { message: string }) {
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

export function RegisterForm({ orgId, accentColor = "#3b82f6", onSuccess }: AuthFormProps) {
  const { register, loading, error, clearError } = useCustomerAuth(orgId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register({ name, email, password, phone: phone || undefined });
      onSuccess?.();
    } catch {
      // error already captured in the store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FloatingInput id="register-name" label="Full name" required autoComplete="name" value={name} onChange={setName} accentColor={accentColor} />
      <FloatingInput id="register-email" label="Email" type="email" required autoComplete="email" value={email} onChange={setEmail} accentColor={accentColor} />
      <FloatingInput id="register-phone" label="Phone (optional)" autoComplete="tel" value={phone} onChange={setPhone} accentColor={accentColor} />
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
      <SubmitButton loading={loading} accentColor={accentColor}>Create Account</SubmitButton>
    </form>
  );
}
