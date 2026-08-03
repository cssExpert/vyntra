import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/** Whether this store has connected its own Stripe account — never exposes the secret key, only whether to show a "Pay Online" step. */
export function usePaymentMethods(orgId: string) {
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/public/sites/${orgId}/payment-methods`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { stripeEnabled: boolean; stripePublishableKey: string | null }) => {
        if (cancelled) return;
        setStripeEnabled(data.stripeEnabled);
        setPublishableKey(data.stripePublishableKey);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [orgId]);

  return { stripeEnabled, publishableKey };
}
