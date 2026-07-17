import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Requires a valid storefront customer JWT (the 'storefront-customer-jwt'
 * Passport strategy). Applied explicitly per-route — never registered
 * globally — on routes marked @Public() to opt out of the staff JwtAuthGuard
 * first, then re-gated here with the customer-scoped strategy.
 */
@Injectable()
export class StorefrontCustomerAuthGuard extends AuthGuard('storefront-customer-jwt') {
  /**
   * Passport's AuthGuard attaches the validated identity to `request.user`
   * by default. `@CurrentCustomer()` reads `request.customer` (the same
   * property OptionalCustomerAuthGuard uses on cart/checkout routes), so
   * mirror it here rather than have two different request properties for
   * the same concept depending on which guard ran.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const activated = (await super.canActivate(context)) as boolean;
    if (activated) {
      const request = context.switchToHttp().getRequest();
      request.customer = request.user;
    }
    return activated;
  }
}
