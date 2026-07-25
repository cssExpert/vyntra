"use client";

import { useCustomerAuthStore } from "@/store/customerAuthStore";

/** Account icon — always links to /account, which itself shows the login/signup gate for guests and the dashboard for logged-in customers. No modal here (the modal is reserved for quick sign-in prompts triggered elsewhere, e.g. the wishlist heart). */
export function AccountButton({ className }: { className?: string }) {
  const isLoggedIn = useCustomerAuthStore((s) => !!s.customer);

  return (
    <a
      href="/account"
      className={className ?? "p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"}
      aria-label={isLoggedIn ? "Account" : "Sign in"}
    >
      <AccountIcon />
    </a>
  );
}

function AccountIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M6.5 19.2a6.5 6.5 0 0 1 11 0" />
    </svg>
  );
}
