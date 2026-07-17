import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestCustomer {
  id: string;
  organizationId: string;
  email: string;
}

/** Inject the storefront customer resolved by StorefrontCustomerAuthGuard or OptionalCustomerAuthGuard (undefined if the request is an anonymous guest). */
export const CurrentCustomer = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestCustomer | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.customer;
  },
);
