import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StoreJobsService } from './store-jobs.service';

/**
 * StoreSchedulerService - Schedule recurring jobs for store operations
 * Simple implementation without external dependencies
 * Ready to upgrade to @nestjs/schedule when needed
 */
@Injectable()
export class StoreSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(StoreSchedulerService.name);
  private scheduledTasks: Map<string, NodeJS.Timer> = new Map();

  constructor(
    private prisma: PrismaService,
    private storeJobs: StoreJobsService,
  ) {}

  /**
   * Initialize scheduler on module startup
   */
  onModuleInit(): void {
    this.logger.log('Initializing Store scheduler service');
    this.scheduleJobs();
  }

  /**
   * Schedule all recurring jobs
   */
  private scheduleJobs(): void {
    // Generate daily reports at 1:00 AM
    this.scheduleDaily('dailyReports', 1, 0, () => this.generateDailyReports());

    // Reconcile inventory at 2:00 AM
    this.scheduleDaily('inventoryReconciliation', 2, 0, () => this.reconcileInventory());

    // Sync customer metrics at 4:00 AM
    this.scheduleDaily('customerMetrics', 4, 0, () => this.syncCustomerMetrics());

    // Update customer segments at 5:00 AM
    this.scheduleDaily('customerSegments', 5, 0, () => this.updateCustomerSegments());

    // Check low stock every 6 hours
    this.scheduleInterval('lowStockCheck', 6 * 60 * 60 * 1000, () => this.checkLowStockAlerts());

    // Clean up old jobs every Sunday at 3:00 AM
    this.scheduleWeekly('cleanupJobs', 0, 3, 0, () => this.cleanupOldJobs());

    this.logger.log('Store scheduler initialized with all recurring jobs');
  }

  /**
   * Schedule a task to run daily at a specific time
   */
  private scheduleDaily(
    taskName: string,
    hour: number,
    minute: number,
    task: () => Promise<void>,
  ): void {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If scheduled time has passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    // Initial timeout to run at the exact time
    const timeout = setTimeout(() => {
      this.executeTask(taskName, task);
      // Then run every 24 hours
      const interval = setInterval(() => this.executeTask(taskName, task), 24 * 60 * 60 * 1000);
      this.scheduledTasks.set(`${taskName}_interval`, interval);
    }, delay);

    this.scheduledTasks.set(taskName, timeout);
    this.logger.log(`Scheduled daily task "${taskName}" for ${scheduledTime.toLocaleString()}`);
  }

  /**
   * Schedule a task to run at regular intervals
   */
  private scheduleInterval(
    taskName: string,
    intervalMs: number,
    task: () => Promise<void>,
  ): void {
    const interval = setInterval(() => this.executeTask(taskName, task), intervalMs);
    this.scheduledTasks.set(taskName, interval);
    this.logger.log(`Scheduled interval task "${taskName}" every ${intervalMs / 1000} seconds`);
  }

  /**
   * Schedule a task to run weekly on a specific day and time
   * dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
   */
  private scheduleWeekly(
    taskName: string,
    dayOfWeek: number,
    hour: number,
    minute: number,
    task: () => Promise<void>,
  ): void {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // Calculate days until next occurrence
    const currentDay = scheduledTime.getDay();
    let daysUntilNext = dayOfWeek - currentDay;
    if (daysUntilNext < 0 || (daysUntilNext === 0 && scheduledTime < now)) {
      daysUntilNext += 7;
    }

    scheduledTime.setDate(scheduledTime.getDate() + daysUntilNext);
    const delay = scheduledTime.getTime() - now.getTime();

    // Initial timeout to run at the exact time
    const timeout = setTimeout(() => {
      this.executeTask(taskName, task);
      // Then run every week
      const interval = setInterval(() => this.executeTask(taskName, task), 7 * 24 * 60 * 60 * 1000);
      this.scheduledTasks.set(`${taskName}_interval`, interval);
    }, delay);

    this.scheduledTasks.set(taskName, timeout);
    this.logger.log(`Scheduled weekly task "${taskName}" for ${scheduledTime.toLocaleString()}`);
  }

  /**
   * Execute a task with error handling
   */
  private async executeTask(taskName: string, task: () => Promise<void>): Promise<void> {
    this.logger.log(`Executing scheduled task: ${taskName}`);
    try {
      await task();
      this.logger.log(`Completed scheduled task: ${taskName}`);
    } catch (error) {
      this.logger.error(`Error in scheduled task "${taskName}":`, error);
    }
  }

  /**
   * Generate daily reports for all organizations
   * Runs every day at 1:00 AM
   */
  async generateDailyReports(): Promise<void> {
    this.logger.log('Starting daily report generation for all organizations');

    try {
      const organizations = await this.prisma.organization.findMany({
        where: { isActive: true },
      });

      for (const org of organizations) {
        await this.storeJobs.queueDailyReport(org.id);
        this.logger.log(`Queued daily report for organization: ${org.id}`);
      }

      this.logger.log(`Daily report generation completed for ${organizations.length} organizations`);
    } catch (error) {
      this.logger.error('Error generating daily reports:', error);
    }
  }

  /**
   * Reconcile inventory for all organizations
   * Runs every day at 2:00 AM
   */
  async reconcileInventory(): Promise<void> {
    this.logger.log('Starting inventory reconciliation for all organizations');

    try {
      const organizations = await this.prisma.organization.findMany({
        where: { isActive: true },
      });

      for (const org of organizations) {
        await this.storeJobs.queueInventoryReconciliation(org.id);
        this.logger.log(`Queued inventory reconciliation for organization: ${org.id}`);
      }

      this.logger.log(`Inventory reconciliation completed for ${organizations.length} organizations`);
    } catch (error) {
      this.logger.error('Error reconciling inventory:', error);
    }
  }

  /**
   * Clean up old jobs from the queue
   * Runs every Sunday at 3:00 AM
   */
  async cleanupOldJobs(): Promise<void> {
    this.logger.log('Starting cleanup of old jobs');

    try {
      // Queue cleanup job (implementation in store-jobs.service)
      await this.storeJobs.queueCleanupOldJobs();
      this.logger.log('Cleanup job queued successfully');
    } catch (error) {
      this.logger.error('Error queuing cleanup job:', error);
    }
  }

  /**
   * Sync customer metrics and LTV calculations
   * Runs every day at 4:00 AM
   */
  /**
   * Sync customer metrics and LTV calculations
   * Runs every day at 4:00 AM
   */
  async syncCustomerMetrics(): Promise<void> {
    this.logger.log('Starting customer metrics synchronization');

    try {
      const organizations = await this.prisma.organization.findMany({
        where: { isActive: true },
      });

      for (const org of organizations) {
        // Queue customer metrics calculation for each organization
        const customers = await this.prisma.storeCustomer.findMany({
          where: { organizationId: org.id },
          select: { id: true },
        });

        for (const customer of customers) {
          // In production, batch these instead of queueing individually
          await this.storeJobs.queueCalculateCustomerMetrics(org.id, customer.id);
        }

        this.logger.log(`Queued customer metrics sync for ${customers.length} customers in org: ${org.id}`);
      }

      this.logger.log(`Customer metrics synchronization completed`);
    } catch (error) {
      this.logger.error('Error syncing customer metrics:', error);
    }
  }

  /**
   * Check for low stock and send alerts
   * Runs every 6 hours
   */
  /**
   * Check for low stock and send alerts
   * Runs every 6 hours
   */
  async checkLowStockAlerts(): Promise<void> {
    this.logger.log('Checking for low stock items');

    try {
      const organizations = await this.prisma.organization.findMany({
        where: { isActive: true },
      });

      for (const org of organizations) {
        // Find low stock items (stock <= 10)
        const lowStockItems = await this.prisma.inventory.findMany({
          where: {
            organizationId: org.id,
            stock: {
              gt: 0,
              lte: 10,
            },
          },
          include: {
            product: true,
          },
        });

        if (lowStockItems.length > 0) {
          this.logger.warn(`Found ${lowStockItems.length} low stock items in org: ${org.id}`, {
            items: lowStockItems.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              stock: item.stock,
            })),
          });

          // Could queue a notification job here
          // await this.storeJobs.queueLowStockAlert(org.id, lowStockItems);
        }
      }

      this.logger.log('Low stock check completed');
    } catch (error) {
      this.logger.error('Error checking low stock:', error);
    }
  }

  /**
   * Update customer segments based on purchase behavior
   * Runs every day at 5:00 AM
   */
  /**
   * Update customer segments based on purchase behavior
   * Runs every day at 5:00 AM
   */
  async updateCustomerSegments(): Promise<void> {
    this.logger.log('Starting customer segment updates');

    try {
      const organizations = await this.prisma.organization.findMany({
        where: { isActive: true },
      });

      for (const org of organizations) {
        await this.updateOrganizationSegments(org.id);
      }

      this.logger.log('Customer segment updates completed');
    } catch (error) {
      this.logger.error('Error updating customer segments:', error);
    }
  }

  /**
   * Update customer segments for a specific organization
   * Based on purchase history and LTV
   */
  private async updateOrganizationSegments(organizationId: string): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Get customer metrics
    const customers = await this.prisma.storeCustomer.findMany({
      where: { organizationId },
      include: {
        orders: {
          where: {
            createdAt: {
              gte: ninetyDaysAgo,
            },
          },
        },
      },
    });

    // Update segments based on behavior
    for (const customer of customers) {
      let segment = 'low-value';
      let isVip = false;

      // Calculate LTV (simplified)
      const totalOrderValue = customer.orders.reduce((sum, order) => sum + order.total, 0);
      const recentOrdersCount = customer.orders.filter(
        (o) => o.createdAt >= thirtyDaysAgo,
      ).length;

      // VIP: High value + recent activity
      if (totalOrderValue > 1000 && recentOrdersCount >= 3) {
        segment = 'vip';
        isVip = true;
      }
      // Mid-value: Some activity
      else if (totalOrderValue > 500 || recentOrdersCount >= 2) {
        segment = 'mid-value';
      }
      // Inactive: No recent orders
      else if (recentOrdersCount === 0 && customer.lastOrderDate) {
        const daysSinceLastOrder =
          (Date.now() - customer.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastOrder > 90) {
          segment = 'inactive';
        }
      }

      // Update customer with new segment
      if (customer.segment !== segment || customer.isVip !== isVip) {
        await this.prisma.storeCustomer.update({
          where: { id: customer.id },
          data: {
            segment,
            isVip,
          },
        });
      }
    }

    this.logger.log(`Updated segments for ${customers.length} customers in org: ${organizationId}`);
  }
}
