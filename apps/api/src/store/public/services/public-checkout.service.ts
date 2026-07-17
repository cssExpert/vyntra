import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomerAuthResponse } from '@vyntra/types';
import { PrismaService } from '../../../prisma/prisma.service';
import { CouponsService } from '../../services/coupons.service';
import { OrdersService } from '../../services/orders.service';
import { CreateOrderDto } from '../../dto';
import { CartIdentity, PublicCartService } from './public-cart.service';
import { StorefrontAuthService } from './storefront-auth.service';
import { CheckoutDto } from '../dto';

@Injectable()
export class PublicCheckoutService {
  constructor(
    private prisma: PrismaService,
    private cartService: PublicCartService,
    private couponsService: CouponsService,
    private ordersService: OrdersService,
    private authService: StorefrontAuthService,
  ) {}

  /**
   * Places a real order from the shopper's server-persisted cart. Nothing
   * about price/items/discount is trusted from the request body — the cart
   * (looked up via identity, not the client) is the sole source of truth,
   * and every price is re-read live from Product/ProductVariant here.
   */
  async placeOrder(
    orgId: string,
    identity: CartIdentity,
    dto: CheckoutDto,
  ): Promise<{ order: unknown; session?: CustomerAuthResponse }> {
    const cart = await this.cartService.getRawCartForCheckout(orgId, identity);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: cart.items.map((i) => i.productId) } },
      include: { variants: true },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems: CreateOrderDto['items'] = [];
    for (const item of cart.items) {
      const product = productById.get(item.productId);
      if (!product || product.status !== 'active') {
        throw new BadRequestException(`${item.productName} is no longer available`);
      }
      const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : undefined;
      if (item.variantId && !variant) {
        throw new BadRequestException(`${item.productName} variant is no longer available`);
      }
      const available = variant ? variant.stock : product.stock;
      if (available < item.quantity) {
        throw new BadRequestException(`Not enough stock for ${item.productName}`);
      }
      const unitPrice = variant ? variant.price : product.price;
      subtotal += unitPrice * item.quantity;
      orderItems.push({ productId: item.productId, variantId: item.variantId ?? undefined, quantity: item.quantity, unitPrice });
    }

    let discountAmount = 0;
    if (cart.couponCode) {
      const coupon = await this.couponsService.validateCoupon(orgId, cart.couponCode, subtotal, identity.customerId);
      discountAmount = await this.couponsService.calculateDiscount(coupon, subtotal);
    }

    // No shipping/tax engine exists yet — flat zero for v1 (documented open decision, see plan).
    const shippingCost = 0;
    const taxAmount = 0;
    const total = Math.max(0, subtotal - discountAmount + shippingCost + taxAmount);

    const customer = await this.resolveCustomer(orgId, identity, dto);

    const order = await this.ordersService.create(orgId, {
      customerId: customer.id,
      customerName: dto.name,
      customerEmail: dto.email,
      customerPhone: dto.phone,
      items: orderItems,
      subtotal,
      discountAmount,
      shippingCost,
      taxAmount,
      total,
      couponCode: cart.couponCode ?? undefined,
      shippingAddress: dto.shippingAddress,
      billingAddress: dto.billingAddress ?? dto.shippingAddress,
      status: 'pending',
      paymentStatus: 'pending',
      shippingMethod: dto.shippingMethod,
      notes: dto.notes,
    });

    if (cart.couponCode) {
      await this.couponsService.applyCoupon(orgId, order.id, cart.couponCode, subtotal, customer.id);
    }

    await this.cartService.markCartConverted(cart.id, order.id);

    // A fresh guest becomes a real (passwordless) customer record the moment
    // they check out — auto-issue a session so the confirmation page can show
    // a real, authenticated /account/orders/:id view without extra flow.
    const session = identity.customerId
      ? undefined
      : await this.authService.issueGuestSession({
          id: customer.id,
          organizationId: orgId,
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
        });

    return { order, session };
  }

  private async resolveCustomer(orgId: string, identity: CartIdentity, dto: CheckoutDto) {
    if (identity.customerId) {
      const existing = await this.prisma.storeCustomer.findUnique({ where: { id: identity.customerId } });
      if (existing) return existing;
    }

    const byEmail = await this.prisma.storeCustomer.findUnique({
      where: { organizationId_email: { organizationId: orgId, email: dto.email } },
    });
    if (byEmail) return byEmail;

    return this.prisma.storeCustomer.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
      },
    });
  }
}
