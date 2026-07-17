// Guest cart identity — a random token persisted as a first-party cookie on
// the tenant's own origin (acme.localhost, acme.vyntra.com, …). Never sent
// automatically to the API (different host) — storefrontApi.ts reads it and
// forwards it explicitly as the X-Cart-Token header.

const COOKIE_NAME = "vyntra_cart_token";
const MAX_AGE_DAYS = 30;

export function getCartToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCartToken(token: string): void {
  if (typeof document === "undefined") return;
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearCartToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
