"use client";

import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

/** Renders children only for super admins; otherwise shows an access notice. */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Access restricted
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This area is available to platform super admins only.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

// Shared input styling for admin forms.
export const adminInput =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";
