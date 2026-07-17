import { Body, Controller, ForbiddenException, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { Public } from '../../../common/decorators/public.decorator';
import { OptionalCustomerAuthGuard } from '../guards/optional-customer-auth.guard';
import { CurrentCustomer, RequestCustomer } from '../decorators/current-customer.decorator';
import { PublicCheckoutService } from '../services/public-checkout.service';
import { CheckoutDto } from '../dto';

@Controller('public/sites/:orgId/checkout')
@Public()
export class PublicCheckoutController {
  constructor(private checkoutService: PublicCheckoutService) {}

  @UseGuards(OptionalCustomerAuthGuard)
  @Post()
  checkout(
    @Param('orgId') orgId: string,
    @CurrentCustomer() customer: RequestCustomer | undefined,
    @Headers('x-cart-token') guestToken: string | undefined,
    @Body() dto: CheckoutDto,
  ) {
    if (customer && customer.organizationId !== orgId) {
      throw new ForbiddenException('Customer does not belong to this store');
    }
    const identity = customer ? { customerId: customer.id } : { guestToken };
    return this.checkoutService.placeOrder(orgId, identity, dto);
  }
}
