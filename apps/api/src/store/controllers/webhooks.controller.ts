import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookService } from '../services/webhook.service';
import { OrdersService } from '../services/orders.service';
import { EmailService } from '../services/email.service';

@Controller('store/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private webhookService: WebhookService,
    private ordersService: OrdersService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Stripe webhook handler
   * Processes payment events from Stripe
   */
  @Post('stripe')
  async handleStripeWebhook(
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }

    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      this.logger.error('Stripe webhook secret not configured');
      throw new BadRequestException('Webhook not configured');
    }

    // Verify webhook signature
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    const isValid = this.webhookService.verifyStripeWebhookSignature(
      bodyString,
      signature,
      webhookSecret,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = typeof body === 'string' ? JSON.parse(body) : body;

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.webhookService.handlePaymentSucceeded(event);
          break;

        case 'payment_intent.payment_failed':
          await this.webhookService.handlePaymentFailed(event);
          break;

        case 'charge.refunded':
          await this.webhookService.handleChargeRefunded(event);
          break;

        default:
          this.logger.debug(`Unhandled Stripe event: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`Error processing Stripe webhook: ${error}`);
      throw new BadRequestException('Webhook processing failed');
    }
  }

  /**
   * Shipment webhook handler
   * Processes shipment tracking updates from fulfillment services
   */
  @Post('shipment')
  async handleShipmentWebhook(
    @Body()
    data: {
      orderId: string;
      trackingNumber?: string;
      carrier?: string;
    },
  ) {
    if (!data.orderId) {
      throw new BadRequestException('Missing orderId');
    }

    try {
      const success = await this.webhookService.handleOrderShipped(
        data.orderId,
        data.trackingNumber,
      );

      if (!success) {
        throw new BadRequestException('Failed to update order');
      }

      return { received: true, orderId: data.orderId };
    } catch (error) {
      this.logger.error(`Error processing shipment webhook: ${error}`);
      throw new BadRequestException('Webhook processing failed');
    }
  }

  /**
   * Delivery webhook handler
   * Processes delivery confirmations
   */
  @Post('delivery')
  async handleDeliveryWebhook(
    @Body()
    data: {
      orderId: string;
      deliveredAt?: string;
    },
  ) {
    if (!data.orderId) {
      throw new BadRequestException('Missing orderId');
    }

    try {
      const success = await this.webhookService.handleOrderDelivered(
        data.orderId,
      );

      if (!success) {
        throw new BadRequestException('Failed to update order');
      }

      return { received: true, orderId: data.orderId };
    } catch (error) {
      this.logger.error(`Error processing delivery webhook: ${error}`);
      throw new BadRequestException('Webhook processing failed');
    }
  }

  /**
   * Inventory alert webhook
   * Checks for low stock items
   */
  @Post('inventory-check/:organizationId')
  async checkInventory(@Body() _body: any, @Body('organizationId') orgId: string) {
    if (!orgId) {
      throw new BadRequestException('Missing organizationId');
    }

    try {
      const lowStockItems =
        await this.webhookService.checkLowStockInventory(orgId);

      return {
        received: true,
        lowStockItems,
        itemCount: lowStockItems.length,
      };
    } catch (error) {
      this.logger.error(`Error checking inventory: ${error}`);
      throw new BadRequestException('Inventory check failed');
    }
  }

  /**
   * Test webhook endpoint
   * Allows testing webhook integration without actual payment
   */
  @Post('test')
  async testWebhook(
    @Body()
    data: {
      type:
        | 'payment_succeeded'
        | 'shipment_notified'
        | 'delivery_confirmed';
      orderId: string;
      organizationId: string;
    },
  ) {
    if (!data.orderId || !data.organizationId) {
      throw new BadRequestException('Missing required fields');
    }

    try {
      let result: any = { received: true };

      switch (data.type) {
        case 'payment_succeeded':
          // Simulate payment success
          const order = await this.ordersService.findById(
            data.organizationId,
            data.orderId,
          );
          result.message = `Payment test for order ${order.orderNumber}`;
          break;

        case 'shipment_notified':
          await this.webhookService.handleOrderShipped(data.orderId);
          result.message = `Shipment notification test for order ${data.orderId}`;
          break;

        case 'delivery_confirmed':
          await this.webhookService.handleOrderDelivered(data.orderId);
          result.message = `Delivery confirmation test for order ${data.orderId}`;
          break;

        default:
          throw new BadRequestException('Invalid webhook type');
      }

      return result;
    } catch (error) {
      this.logger.error(`Error in test webhook: ${error}`);
      throw new BadRequestException('Test webhook failed');
    }
  }
}
