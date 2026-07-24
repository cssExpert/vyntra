"use client";

import { useWishlist } from "@/lib/themes/useWishlist";
import { useCustomerAuthStore } from "@/store/customerAuthStore";

/** Wishlist icon + count — links to /account/wishlist if signed in, otherwise opens the sign-in modal. */
export function WishlistButton({ orgId, className }: { orgId: string; className?: string }) {
  const { items, isLoggedIn } = useWishlist(orgId);
  const openAuthModal = useCustomerAuthStore((s) => s.openAuthModal);
  const count = items.length;

  const content = (
    <>
      <svg width="18" height="18" viewBox="0 0 24 24" fill={count > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {count > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#e4611e] text-white flex items-center justify-center text-[9px] font-bold">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </>
  );

  if (isLoggedIn) {
    return (
      <a href="/account/wishlist" className={className ?? "p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"} aria-label={`Wishlist, ${count} items`}>
        {content}
      </a>
    );
  }

  return (
    <button
      onClick={() => openAuthModal("login")}
      className={className ?? "p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"}
      aria-label="Sign in to view wishlist"
    >
      {content}
    </button>
  );
}
