import { Body, Controller, Delete, ForbiddenException, Get, Headers, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Public } from '../../../common/decorators/public.decorator';
import { OptionalCustomerAuthGuard } from '../guards/optional-customer-auth.guard';
import { CurrentCustomer, RequestCustomer } from '../decorators/current-customer.decorator';
import { PublicCartService, CartIdentity } from '../services/public-cart.service';
import { AddCartItemDto, UpdateCartItemDto, ApplyCartCouponDto, MergeCartDto } from '../dto';
import { StorefrontCustomerAuthGuard } from '../guards/storefront-customer-auth.guard';

@Controller('public/sites/:orgId/cart')
@Public()
export class PublicCartController {
  constructor(private cartService: PublicCartService) {}

  private resolveIdentity(
    orgId: string,
    customer: RequestCustomer | undefined,
    guestToken?: string,
  ): CartIdentity {
    if (customer) {
      if (customer.organizationId !== orgId) {
        throw new ForbiddenException('Customer does not belong to this store');
      }
      return { customerId: customer.id };
    }
    return { guestToken };
  }

  @UseGuards(OptionalCustomerAuthGuard)
  @Get()
  getCart(
    @Param('orgId') orgId: string,
    @CurrentCustomer() customer: RequestCustomer | undefined,
    @Headers('x-cart-token') guestToken?: string,
  ) {
    return this.cartService.getCart(orgId, this.resolveIdentity(orgId, customer, guestToken));
  }

  @UseGuards(OptionalCustomerAuthGuard)
  @Post('items')
  addItem(
    @Param('orgId') orgId: string,
    @CurrentCustomer() customer: RequestCustomer | undefined,
    @Headers('x-cart-token') guestToken: string | undefined,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(orgId, this.resolveIdentity(orgId, customer, guestToken), dto);
  }

  @UseGuards(OptionalCustomerAuthGuard)
  @Patch('items/:itemId')
  updateItem(
    @Param('orgId') orgId: string,
    @Param('itemId') itemId: string,
    @CurrentCustomer() customer: RequestCustomer | undefined,
    @Headers('x-cart-token') guestToken: string | undefined,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(
      orgId,
      this.resolveIdentity(orgId, customer, guestToken),
      itemId,
      dto.quantity,
    );
  }

  @UseGuards(OptionalCustomerAuthGuard)
  @Delete('items/:itemId')
  removeItem(
    @Param('orgId') orgId: string,
    @Param('itemId') itemId: string,
    @CurrentCustomer() customer: RequestCustomer | undefined,
    @Headers('x-cart-token') guestToken?: string,
  ) {
    return this.cartService.removeItem(orgId, this.resolveIdentity(orgId, customer, guestToken), itemId);
  }

  @UseGuards(OptionalCustomerAuthGuard)
  @Delete()
  clearCart(
    @Param('orgId') orgId: string,
    @CurrentCustomer() customer: RequestCustomer | undefined,
    @Headers('x-cart-token') guestToken?: string,
  ) {
    return this.cartService.clearCart(orgId, this.resolveIdentity(orgId, customer, guestToken));
  }

  @UseGuards(OptionalCustomerAuthGuard)
  @Post('coupon')
  applyCoupon(
    @Param('orgId') orgId: string,
    @CurrentCustomer() customer: RequestCustomer | undefined,
    @Headers('x-cart-token') guestToken: string | undefined,
    @Body() dto: ApplyCartCouponDto,
  ) {
    return this.cartService.applyCoupon(orgId, this.resolveIdentity(orgId, customer, guestToken), dto.code);
  }

  @UseGuards(OptionalCustomerAuthGuard)
  @Delete('coupon')
  removeCoupon(
    @Param('orgId') orgId: string,
    @CurrentCustomer() customer: RequestCustomer | undefined,
    @Headers('x-cart-token') guestToken?: string,
  ) {
    return this.cartService.removeCoupon(orgId, this.resolveIdentity(orgId, customer, guestToken));
  }

  /** Requires a real customer session — merging is only meaningful right after login/register. */
  @UseGuards(StorefrontCustomerAuthGuard)
  @Post('merge')
  merge(
    @Param('orgId') orgId: string,
    @CurrentCustomer() customer: RequestCustomer,
    @Body() dto: MergeCartDto,
  ) {
    if (customer.organizationId !== orgId) {
      throw new ForbiddenException('Customer does not belong to this store');
    }
    return this.cartService.mergeGuestCartIntoCustomer(orgId, customer.id, dto.guestToken);
  }
}
