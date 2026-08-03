import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { decryptSecret, encryptSecret } from '../../common/crypto.util';
import { UpdateStripeConfigDto } from '../dto';

/**
 * Stripe is configured per-organization (each store connects its own
 * account), never a single platform-wide key — so a client is always built
 * fresh from the org's current, decrypted secret key rather than cached at
 * boot, mirroring how upload.service.ts re-reads its provider config on
 * every call instead of holding a stale instance.
 */
@Injectable()
export class StripeService {
  constructor(private prisma: PrismaService) {}

  private async getOrgStripeConfig(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        stripeEnabled: true,
        stripeSecretKey: true,
        stripeWebhookSecret: true,
      },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  /** Redacted shape for the org-admin settings page — secrets are never sent to the browser, only whether one is set. */
  async getSettings(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        stripeEnabled: true,
        stripeTestMode: true,
        stripePublishableKey: true,
        stripeSecretKey: true,
        stripeWebhookSecret: true,
      },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return {
      stripeEnabled: org.stripeEnabled,
      stripeTestMode: org.stripeTestMode,
      stripePublishableKey: org.stripePublishableKey,
      secretKeyConfigured: !!org.stripeSecretKey,
      webhookSecretConfigured: !!org.stripeWebhookSecret,
    };
  }

  async updateSettings(organizationId: string, dto: UpdateStripeConfigDto) {
    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(dto.stripeEnabled !== undefined && { stripeEnabled: dto.stripeEnabled }),
        ...(dto.stripeTestMode !== undefined && { stripeTestMode: dto.stripeTestMode }),
        ...(dto.stripePublishableKey !== undefined && { stripePublishableKey: dto.stripePublishableKey }),
        ...(dto.stripeSecretKey && { stripeSecretKey: encryptSecret(dto.stripeSecretKey) }),
        ...(dto.stripeWebhookSecret && { stripeWebhookSecret: encryptSecret(dto.stripeWebhookSecret) }),
      },
    });
    return this.getSettings(organizationId);
  }

  private async getClient(organizationId: string): Promise<Stripe> {
    const org = await this.getOrgStripeConfig(organizationId);
    if (!org.stripeEnabled || !org.stripeSecretKey) {
      throw new BadRequestException('Stripe is not configured for this store');
    }
    const secretKey = decryptSecret(org.stripeSecretKey);
    return new Stripe(secretKey);
  }

  async createPaymentIntent(
    organizationId: string,
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<Stripe.PaymentIntent> {
    const client = await this.getClient(organizationId);
    return client.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: { enabled: true },
    });
  }

  async retrievePaymentIntent(organizationId: string, paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    const client = await this.getClient(organizationId);
    return client.paymentIntents.retrieve(paymentIntentId);
  }

  /** Cheap, read-only call to confirm a secret key is live — used by the settings page's "Test Connection" button. */
  async testConnection(organizationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const client = await this.getClient(organizationId);
      const balance = await client.balance.retrieve();
      const available = balance.available.map((b) => `${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`).join(', ');
      return { success: true, message: `Connected. Available balance: ${available || '0.00'}` };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Could not connect to Stripe' };
    }
  }

  /** Real Stripe signature verification (replaces the old hand-rolled HMAC check) — throws if invalid. */
  async verifyWebhookSignature(
    organizationId: string,
    rawBody: Buffer,
    signatureHeader: string,
  ): Promise<Stripe.Event> {
    const org = await this.getOrgStripeConfig(organizationId);
    if (!org.stripeWebhookSecret) {
      throw new BadRequestException('Webhook secret is not configured for this store');
    }
    const webhookSecret = decryptSecret(org.stripeWebhookSecret);
    // Signature verification is pure local HMAC comparison against the
    // webhook secret — Stripe.webhooks is a static utility, no API key/client
    // instance needed (and none should be constructed just for this).
    return Stripe.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret);
  }
}
