import { create } from "zustand";
import type { ToastItem } from "@/components/common/Toaster";

interface StorefrontToastState {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastItem["type"]) => void;
  dismiss: (id: number) => void;
}

/**
 * Global toast queue for the storefront — needs to be reachable from many
 * independent components (product cards, product detail, cart drawer,
 * checkout), unlike components/common/Toaster.tsx's useToaster() hook which
 * is per-component local state. Renders through the same Toaster component.
 */
export const useStorefrontToastStore = create<StorefrontToastState>((set) => ({
  toasts: [],
  addToast: (message, type = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
