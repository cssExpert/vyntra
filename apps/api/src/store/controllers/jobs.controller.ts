import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JobQueueService } from '../services/job-queue.service';
import { StoreJobsService } from '../services/store-jobs.service';

@Controller('store/jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(
    private jobQueue: JobQueueService,
    private storeJobs: StoreJobsService,
  ) {}

  @Get('queue-stats/:queueName')
  getQueueStats(@Param('queueName') queueName: string): any {
    return this.jobQueue.getQueueStats(queueName);
  }

  @Get('status/:jobId')
  getJobStatus(@Param('jobId') jobId: string): any {
    const job = this.jobQueue.getJobStatus(jobId);
    if (!job) {
      return { error: 'Job not found', jobId };
    }
    return job;
  }

  @Post('queue/order-confirmation')
  async queueOrderConfirmation(@Body() body: { orderId: string }): Promise<{ jobId: string }> {
    const jobId = await this.storeJobs.queueOrderConfirmation(body.orderId);
    return { jobId };
  }

  @Post('queue/shipment-notification')
  async queueShipmentNotification(@Body() body: { orderId: string }): Promise<{ jobId: string }> {
    const jobId = await this.storeJobs.queueShipmentNotification(body.orderId);
    return { jobId };
  }

  @Post('queue/refund-notification')
  async queueRefundNotification(@Body() body: { refundId: string }): Promise<{ jobId: string }> {
    const jobId = await this.storeJobs.queueRefundNotification(body.refundId);
    return { jobId };
  }

  @Post('queue/batch-emails')
  async queueBatchEmails(@Body() body: { recipients: any[] }): Promise<{ jobId: string }> {
    const jobId = await this.storeJobs.queueBatchEmails(body.recipients);
    return { jobId };
  }

  @Post('queue/inventory-reconciliation')
  async queueInventoryReconciliation(@Body() body: { organizationId: string }): Promise<{ jobId: string }> {
    const jobId = await this.storeJobs.queueInventoryReconciliation(body.organizationId);
    return { jobId };
  }

  @Post('queue/daily-report')
  async queueDailyReport(@Body() body: { organizationId: string }): Promise<{ jobId: string }> {
    const jobId = await this.storeJobs.queueDailyReport(body.organizationId);
    return { jobId };
  }

  @Get('all-queues')
  getAllQueueStats(): any {
    const queues = [
      'send-order-confirmation',
      'send-shipment-notification',
      'send-refund-notification',
      'send-credit-alert',
      'send-batch-emails',
      'calculate-customer-metrics',
      'recalculate-inventory-value',
      'generate-daily-report',
      'process-order-cancellation',
      'reconcile-inventory',
      'cleanup-old-jobs',
    ];

    const allStats: any = {};
    for (const queueName of queues) {
      allStats[queueName] = this.jobQueue.getQueueStats(queueName);
    }

    return allStats;
  }
}
