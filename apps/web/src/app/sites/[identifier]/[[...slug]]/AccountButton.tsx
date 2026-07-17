"use client";

import { useCustomerAuthStore } from "@/store/customerAuthStore";

/** Account icon — opens the sign-in modal for guests, links to /account for logged-in customers. */
export function AccountButton({ className }: { className?: string }) {
  const isLoggedIn = useCustomerAuthStore((s) => !!s.customer);
  const openAuthModal = useCustomerAuthStore((s) => s.openAuthModal);

  if (isLoggedIn) {
    return (
      <a href="/account" className={className ?? "p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"} aria-label="Account">
        <AccountIcon />
      </a>
    );
  }

  return (
    <button
      onClick={() => openAuthModal("login")}
      className={className ?? "p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"}
      aria-label="Sign in"
    >
      <AccountIcon />
    </button>
  );
}

function AccountIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M6.5 19.2a6.5 6.5 0 0 1 11 0" />
    </svg>
  );
}
