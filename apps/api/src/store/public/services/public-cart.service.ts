import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { CouponsService } from '../../services/coupons.service';
import { AddCartItemDto } from '../dto';

export interface CartIdentity {
  customerId?: string;
  guestToken?: string;
}

/** Flattens ProductVariant.attributes ({"Size":"M","Color":"Red"}) into a display label ("M / Red"). */
function variantLabelFrom(attributes: unknown): string | null {
  if (!attributes || typeof attributes !== 'object') return null;
  const values = Object.values(attributes as Record<string, unknown>).filter(
    (v): v is string => typeof v === 'string' && v.length > 0,
  );
  return values.length ? values.join(' / ') : null;
}

@Injectable()
export class PublicCartService {
  constructor(
    private prisma: PrismaService,
    private couponsService: CouponsService,
  ) {}

  /** Raw cart + items for checkout — the source of truth for what's being ordered (never trust client-sent items/prices). */
  async getRawCartForCheckout(orgId: string, identity: CartIdentity) {
    return this.findCart(orgId, identity);
  }

  async markCartConverted(cartId: string, orderId: string) {
    await this.prisma.cart.update({ where: { id: cartId }, data: { status: 'converted', convertedOrderId: orderId } });
  }

  /** Read-only cart fetch — never creates a row, so a GET from a brand-new visitor doesn't write to the DB. */
  async getCart(orgId: string, identity: CartIdentity) {
    const cart = await this.findCart(orgId, identity);
    if (!cart) return this.emptyCartView(identity.guestToken);
    return this.toCartView(cart);
  }

  async addItem(orgId: string, identity: CartIdentity, dto: AddCartItemDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, organizationId: orgId, status: 'active' },
      include: { variants: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    const variant = dto.variantId ? product.variants.find((v) => v.id === dto.variantId) : undefined;
    if (dto.variantId && !variant) throw new NotFoundException('Variant not found');

    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock < dto.quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    const cart = await this.findOrCreateCart(orgId, identity);

    // Prisma's compound-unique WhereUniqueInput doesn't accept null for a
    // nullable member (variantId), even though the DB itself treats each
    // NULL as distinct in the unique index — findFirst with a plain where
    // sidesteps that typing gap.
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: dto.productId, variantId: dto.variantId ?? null },
    });

    const unitPrice = variant ? variant.price : product.price;
    const imageUrl = variant?.imageUrl ?? product.featuredImage ?? null;
    const sku = variant?.sku ?? product.sku;
    const variantLabel = variant ? variantLabelFrom(variant.attributes) : null;

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;
      if (availableStock < newQuantity) {
        throw new BadRequestException('Not enough stock available');
      }
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity, unitPrice, imageUrl, sku, variantLabel, productName: product.name },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          variantId: dto.variantId,
          quantity: dto.quantity,
          productName: product.name,
          sku,
          unitPrice,
          imageUrl,
          variantLabel,
        },
      });
    }

    return this.getCartOrThrow(orgId, cart.id);
  }

  async updateItemQuantity(orgId: string, identity: CartIdentity, itemId: string, quantity: number) {
    const cart = await this.requireCart(orgId, identity);
    const item = await this.assertOwnsItem(cart.id, itemId);

    const [product, variant] = await this.loadProductAndVariant(item.productId, item.variantId);
    const availableStock = variant ? variant.stock : (product?.stock ?? 0);
    if (availableStock < quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    return this.getCartOrThrow(orgId, cart.id);
  }

  async removeItem(orgId: string, identity: CartIdentity, itemId: string) {
    const cart = await this.requireCart(orgId, identity);
    await this.assertOwnsItem(cart.id, itemId);
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCartOrThrow(orgId, cart.id);
  }

  async clearCart(orgId: string, identity: CartIdentity) {
    const cart = await this.findCart(orgId, identity);
    if (!cart) return this.emptyCartView(identity.guestToken);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCartOrThrow(orgId, cart.id);
  }

  async applyCoupon(orgId: string, identity: CartIdentity, code: string) {
    const cart = await this.requireCart(orgId, identity);
    const view = await this.toCartView(cart);
    if (view.items.length === 0) {
      throw new BadRequestException('Cannot apply a coupon to an empty cart');
    }
    // Validate against the live subtotal — throws if invalid, expired, below minimum spend, etc.
    await this.couponsService.validateCoupon(orgId, code, view.subtotal, identity.customerId);

    await this.prisma.cart.update({ where: { id: cart.id }, data: { couponCode: code.toUpperCase() } });
    return this.getCartOrThrow(orgId, cart.id);
  }

  async removeCoupon(orgId: string, identity: CartIdentity) {
    const cart = await this.requireCart(orgId, identity);
    await this.prisma.cart.update({ where: { id: cart.id }, data: { couponCode: null } });
    return this.getCartOrThrow(orgId, cart.id);
  }

  /** Merges a guest cart's items into the now-identified customer's cart on login/register, then retires the guest cart. */
  async mergeGuestCartIntoCustomer(orgId: string, customerId: string, guestToken: string) {
    const guestCart = await this.prisma.cart.findUnique({
      where: { organizationId_guestToken: { organizationId: orgId, guestToken } },
      include: { items: true },
    });
    if (!guestCart || guestCart.status !== 'active' || guestCart.items.length === 0) {
      return this.getCart(orgId, { customerId });
    }

    const customerCart = await this.findOrCreateCart(orgId, { customerId });

    for (const item of guestCart.items) {
      const existing = await this.prisma.cartItem.findFirst({
        where: { cartId: customerCart.id, productId: item.productId, variantId: item.variantId ?? null },
      });
      if (existing) {
        await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId: customerCart.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            productName: item.productName,
            sku: item.sku,
            unitPrice: item.unitPrice,
            imageUrl: item.imageUrl,
            variantLabel: item.variantLabel,
          },
        });
      }
    }

    await this.prisma.cart.update({ where: { id: guestCart.id }, data: { status: 'converted' } });

    return this.getCartOrThrow(orgId, customerCart.id);
  }

  // ── internal helpers ─────────────────────────────────────

  private async findCart(orgId: string, identity: CartIdentity) {
    if (identity.customerId) {
      return this.prisma.cart.findFirst({
        where: { organizationId: orgId, customerId: identity.customerId, status: 'active' },
        include: { items: true },
      });
    }
    if (identity.guestToken) {
      return this.prisma.cart.findUnique({
        where: { organizationId_guestToken: { organizationId: orgId, guestToken: identity.guestToken } },
        include: { items: true },
      });
    }
    return null;
  }

  private async requireCart(orgId: string, identity: CartIdentity) {
    const cart = await this.findCart(orgId, identity);
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  private async findOrCreateCart(orgId: string, identity: CartIdentity) {
    const existing = await this.findCart(orgId, identity);
    if (existing) return existing;

    const guestToken = identity.customerId ? undefined : (identity.guestToken ?? randomUUID());
    return this.prisma.cart.create({
      data: {
        organizationId: orgId,
        customerId: identity.customerId,
        guestToken,
      },
      include: { items: true },
    });
  }

  private async assertOwnsItem(cartId: string, itemId: string) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cartId) throw new NotFoundException('Cart item not found');
    return item;
  }

  private async loadProductAndVariant(productId: string, variantId: string | null) {
    const product = await this.prisma.product.findUnique({ where: { id: productId }, include: { variants: true } });
    const variant = variantId ? product?.variants.find((v) => v.id === variantId) : undefined;
    return [product, variant] as const;
  }

  private async getCartOrThrow(orgId: string, cartId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { id: cartId }, include: { items: true } });
    if (!cart) throw new NotFoundException('Cart not found');
    return this.toCartView(cart);
  }

  private emptyCartView(guestToken?: string) {
    return {
      id: null as string | null,
      items: [] as any[],
      subtotal: 0,
      discount: 0,
      total: 0,
      couponCode: null as string | null,
      currencyCode: 'USD',
      guestToken: guestToken ?? null,
    };
  }

  /** Recomputes live pricing for every item and, if a coupon is set, re-validates it — never trusts stored totals. */
  private async toCartView(cart: {
    id: string;
    guestToken: string | null;
    couponCode: string | null;
    currencyCode: string;
    organizationId: string;
    customerId: string | null;
    items: {
      id: string;
      productId: string;
      variantId: string | null;
      quantity: number;
      productName: string;
      sku: string;
      unitPrice: number;
      imageUrl: string | null;
      variantLabel: string | null;
    }[];
  }) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: cart.items.map((i) => i.productId) } },
      include: { variants: true },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    const items = cart.items.map((item) => {
      const product = productById.get(item.productId);
      const variant = item.variantId ? product?.variants.find((v) => v.id === item.variantId) : undefined;
      const livePrice = variant ? variant.price : (product?.price ?? item.unitPrice);
      const availableStock = variant ? variant.stock : (product?.stock ?? 0);
      const isActive = product?.status === 'active';
      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productSlug: product?.slug ?? null,
        quantity: item.quantity,
        productName: item.productName,
        sku: item.sku,
        unitPrice: livePrice,
        priceChanged: livePrice !== item.unitPrice,
        imageUrl: item.imageUrl,
        variantLabel: item.variantLabel,
        lineTotal: livePrice * item.quantity,
        available: isActive && availableStock >= item.quantity,
        availableStock,
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

    let discount = 0;
    let couponCode = cart.couponCode;
    if (couponCode && items.length > 0) {
      try {
        const coupon = await this.couponsService.validateCoupon(
          cart.organizationId,
          couponCode,
          subtotal,
          cart.customerId ?? undefined,
        );
        discount = await this.couponsService.calculateDiscount(coupon, subtotal);
      } catch {
        // Coupon became invalid (expired, deactivated, below minimum spend) — drop it silently.
        await this.prisma.cart.update({ where: { id: cart.id }, data: { couponCode: null } });
        couponCode = null;
      }
    }

    return {
      id: cart.id,
      items,
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount),
      couponCode,
      currencyCode: cart.currencyCode,
      guestToken: cart.guestToken,
    };
  }
}
