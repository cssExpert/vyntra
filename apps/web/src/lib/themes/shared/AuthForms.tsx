"use client";

import { useState } from "react";
import { useCustomerAuth } from "@/lib/themes/useCustomerAuth";

interface AuthFormProps {
  orgId: string;
  accentColor?: string;
  onSuccess?: () => void;
}

const inputClass = "w-full px-3.5 py-2.5 text-sm border rounded outline-none";
const inputStyle = { borderColor: "var(--border, #e5e7eb)" };

export function LoginForm({ orgId, accentColor = "#3b82f6", onSuccess }: AuthFormProps) {
  const { login, loading, error, clearError } = useCustomerAuth(orgId);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} style={inputStyle} />
      <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} style={inputStyle} />
      {error && <p className="text-xs text-rose-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 text-sm font-bold uppercase tracking-wide text-white rounded disabled:opacity-50"
        style={{ backgroundColor: accentColor }}
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

export function RegisterForm({ orgId, accentColor = "#3b82f6", onSuccess }: AuthFormProps) {
  const { register, loading, error, clearError } = useCustomerAuth(orgId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

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
    <form onSubmit={handleSubmit} className="space-y-3">
      <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={inputStyle} />
      <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} style={inputStyle} />
      <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} style={inputStyle} />
      <input type="password" required minLength={8} placeholder="Password (min. 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} style={inputStyle} />
      {error && <p className="text-xs text-rose-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 text-sm font-bold uppercase tracking-wide text-white rounded disabled:opacity-50"
        style={{ backgroundColor: accentColor }}
      >
        {loading ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
