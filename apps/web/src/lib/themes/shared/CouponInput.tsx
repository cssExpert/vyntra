"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface CouponInputProps {
  couponCode: string | null;
  discount: number;
  currencyCode: string;
  onApply: (code: string) => Promise<void>;
  onRemove: () => Promise<void>;
  /** Accent color for the applied/apply button — defaults to a neutral blue matching the "common" theme. */
  accentColor?: string;
}

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

/** Theme-agnostic coupon input, shared by Cart and Checkout pages across both themes. */
export function CouponInput({ couponCode, discount, currencyCode, onApply, onRemove, accentColor = "#3b82f6" }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onApply(code.trim());
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid coupon code");
    } finally {
      setLoading(false);
    }
  };

  if (couponCode) {
    return (
      <div className="flex items-center justify-between text-sm rounded border px-3 py-2" style={{ borderColor: accentColor }}>
        <span>
          Coupon <strong>{couponCode}</strong> applied — saved {formatPrice(discount, currencyCode)}
        </span>
        <button onClick={() => onRemove()} className="p-1 text-gray-400 hover:text-rose-500 transition-colors" aria-label="Remove coupon">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder="Coupon code"
          className="flex-1 px-3 py-2 text-sm border rounded outline-none"
          style={{ borderColor: "var(--border, #e5e7eb)" }}
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-white rounded disabled:opacity-40"
          style={{ backgroundColor: accentColor }}
        >
          {loading ? "…" : "Apply"}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
