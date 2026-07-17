"use client";

import { Toaster } from "@/components/common/Toaster";
import { useStorefrontToastStore } from "@/store/storefrontToastStore";
import { MiniCartDrawer } from "./MiniCartDrawer";
import { AuthModal } from "./AuthModal";

/** Overlay chrome mounted once per storefront page render: mini-cart drawer, auth modal, toast queue. */
export function StorefrontChrome({ orgId }: { orgId: string }) {
  const toasts = useStorefrontToastStore((s) => s.toasts);
  const dismiss = useStorefrontToastStore((s) => s.dismiss);

  return (
    <>
      <MiniCartDrawer orgId={orgId} />
      <AuthModal orgId={orgId} />
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
