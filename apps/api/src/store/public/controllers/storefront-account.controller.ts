import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Public } from '../../../common/decorators/public.decorator';
import { StorefrontCustomerAuthGuard } from '../guards/storefront-customer-auth.guard';
import { CurrentCustomer, RequestCustomer } from '../decorators/current-customer.decorator';
import { StorefrontAccountService } from '../services/storefront-account.service';
import { UpdateCustomerProfileDto, CreateCustomerAddressDto, UpdateCustomerAddressDto, ChangeCustomerPasswordDto, AddWishlistItemDto } from '../dto';

/**
 * `@Public()` opts every route here out of the global staff JwtAuthGuard;
 * `@UseGuards(StorefrontCustomerAuthGuard)` re-gates them with the separate
 * customer-scoped strategy. A staff JWT will not pass this guard, and a
 * customer JWT will not pass the staff guard on any other controller.
 */
@Controller('public/sites/:orgId/account')
@Public()
@UseGuards(StorefrontCustomerAuthGuard)
export class StorefrontAccountController {
  constructor(private accountService: StorefrontAccountService) {}

  @Get('me')
  me(@CurrentCustomer() customer: RequestCustomer) {
    return this.accountService.getProfile(customer);
  }

  @Patch('me')
  updateMe(@CurrentCustomer() customer: RequestCustomer, @Body() dto: UpdateCustomerProfileDto) {
    return this.accountService.updateProfile(customer, dto);
  }

  @Get('orders')
  orders(
    @CurrentCustomer() customer: RequestCustomer,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.accountService.listOrders(customer, {
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
  }

  @Get('orders/:id')
  order(@CurrentCustomer() customer: RequestCustomer, @Param('id') id: string) {
    return this.accountService.getOrder(customer, id);
  }

  @Get('addresses')
  addresses(@CurrentCustomer() customer: RequestCustomer) {
    return this.accountService.listAddresses(customer);
  }

  @Post('addresses')
  createAddress(@CurrentCustomer() customer: RequestCustomer, @Body() dto: CreateCustomerAddressDto) {
    return this.accountService.createAddress(customer, dto);
  }

  @Patch('addresses/:id')
  updateAddress(
    @CurrentCustomer() customer: RequestCustomer,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerAddressDto,
  ) {
    return this.accountService.updateAddress(customer, id, dto);
  }

  @Delete('addresses/:id')
  deleteAddress(@CurrentCustomer() customer: RequestCustomer, @Param('id') id: string) {
    return this.accountService.deleteAddress(customer, id);
  }

  @Patch('password')
  changePassword(@CurrentCustomer() customer: RequestCustomer, @Body() dto: ChangeCustomerPasswordDto) {
    return this.accountService.changePassword(customer, dto);
  }

  @Get('credit-transactions')
  creditTransactions(
    @CurrentCustomer() customer: RequestCustomer,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.accountService.listCreditTransactions(customer, {
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
  }

  @Get('reward-transactions')
  rewardTransactions(
    @CurrentCustomer() customer: RequestCustomer,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.accountService.listRewardTransactions(customer, {
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
  }

  @Get('downloads')
  downloads(@CurrentCustomer() customer: RequestCustomer) {
    return this.accountService.listDownloadableOrders(customer);
  }

  @Get('wishlist')
  wishlist(@CurrentCustomer() customer: RequestCustomer) {
    return this.accountService.listWishlist(customer);
  }

  @Post('wishlist')
  addWishlistItem(@CurrentCustomer() customer: RequestCustomer, @Body() dto: AddWishlistItemDto) {
    return this.accountService.addWishlistItem(customer, dto.productId);
  }

  @Delete('wishlist/:productId')
  removeWishlistItem(@CurrentCustomer() customer: RequestCustomer, @Param('productId') productId: string) {
    return this.accountService.removeWishlistItem(customer, productId);
  }
}
