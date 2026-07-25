import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface PublicCustomerGroup {
  id: string;
  name: string;
  description: string | null;
  requiresApproval: boolean;
}

/** Customer groups for the signup page's "choose your account type" cards — a public, unauthenticated read. */
export function useCustomerGroups(orgId: string) {
  const [groups, setGroups] = useState<PublicCustomerGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    fetch(`${API}/public/sites/${orgId}/customer-groups`)
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((res) => !cancelled && setGroups(res.data ?? []))
      .catch(() => !cancelled && setGroups([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [orgId]);

  return { groups, loading };
}
