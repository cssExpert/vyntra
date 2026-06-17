import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderTotal: number;
  orderDate: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: {
    line1: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  async sendOrderConfirmation(order: OrderEmailData): Promise<boolean> {
    try {
      const html = this.generateOrderConfirmationHtml(order);

      await this.sendEmail({
        to: order.customerEmail,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html,
        text: this.generateOrderConfirmationText(order),
      });

      this.logger.log(`Order confirmation sent to ${order.customerEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send order confirmation: ${error}`);
      return false;
    }
  }

  async sendOrderShipped(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    trackingNumber?: string,
  ): Promise<boolean> {
    try {
      const html = this.generateOrderShippedHtml(
        customerName,
        orderNumber,
        trackingNumber,
      );

      await this.sendEmail({
        to: customerEmail,
        subject: `Your Order ${orderNumber} Has Shipped!`,
        html,
      });

      this.logger.log(`Shipment notification sent to ${customerEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send shipment notification: ${error}`);
      return false;
    }
  }

  async sendRefundNotification(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    refundAmount: number,
  ): Promise<boolean> {
    try {
      const html = this.generateRefundNotificationHtml(
        customerName,
        orderNumber,
        refundAmount,
      );

      await this.sendEmail({
        to: customerEmail,
        subject: `Refund Processed - Order ${orderNumber}`,
        html,
      });

      this.logger.log(`Refund notification sent to ${customerEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send refund notification: ${error}`);
      return false;
    }
  }

  async sendCreditAlert(
    customerEmail: string,
    customerName: string,
    creditAmount: number,
  ): Promise<boolean> {
    try {
      const html = this.generateCreditAlertHtml(customerName, creditAmount);

      await this.sendEmail({
        to: customerEmail,
        subject: `Store Credit Added to Your Account`,
        html,
      });

      this.logger.log(`Credit alert sent to ${customerEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send credit alert: ${error}`);
      return false;
    }
  }

  async sendRewardPointsNotification(
    customerEmail: string,
    customerName: string,
    points: number,
    newBalance: number,
  ): Promise<boolean> {
    try {
      const html = this.generateRewardPointsHtml(
        customerName,
        points,
        newBalance,
      );

      await this.sendEmail({
        to: customerEmail,
        subject: `You Earned ${points} Reward Points!`,
        html,
      });

      this.logger.log(`Reward points notification sent to ${customerEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send reward points notification: ${error}`);
      return false;
    }
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    const provider = this.configService.get('EMAIL_PROVIDER') || 'smtp';

    switch (provider) {
      case 'sendgrid':
        await this.sendViasendGrid(options);
        break;
      case 'mailgun':
        await this.sendViaMailgun(options);
        break;
      case 'smtp':
      default:
        await this.sendViaSMTP(options);
        break;
    }
  }

  private async sendViaSMTP(options: EmailOptions): Promise<void> {
    // TODO: Implement with nodemailer
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`Email to ${options.to}: ${options.subject}`);
    }
  }

  private async sendViasendGrid(options: EmailOptions): Promise<void> {
    // TODO: Implement sendgrid integration
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
    // await sgMail.send(options);
  }

  private async sendViaMailgun(options: EmailOptions): Promise<void> {
    // TODO: Implement mailgun integration
  }

  private generateOrderConfirmationHtml(order: OrderEmailData): string {
    const itemsHtml = order.items
      .map(
        (item) =>
          `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>
    `,
      )
      .join('');

    const shippingHtml = order.shippingAddress
      ? `
      <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
        <h3>Shipping Address</h3>
        <p>${order.shippingAddress.line1}<br/>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br/>
        ${order.shippingAddress.country}</p>
      </div>
    `
      : '';

    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2c3e50;">Thank You for Your Order!</h1>

            <p>Hi ${order.customerName},</p>
            <p>Your order <strong>${order.orderNumber}</strong> has been confirmed. Here's a summary:</p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead style="background-color: #f5f5f5;">
                <tr>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="text-align: right; font-size: 18px; font-weight: bold; padding: 20px 0; border-top: 2px solid #ddd;">
              <p>Order Total: <span style="color: #27ae60;">$${order.orderTotal.toFixed(2)}</span></p>
            </div>

            ${shippingHtml}

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p>Order Date: ${order.orderDate}</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateOrderConfirmationText(order: OrderEmailData): string {
    const itemsText = order.items
      .map(
        (item) =>
          `${item.productName} x${item.quantity} - $${item.price.toFixed(2)}`,
      )
      .join('\n');

    return `
Thank you for your order!

Order Number: ${order.orderNumber}
Order Date: ${order.orderDate}

Items:
${itemsText}

Order Total: $${order.orderTotal.toFixed(2)}

If you have any questions, please contact our support team.
    `;
  }

  private generateOrderShippedHtml(
    customerName: string,
    orderNumber: string,
    trackingNumber?: string,
  ): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="color: #27ae60;">Your Order is On the Way!</h1>

            <p>Hi ${customerName},</p>
            <p>Your order <strong>${orderNumber}</strong> has been shipped!</p>

            ${
              trackingNumber
                ? `<p>Tracking Number: <strong>${trackingNumber}</strong></p>`
                : ''
            }

            <p>You can track your package using the tracking number above.</p>
          </div>
        </body>
      </html>
    `;
  }

  private generateRefundNotificationHtml(
    customerName: string,
    orderNumber: string,
    refundAmount: number,
  ): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="color: #e74c3c;">Refund Processed</h1>

            <p>Hi ${customerName},</p>
            <p>A refund of <strong>$${refundAmount.toFixed(2)}</strong> for order <strong>${orderNumber}</strong> has been processed.</p>
            <p>The refund should appear in your account within 3-5 business days.</p>
          </div>
        </body>
      </html>
    `;
  }

  private generateCreditAlertHtml(
    customerName: string,
    creditAmount: number,
  ): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="color: #27ae60;">Store Credit Added!</h1>

            <p>Hi ${customerName},</p>
            <p><strong>$${creditAmount.toFixed(2)}</strong> store credit has been added to your account.</p>
            <p>You can use this credit towards your next purchase.</p>
          </div>
        </body>
      </html>
    `;
  }

  private generateRewardPointsHtml(
    customerName: string,
    points: number,
    newBalance: number,
  ): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f39c12;">Reward Points Earned!</h1>

            <p>Hi ${customerName},</p>
            <p>You've earned <strong>${points}</strong> reward points!</p>
            <p>Your new balance: <strong>${newBalance}</strong> points</p>
            <p>Keep earning and redeem your points for exclusive rewards!</p>
          </div>
        </body>
      </html>
    `;
  }
}
