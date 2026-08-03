import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomerAuthResponse } from '@vyntra/types';
import { PrismaService } from '../../../prisma/prisma.service';
import { CouponsService } from '../../services/coupons.service';
import { OrdersService } from '../../services/orders.service';
import { StripeService } from '../../services/stripe.service';
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
    private stripeService: StripeService,
  ) {}

  /**
   * Recomputes cart pricing straight from Product/ProductVariant + the
   * server-persisted cart — nothing about price/items/discount is ever
   * trusted from the client. Shared by placeOrder and the Stripe
   * PaymentIntent creation step so both always agree on the same total.
   */
  private async computeCartPricing(orgId: string, identity: CartIdentity) {
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

    return { cart, orderItems, subtotal, discountAmount, shippingCost, taxAmount, total };
  }

  /** Creates a Stripe PaymentIntent for the shopper's current cart total, for the embedded Payment Element checkout step. */
  async createPaymentIntentForCart(orgId: string, identity: CartIdentity) {
    const { total } = await this.computeCartPricing(orgId, identity);
    if (total <= 0) {
      throw new BadRequestException('Cart total must be greater than zero');
    }
    try {
      const paymentIntent = await this.stripeService.createPaymentIntent(orgId, total, 'usd', {
        organizationId: orgId,
        ...(identity.customerId && { customerId: identity.customerId }),
      });
      return { clientSecret: paymentIntent.client_secret, amount: total };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      // Never leak a raw Stripe SDK error (invalid key, network issue, etc.) as an unhandled 500.
      throw new BadRequestException(
        err instanceof Error ? `Could not start payment: ${err.message}` : 'Could not start payment',
      );
    }
  }

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
    const { cart, orderItems, subtotal, discountAmount, shippingCost, taxAmount, total } =
      await this.computeCartPricing(orgId, identity);

    const customer = await this.resolveCustomer(orgId, identity, dto);
    await this.assertWithinOrderLimits(customer.customerGroupId, total);

    // A paymentIntentId means the shopper already paid via the embedded
    // Payment Element — verify it actually succeeded and for the right
    // amount (never trust the client on either count) before marking the
    // order paid. No paymentIntentId at all keeps today's exact behavior
    // (pending/invoice, no gateway involved).
    let paymentStatus = 'pending';
    if (dto.paymentIntentId) {
      let paymentIntent;
      try {
        paymentIntent = await this.stripeService.retrievePaymentIntent(orgId, dto.paymentIntentId);
      } catch (err) {
        throw new BadRequestException(
          err instanceof Error ? `Could not verify payment: ${err.message}` : 'Could not verify payment',
        );
      }
      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException('Payment has not completed');
      }
      const paidAmount = paymentIntent.amount / 100;
      if (Math.abs(paidAmount - total) > 0.01) {
        throw new BadRequestException('Payment amount does not match cart total');
      }
      paymentStatus = 'paid';
    }

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
      paymentStatus,
      shippingMethod: dto.shippingMethod,
      notes: dto.notes,
    });

    if (dto.paymentIntentId) {
      await this.prisma.payment.create({
        data: {
          organizationId: orgId,
          orderId: order.id,
          amount: total,
          currency: 'USD',
          method: 'stripe',
          status: 'succeeded',
          transactionId: dto.paymentIntentId,
        },
      });
    }

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

  /** B2B order-value gating configured per CustomerGroup (Store → Customer Groups → Purchasing). */
  private async assertWithinOrderLimits(customerGroupId: string | null, total: number) {
    if (!customerGroupId) return;
    const group = await this.prisma.customerGroup.findUnique({
      where: { id: customerGroupId },
      select: { name: true, minOrderValue: true, maxOrderValue: true },
    });
    if (!group) return;
    if (group.minOrderValue != null && total < group.minOrderValue) {
      throw new BadRequestException(
        `Minimum order value for ${group.name} accounts is ${group.minOrderValue}`,
      );
    }
    if (group.maxOrderValue != null && total > group.maxOrderValue) {
      throw new BadRequestException(
        `Maximum order value for ${group.name} accounts is ${group.maxOrderValue}`,
      );
    }
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
