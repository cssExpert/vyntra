import { Injectable, Logger } from '@nestjs/common';
import { JobQueueService } from './job-queue.service';
import { EmailService } from './email.service';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * StoreJobsService - Define and manage async jobs for store operations
 * Jobs run in background and support retry logic
 */
@Injectable()
export class StoreJobsService {
  private readonly logger = new Logger(StoreJobsService.name);

  constructor(
    private jobQueue: JobQueueService,
    private emailService: EmailService,
    private analyticsService: AnalyticsService,
    private prisma: PrismaService,
  ) {
    this.registerJobs();
  }

  /**
   * Register all job handlers
   */
  private registerJobs(): void {
    // Email jobs
    this.jobQueue.defineJob(
      'send-order-confirmation',
      this.handleSendOrderConfirmation.bind(this),
    );
    this.jobQueue.defineJob(
      'send-shipment-notification',
      this.handleSendShipmentNotification.bind(this),
    );
    this.jobQueue.defineJob(
      'send-refund-notification',
      this.handleSendRefundNotification.bind(this),
    );
    this.jobQueue.defineJob(
      'send-credit-alert',
      this.handleSendCreditAlert.bind(this),
    );
    this.jobQueue.defineJob(
      'send-batch-emails',
      this.handleSendBatchEmails.bind(this),
    );

    // Analytics jobs
    this.jobQueue.defineJob(
      'calculate-customer-metrics',
      this.handleCalculateCustomerMetrics.bind(this),
    );
    this.jobQueue.defineJob(
      'recalculate-inventory-value',
      this.handleRecalculateInventoryValue.bind(this),
    );
    this.jobQueue.defineJob(
      'generate-daily-report',
      this.handleGenerateDailyReport.bind(this),
    );

    // Order jobs
    this.jobQueue.defineJob(
      'process-order-cancellation',
      this.handleProcessOrderCancellation.bind(this),
    );
    this.jobQueue.defineJob(
      'reconcile-inventory',
      this.handleReconcileInventory.bind(this),
    );

    // Cleanup jobs
    this.jobQueue.defineJob(
      'cleanup-old-jobs',
      this.handleCleanupOldJobs.bind(this),
    );

    this.logger.log('✅ All job handlers registered');
  }

  // ─────────────────────────────────────────────────────────────────
  //  Email Jobs
  // ─────────────────────────────────────────────────────────────────

  private async handleSendOrderConfirmation(data: any): Promise<void> {
    this.logger.log(`Sending order confirmation for order: ${data.orderId}`);

    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
      include: { customer: true, items: true },
    });

    if (!order) {
      throw new Error(`Order not found: ${data.orderId}`);
    }

    await this.emailService.sendOrderConfirmation({
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      orderNumber: order.orderNumber,
      orderTotal: order.total,
      orderDate: order.createdAt.toLocaleDateString(),
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
    });
  }

  private async handleSendShipmentNotification(data: any): Promise<void> {
    this.logger.log(`Sending shipment notification for order: ${data.orderId}`);

    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
      include: { customer: true },
    });

    if (!order) {
      throw new Error(`Order not found: ${data.orderId}`);
    }

    await this.emailService.sendOrderShipped(
      order.customer.email,
      order.customer.name,
      order.orderNumber,
      order.trackingNumber || undefined,
    );
  }

  private async handleSendRefundNotification(data: any): Promise<void> {
    this.logger.log(`Sending refund notification for refund: ${data.refundId}`);

    const refund = await this.prisma.refund.findUnique({
      where: { id: data.refundId },
      include: { order: { include: { customer: true } } },
    });

    if (!refund) {
      throw new Error(`Refund not found: ${data.refundId}`);
    }

    await this.emailService.sendRefundNotification(
      refund.order.customer.email,
      refund.order.customer.name,
      refund.order.orderNumber,
      refund.amount,
    );
  }

  private async handleSendCreditAlert(data: any): Promise<void> {
    this.logger.log(`Sending credit alert for customer: ${data.customerId}`);

    const customer = await this.prisma.storeCustomer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      throw new Error(`Customer not found: ${data.customerId}`);
    }

    await this.emailService.sendCreditAlert(
      customer.email,
      customer.name,
      data.amount,
    );
  }

  private async handleSendBatchEmails(data: any): Promise<void> {
    this.logger.log(`Sending batch emails to ${data.recipientCount} recipients`);

    // Process recipients in batches of 100
    for (let i = 0; i < data.recipients.length; i += 100) {
      const batch = data.recipients.slice(i, i + 100);

      for (const recipient of batch) {
        try {
          await this.emailService.sendOrderConfirmation(recipient);
        } catch (error) {
          this.logger.error(`Failed to send email to ${recipient.email}`, error);
        }
      }

      // Add delay between batches
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.logger.log('Batch email sending completed');
  }

  // ─────────────────────────────────────────────────────────────────
  //  Analytics Jobs
  // ─────────────────────────────────────────────────────────────────

  private async handleCalculateCustomerMetrics(data: any): Promise<void> {
    this.logger.log(
      `Calculating metrics for customer: ${data.customerId}`,
    );

    await this.analyticsService.getCustomerMetrics(data.organizationId);

    this.logger.log('Customer metrics calculated');
  }

  private async handleRecalculateInventoryValue(data: any): Promise<void> {
    this.logger.log(
      `Recalculating inventory value for org: ${data.organizationId}`,
    );

    await this.analyticsService.getInventoryMetrics(data.organizationId);

    this.logger.log('Inventory value recalculated');
  }

  private async handleGenerateDailyReport(data: any): Promise<void> {
    this.logger.log(
      `Generating daily report for org: ${data.organizationId}`,
    );

    const [sales, customers, inventory] = await Promise.all([
      this.analyticsService.getSalesMetrics(data.organizationId),
      this.analyticsService.getCustomerMetrics(data.organizationId),
      this.analyticsService.getInventoryMetrics(data.organizationId),
    ]);

    this.logger.log('Daily report generated', {
      sales,
      customers,
      inventory,
    });
  }

  // ─────────────────────────────────────────────────────────────────
  //  Order Jobs
  // ─────────────────────────────────────────────────────────────────

  private async handleProcessOrderCancellation(data: any): Promise<void> {
    this.logger.log(`Processing order cancellation: ${data.orderId}`);

    await this.prisma.order.update({
      where: { id: data.orderId },
      data: { status: 'cancelled' },
    });

    // Restore inventory for all items
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
      include: { items: true },
    });

    if (order) {
      for (const item of order.items) {
        await this.prisma.inventory.update({
          where: {
            organizationId_productId_variantId: {
              organizationId: order.organizationId,
              productId: item.productId,
              variantId: item.variantId || (null as any),
            },
          },
          data: {
            stock: { increment: item.quantity },
          },
        });
      }
    }

    this.logger.log('Order cancellation processed');
  }

  private async handleReconcileInventory(data: any): Promise<void> {
    this.logger.log(`Reconciling inventory for org: ${data.organizationId}`);

    // Sync inventory counts from actual product records
    const products = await this.prisma.product.findMany({
      where: { organizationId: data.organizationId },
    });

    for (const product of products) {
      await this.prisma.inventory.upsert({
        where: {
          organizationId_productId_variantId: {
            organizationId: data.organizationId,
            productId: product.id,
            variantId: null as any,
          },
        },
        create: {
          organizationId: data.organizationId,
          productId: product.id,
          stock: product.stock,
        },
        update: {
          stock: product.stock,
        },
      });
    }

    this.logger.log('Inventory reconciliation completed');
  }

  // ─────────────────────────────────────────────────────────────────
  //  Cleanup Jobs
  // ─────────────────────────────────────────────────────────────────

  private async handleCleanupOldJobs(data: any): Promise<void> {
    this.logger.log('Cleaning up old jobs');

    // This would integrate with Bull or another queue system
    // For now, just log the operation
    this.logger.log('Old jobs cleanup completed');
  }

  // ─────────────────────────────────────────────────────────────────
  //  Job Enqueuing Methods (called from other services)
  // ─────────────────────────────────────────────────────────────────

  async queueOrderConfirmation(orderId: string): Promise<string> {
    return this.jobQueue.enqueue('send-order-confirmation', { orderId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  async queueShipmentNotification(orderId: string): Promise<string> {
    return this.jobQueue.enqueue('send-shipment-notification', { orderId });
  }

  async queueRefundNotification(refundId: string): Promise<string> {
    return this.jobQueue.enqueue('send-refund-notification', { refundId });
  }

  async queueCreditAlert(customerId: string): Promise<string> {
    return this.jobQueue.enqueue('send-credit-alert', { customerId });
  }

  async queueBatchEmails(recipients: any[]): Promise<string> {
    return this.jobQueue.enqueue('send-batch-emails', {
      recipients,
      recipientCount: recipients.length,
    });
  }

  async queueInventoryReconciliation(organizationId: string): Promise<string> {
    return this.jobQueue.enqueue('reconcile-inventory', { organizationId });
  }

  async queueDailyReport(organizationId: string): Promise<string> {
    return this.jobQueue.enqueue('generate-daily-report', { organizationId }, {
      delay: 60000, // Run 1 minute from now
    });
  }

  async queueCalculateCustomerMetrics(organizationId: string, customerId: string): Promise<string> {
    return this.jobQueue.enqueue('calculate-customer-metrics', { organizationId, customerId });
  }

  async queueCleanupOldJobs(): Promise<string> {
    return this.jobQueue.enqueue('cleanup-old-jobs', {});
  }
}
