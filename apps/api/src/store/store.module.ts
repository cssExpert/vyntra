import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AttributesService } from './services/attributes.service';
import { ProductsService } from './services/products.service';
import { CategoriesService } from './services/categories.service';
import { OrdersService } from './services/orders.service';
import { CustomersService } from './services/customers.service';
import { InventoryService } from './services/inventory.service';
import { CouponsService } from './services/coupons.service';
import { EmailService } from './services/email.service';
import { WebhookService } from './services/webhook.service';
import { AnalyticsService } from './services/analytics.service';
import { JobQueueService } from './services/job-queue.service';
import { StoreJobsService } from './services/store-jobs.service';
import { StoreSchedulerService } from './services/store-scheduler.service';
import { AttributesController } from './controllers/attributes.controller';
import { ProductsController } from './controllers/products.controller';
import { CategoriesController } from './controllers/categories.controller';
import { OrdersController } from './controllers/orders.controller';
import { CustomersController } from './controllers/customers.controller';
import { InventoryController } from './controllers/inventory.controller';
import { CouponsController } from './controllers/coupons.controller';
import { WebhooksController } from './controllers/webhooks.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { JobsController } from './controllers/jobs.controller';

@Module({
  imports: [ConfigModule],
  controllers: [
    AttributesController,
    ProductsController,
    CategoriesController,
    OrdersController,
    CustomersController,
    InventoryController,
    CouponsController,
    WebhooksController,
    AnalyticsController,
    JobsController,
  ],
  providers: [
    AttributesService,
    JobQueueService,
    StoreJobsService,
    StoreSchedulerService,
    ProductsService,
    CategoriesService,
    OrdersService,
    CustomersService,
    InventoryService,
    CouponsService,
    EmailService,
    WebhookService,
    AnalyticsService,
  ],
  exports: [
    AttributesService,
    JobQueueService,
    StoreJobsService,
    StoreSchedulerService,
    ProductsService,
    CategoriesService,
    OrdersService,
    CustomersService,
    InventoryService,
    CouponsService,
    EmailService,
    WebhookService,
    AnalyticsService,
  ],
})
export class StoreModule {}
