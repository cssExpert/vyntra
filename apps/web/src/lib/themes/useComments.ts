"use client";

import { useCallback, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface PublicComment {
  id: string;
  parentId: string | null;
  body: string;
  authorName: string | null;
  rating: number | null;
  createdAt: string;
  replies: PublicComment[];
}

async function getJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

/**
 * Approved, threaded comments for a resource (e.g. a blog post). Server-side
 * enforces the same allowComments gate as the resource itself, so this
 * simply returns an empty list when comments are disabled — callers still
 * gate the form/section UI on `post.allowComments` directly.
 */
export function useComments(orgId: string | undefined, resourceType: string, resourceId: string | undefined) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!orgId || !resourceId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getJson<PublicComment[]>(
      `${API}/public/sites/${orgId}/comments?resourceType=${encodeURIComponent(resourceType)}&resourceId=${encodeURIComponent(resourceId)}`,
    )
      .then((data) => {
        if (!cancelled) setComments(data ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orgId, resourceType, resourceId, refreshKey]);

  return { comments, loading, refresh };
}
