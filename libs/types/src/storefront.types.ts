// Storefront customer auth contracts — a separate, parallel track from the
// staff auth in auth.types.ts. A storefront customer JWT must never be
// accepted where a staff JwtPayload is expected, or vice versa; the `typ`
// discriminator plus a distinct signing secret (STOREFRONT_JWT_SECRET) are
// what enforce that boundary on the API side.

/** Decoded JWT payload for a storefront (shopper) session. */
export interface CustomerJwtPayload {
  sub: string; // StoreCustomer.id
  organizationId: string;
  email: string;
  typ: 'storefront_customer';
}

export interface StorefrontCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface CustomerAuthResponse {
  customer: StorefrontCustomer;
  accessToken: string;
  refreshToken: string;
}
