"use client";

import { useEffect, useState } from "react";
import { loadStripe, type Stripe as StripeJs } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { storefrontFetch, ApiError } from "@/lib/storefrontApi";

interface PayButtonProps {
  accentColor: string;
  disabled?: boolean;
  onSuccess: (paymentIntentId: string) => void;
}

function PayButton({ accentColor, disabled, onSuccess }: PayButtonProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Please check your payment details");
      setSubmitting(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed — please try again");
      setSubmitting(false);
      return;
    }
    if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
      setError("Payment did not complete — please try again");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-rose-500">{error}</p>}
      <button
        type="button"
        onClick={handlePay}
        disabled={disabled || submitting || !stripe}
        className="w-full py-3.5 rounded text-white text-xs font-bold uppercase tracking-wide transition-colors disabled:opacity-50"
        style={{ backgroundColor: accentColor }}
      >
        {submitting ? "Processing…" : "Pay Now"}
      </button>
    </div>
  );
}

interface StripePaymentStepProps {
  orgId: string;
  publishableKey: string;
  accentColor: string;
  disabled?: boolean;
  onSuccess: (paymentIntentId: string) => void;
}

/**
 * Embedded Stripe Payment Element for the storefront checkout. A PaymentIntent
 * is created for the shopper's current cart total (server-computed, never
 * client-trusted) before the card form mounts — payment is confirmed here,
 * in-page, then the caller places the actual order with the resulting
 * paymentIntentId so the API can verify it server-side before creating it.
 */
export function StripePaymentStep({ orgId, publishableKey, accentColor, disabled, onSuccess }: StripePaymentStepProps) {
  const [stripePromise] = useState<Promise<StripeJs | null>>(() => loadStripe(publishableKey));
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    storefrontFetch<{ clientSecret: string }>(orgId, "/checkout/payment-intent", { method: "POST" })
      .then((res) => {
        if (!cancelled) setClientSecret(res.clientSecret);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't start payment");
      });
    return () => {
      cancelled = true;
    };
  }, [orgId]);

  if (error) return <p className="text-xs text-rose-500">{error}</p>;
  if (!clientSecret) return <p className="text-xs text-gray-400 dark:text-gray-500">Loading payment form…</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <div className="space-y-3">
        <PaymentElement />
        <PayButton accentColor={accentColor} disabled={disabled} onSuccess={onSuccess} />
      </div>
    </Elements>
  );
}
