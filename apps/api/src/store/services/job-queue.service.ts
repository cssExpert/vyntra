import { Injectable, Logger } from '@nestjs/common';

export interface JobData {
  [key: string]: any;
}

export interface JobOptions {
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  delay?: number;
  priority?: number;
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

/**
 * JobQueueService - Abstraction for background job processing
 * Supports multiple queue backends (Bull, RabbitMQ, etc.)
 * Currently uses in-memory queue for development
 */
@Injectable()
export class JobQueueService {
  private readonly logger = new Logger(JobQueueService.name);
  private jobs: Map<string, Job[]> = new Map();
  private jobHandlers: Map<string, (data: JobData) => Promise<void>> = new Map();

  /**
   * Define a job handler
   */
  defineJob(
    name: string,
    handler: (data: JobData) => Promise<void>,
  ): void {
    this.jobHandlers.set(name, handler);
    this.logger.log(`Job handler registered: ${name}`);
  }

  /**
   * Enqueue a job for processing
   */
  async enqueue(
    name: string,
    data: JobData,
    options: JobOptions = {},
  ): Promise<string> {
    const jobId = `${name}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    if (!this.jobs.has(name)) {
      this.jobs.set(name, []);
    }

    const job: Job = {
      id: jobId,
      name,
      data,
      status: 'pending',
      attempts: 0,
      maxAttempts: options.attempts || 3,
      createdAt: new Date(),
      options,
    };

    this.jobs.get(name)!.push(job);

    // Process immediately for development (in production use Bull)
    setTimeout(() => this.processJob(job), options.delay || 0);

    this.logger.log(`Job enqueued: ${jobId} (${name})`);
    return jobId;
  }

  /**
   * Process a single job
   */
  private async processJob(job: Job): Promise<void> {
    const handler = this.jobHandlers.get(job.name);

    if (!handler) {
      this.logger.error(
        `No handler found for job: ${job.name}`,
      );
      job.status = 'failed';
      job.error = 'Handler not found';
      return;
    }

    try {
      job.status = 'processing';
      job.startedAt = new Date();

      await handler(job.data);

      job.status = 'completed';
      job.completedAt = new Date();
      this.logger.log(`Job completed: ${job.id}`);
    } catch (error) {
      job.attempts += 1;

      if (job.attempts < job.maxAttempts) {
        job.status = 'pending';
        const delay = this.calculateDelay(job);
        this.logger.warn(
          `Job failed, retrying in ${delay}ms: ${job.id}`,
          error,
        );

        setTimeout(() => this.processJob(job), delay);
      } else {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Job failed after ${job.attempts} attempts: ${job.id}`,
          error,
        );
      }
    }
  }

  /**
   * Calculate backoff delay
   */
  private calculateDelay(job: Job): number {
    const baseDelay = job.options.backoff?.delay || 1000;

    if (job.options.backoff?.type === 'exponential') {
      return baseDelay * Math.pow(2, job.attempts);
    }

    return baseDelay;
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): Job | null {
    for (const jobs of this.jobs.values()) {
      const job = jobs.find((j) => j.id === jobId);
      if (job) return job;
    }
    return null;
  }

  /**
   * Get all jobs by queue name
   */
  getQueueJobs(queueName: string): Job[] {
    return this.jobs.get(queueName) || [];
  }

  /**
   * Get queue statistics
   */
  getQueueStats(queueName: string): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    const jobs = this.getQueueJobs(queueName);

    return {
      total: jobs.length,
      pending: jobs.filter((j) => j.status === 'pending').length,
      processing: jobs.filter((j) => j.status === 'processing').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
    };
  }
}

interface Job {
  id: string;
  name: string;
  data: JobData;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  options: JobOptions;
}
