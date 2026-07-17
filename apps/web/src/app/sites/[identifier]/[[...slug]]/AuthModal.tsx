"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { LoginForm, RegisterForm } from "@/lib/themes/shared/AuthForms";

const ORANGE = "#e4611e";

export function AuthModal({ orgId }: { orgId: string }) {
  const isOpen = useCustomerAuthStore((s) => s.authModalOpen);
  const mode = useCustomerAuthStore((s) => s.authModalMode);
  const close = useCustomerAuthStore((s) => s.closeAuthModal);
  const openAuthModal = useCustomerAuthStore((s) => s.openAuthModal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[400]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            className="fixed inset-0 z-[401] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm bg-white dark:bg-[#1c1c1e] rounded-lg shadow-2xl p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold uppercase tracking-wide text-[#212529] dark:text-white">
                  {mode === "login" ? "Sign In" : "Create Account"}
                </h2>
                <button onClick={close} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {mode === "login" ? (
                <LoginForm orgId={orgId} accentColor={ORANGE} onSuccess={close} />
              ) : (
                <RegisterForm orgId={orgId} accentColor={ORANGE} onSuccess={close} />
              )}

              <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => openAuthModal(mode === "login" ? "register" : "login")}
                  className="font-semibold hover:underline"
                  style={{ color: ORANGE }}
                >
                  {mode === "login" ? "Create one" : "Sign in"}
                </button>
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
