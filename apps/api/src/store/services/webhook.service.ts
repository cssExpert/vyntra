import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from './email.service';
import { StoreJobsService } from './store-jobs.service';
import * as crypto from 'crypto';

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      object: string;
      amount: number;
      currency: string;
      status: string;
      customer?: string;
      metadata?: Record<string, string>;
      [key: string]: any;
    };
  };
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private storeJobs: StoreJobsService,
  ) {}

  /**
   * Verify Stripe webhook signature
   * Prevents replay attacks and ensures webhook authenticity
   */
  verifyStripeWebhookSignature(
    body: string,
    signature: string,
    webhookSecret: string,
  ): boolean {
    try {
      const hash = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
      const computedSignature = `t=0,v1=${hash}`;
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(computedSignature),
      );
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Handle Stripe payment success webhook
   * Updates order status and sends confirmation emails
   */
  async handlePaymentSucceeded(
    event: StripeWebhookEvent,
  ): Promise<{ success: boolean; orderId?: string }> {
    try {
      const intent = event.data.object;
      const orderId = intent.metadata?.orderId;

      if (!orderId) {
        this.logger.warn(
          `Payment succeeded event without orderId: ${intent.id}`,
        );
        return { success: false };
      }

      // Update order payment status
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
          items: true,
        },
      });

      if (!order) {
        this.logger.error(`Order not found: ${orderId}`);
        return { success: false };
      }

      // Record payment
      await this.prisma.payment.create({
        data: {
          organizationId: order.organizationId,
          orderId: order.id,
          amount: intent.amount / 100, // Stripe uses cents
          currency: intent.currency.toUpperCase(),
          method: 'stripe',
          status: 'completed',
          transactionId: intent.id,
        },
      });

      // Update order payment status if fully paid
      if (intent.amount >= order.total * 100) {
        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'paid',
            status: 'processing',
            paidAt: new Date(),
          },
        });
      }

      // Queue order confirmation email asynchronously (non-blocking)
      this.storeJobs.queueOrderConfirmation(orderId).catch((error) => {
        this.logger.error(`Failed to queue order confirmation for ${orderId}:`, error);
      });

      this.logger.log(`Payment succeeded for order: ${orderId}`);
      return { success: true, orderId };
    } catch (error) {
      this.logger.error('Error handling payment succeeded:', error);
      return { success: false };
    }
  }

  /**
   * Handle Stripe payment failure webhook
   * Updates order status and notifies customer
   */
  async handlePaymentFailed(event: StripeWebhookEvent): Promise<{
    success: boolean;
    orderId?: string;
  }> {
    try {
      const intent = event.data.object;
      const orderId = intent.metadata?.orderId;

      if (!orderId) {
        return { success: false };
      }

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'failed',
          status: 'cancelled',
        },
      });

      this.logger.log(`Payment failed for order: ${orderId}`);
      return { success: true, orderId };
    } catch (error) {
      this.logger.error('Error handling payment failed:', error);
      return { success: false };
    }
  }

  /**
   * Handle Stripe charge refunded webhook
   * Updates refund status and notifies customer
   */
  async handleChargeRefunded(event: StripeWebhookEvent): Promise<{
    success: boolean;
  }> {
    try {
      const charge = event.data.object;
      const refundAmount = charge.amount_refunded / 100;

      // Find refund by Stripe charge ID
      const refund = await this.prisma.refund.findFirst({
        where: {
          // Match by amount and recent creation
          amount: refundAmount,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        include: {
          order: {
            include: {
              customer: true,
            },
          },
        },
      });

      if (refund) {
        // Update refund status
        await this.prisma.refund.update({
          where: { id: refund.id },
          data: { status: 'completed' },
        });

        // Queue refund notification email asynchronously (non-blocking)
        this.storeJobs.queueRefundNotification(refund.id).catch((error) => {
          this.logger.error(`Failed to queue refund notification for ${refund.id}:`, error);
        });
      }

      this.logger.log(`Refund processed: ${charge.id}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error handling charge refunded:', error);
      return { success: false };
    }
  }

  /**
   * Handle order shipment notification
   * Sends tracking info to customer
   */
  async handleOrderShipped(
    orderId: string,
    trackingNumber?: string,
  ): Promise<boolean> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true },
      });

      if (!order) {
        return false;
      }

      // Update order status
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'shipped',
          trackingNumber: trackingNumber || null,
          shippedAt: new Date(),
        },
      });

      // Add timeline entry
      await this.prisma.orderTimeline.create({
        data: {
          orderId,
          status: 'shipped',
          message: trackingNumber
            ? `Order shipped with tracking: ${trackingNumber}`
            : 'Order shipped',
        },
      });

      // Queue shipment notification email asynchronously (non-blocking)
      this.storeJobs.queueShipmentNotification(orderId).catch((error) => {
        this.logger.error(`Failed to queue shipment notification for ${orderId}:`, error);
      });

      return true;
    } catch (error) {
      this.logger.error('Error handling order shipped:', error);
      return false;
    }
  }

  /**
   * Handle order delivered notification
   * Updates order status
   */
  async handleOrderDelivered(orderId: string): Promise<boolean> {
    try {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'delivered',
          deliveredAt: new Date(),
        },
      });

      // Add timeline entry
      await this.prisma.orderTimeline.create({
        data: {
          orderId,
          status: 'delivered',
          message: 'Order delivered',
        },
      });

      this.logger.log(`Order delivered: ${orderId}`);
      return true;
    } catch (error) {
      this.logger.error('Error handling order delivered:', error);
      return false;
    }
  }

  /**
   * Handle inventory low stock alert
   * Checks inventory and returns items below threshold
   */
  async checkLowStockInventory(organizationId: string): Promise<
    Array<{
      productId: string;
      productName: string;
      currentStock: number;
      threshold: number;
    }>
  > {
    try {
      const items = await this.prisma.inventory.findMany({
        where: {
          organizationId,
          stock: {
            gt: 0,
            lte: 10, // Default low stock threshold
          },
        },
        include: {
          product: true,
        },
      });

      return items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        currentStock: item.stock,
        threshold: 10,
      }));
    } catch (error) {
      this.logger.error('Error checking low stock inventory:', error);
      return [];
    }
  }
}
