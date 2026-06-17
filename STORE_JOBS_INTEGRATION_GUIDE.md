# Store Jobs Integration Guide

**Quick Reference for Integrating Async Jobs into Store Services**

---

## 📋 TL;DR

1. **Inject StoreJobsService** into your service
2. **Queue a job** with `storeJobs.queue[JobName](params)`
3. **That's it** - job runs in background with retry logic

---

## 🔗 Integration Patterns

### Pattern 1: Queue After Entity Creation

**Use When**: Action completes successfully and you want async notification  
**Example**: Send order confirmation email after order is created

```typescript
// Before (synchronous, blocks user):
async createOrder(createOrderDto: CreateOrderDto) {
  const order = await this.prisma.order.create({ data });
  await this.emailService.sendOrderConfirmation(...);  // Waits for email send
  return order;  // Returns only after email sent (slow!)
}

// After (asynchronous, non-blocking):
constructor(private storeJobs: StoreJobsService) {}

async createOrder(createOrderDto: CreateOrderDto) {
  const order = await this.prisma.order.create({ data });
  
  // Queue email in background, return immediately
  await this.storeJobs.queueOrderConfirmation(order.id);
  
  return order;  // Returns instantly
}
```

**Where to Add**:
- [OrdersService](../apps/api/src/store/services/orders.service.ts) → `create()` method
- [WebhookService](../apps/api/src/store/services/webhook.service.ts) → `handlePaymentSucceeded()` method

---

### Pattern 2: Queue On Status Change

**Use When**: Specific workflow milestone reached (e.g., order shipped)  
**Example**: Send tracking email when order status changes to "shipped"

```typescript
async updateOrderStatus(orderId: string, newStatus: 'processing' | 'shipped' | 'delivered') {
  const order = await this.prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus }
  });
  
  // Queue appropriate job based on status
  if (newStatus === 'shipped') {
    await this.storeJobs.queueShipmentNotification(orderId);
  } else if (newStatus === 'delivered') {
    // Could queue review request email, points update, etc.
  }
  
  return order;
}
```

**Where to Add**:
- [OrdersService](../apps/api/src/store/services/orders.service.ts) → `updateOrderStatus()` method
- [WebhooksController](../apps/api/src/store/controllers/webhooks.controller.ts) → handle shipment events

---

### Pattern 3: Queue After Data Updates

**Use When**: Bulk data changes need background recalculation  
**Example**: Reconcile inventory after restocking

```typescript
async restockProducts(items: { productId: string; quantity: number }[]) {
  // Update inventory
  for (const item of items) {
    await this.prisma.inventory.update({
      where: { productId: item.productId },
      data: { stock: { increment: item.quantity } }
    });
  }
  
  // Queue inventory reconciliation in background
  // (validates consistency, calculates turnover rates, etc.)
  await this.storeJobs.queueInventoryReconciliation(organizationId);
  
  return { success: true, itemsRestocked: items.length };
}
```

**Where to Add**:
- [InventoryService](../apps/api/src/store/services/inventory.service.ts) → after stock updates
- [ProductsService](../apps/api/src/store/services/products.service.ts) → bulk operations

---

### Pattern 4: Queue Periodic Operations

**Use When**: Regular cleanup/reporting needed (scheduled jobs)  
**Example**: Generate daily sales report

```typescript
// In app.module.ts or a dedicated ScheduleModule:
import { Cron } from '@nestjs/schedule';

@Injectable()
export class StoreScheduleService {
  constructor(private storeJobs: StoreJobsService) {}
  
  @Cron('0 1 * * *')  // 1 AM daily
  async generateDailyReports() {
    const organizations = await this.prisma.organization.findMany();
    
    for (const org of organizations) {
      await this.storeJobs.queueDailyReport(org.id);
    }
  }
  
  @Cron('0 2 * * 0')  // 2 AM every Sunday
  async weeklyCleanup() {
    await this.storeJobs.queueCleanupOldJobs();
  }
}
```

**Where to Add**:
- New file: `apps/api/src/store/schedule.service.ts`
- Register in StoreModule

---

## 📧 Email Jobs Reference

### sendOrderConfirmation

**When to Queue**:
- User completes order placement
- Payment is confirmed via webhook

**Required Data**: `orderId`

**Implementation**:
```typescript
await this.storeJobs.queueOrderConfirmation(order.id);
```

**Fetches from DB**:
- Order details (number, total, created date)
- Customer info (name, email)
- Order items (product name, quantity, unit price)

**Email Includes**:
- "Order Confirmation" subject
- Itemized list with totals
- Shipping address
- Estimated delivery date

---

### sendShipmentNotification

**When to Queue**:
- Order status changes to "shipped"
- Tracking number is available

**Required Data**: `orderId`

**Implementation**:
```typescript
await this.storeJobs.queueShipmentNotification(order.id);
```

**Fetches from DB**:
- Order number and tracking number
- Customer email and name
- Shipping carrier info

**Email Includes**:
- "Your Order Has Shipped" subject
- Tracking number and link
- Carrier information
- Estimated delivery window

---

### sendRefundNotification

**When to Queue**:
- Refund is processed
- Payment is reversed

**Required Data**: `refundId`

**Implementation**:
```typescript
const refund = await this.prisma.refund.create({ ... });
await this.storeJobs.queueRefundNotification(refund.id);
```

**Fetches from DB**:
- Refund amount and reason
- Original order number
- Customer email

**Email Includes**:
- "Refund Processed" subject
- Refund amount and method
- Original order details
- Refund timeline

---

### sendCreditAlert

**When to Queue**:
- Store credits are added to customer account
- Credit balance changes significantly

**Required Data**: `customerId, amount`

**Implementation**:
```typescript
await this.storeJobs.queueCreditAlert(customer.id);
```

**Fetches from DB**:
- Customer name and email
- Current credit balance

**Email Includes**:
- "Store Credit Added" subject
- Credit amount
- Current balance
- How to redeem

---

### queueBatchEmails

**When to Queue**:
- Sending promotional emails to segment
- Newsletter to subscribers
- Re-engagement campaign

**Required Data**: `recipients array`

**Implementation**:
```typescript
const recipients = [
  {
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    orderNumber: 'ORD-123',
    orderTotal: 99.99,
    orderDate: '2026-06-01',
    items: [
      { productName: 'Widget', quantity: 2, price: 49.99 }
    ]
  },
  // ... more recipients
];

await this.storeJobs.queueBatchEmails(recipients);
```

**Rate Limiting**:
- Processes 100 recipients per batch
- 1 second delay between batches
- Prevents email provider rate limits

**Use Cases**:
- Weekly newsletter (customers with email opt-in)
- Seasonal sales notifications
- Abandoned cart reminders
- Re-engagement campaigns

---

## 📊 Analytics Jobs Reference

### queueDailyReport

**When to Queue**:
- Schedule: 1 AM daily via cron
- Or: On-demand via API

**Required Data**: `organizationId`

**Implementation**:
```typescript
// Daily cron job:
await this.storeJobs.queueDailyReport(organizationId, {
  delay: 3600000  // Run 1 hour from now
});

// Or via API:
POST /api/store/jobs/queue/daily-report
{ "organizationId": "org_123" }
```

**Report Includes**:
- Sales metrics (revenue, order count, AOV)
- Customer metrics (new, returning, VIP)
- Inventory metrics (stock levels, turnover)

**Processing Time**: ~1-5 seconds (depends on data volume)

**Output**: Logged to application logs (for alerting systems to consume)

---

### queueInventoryReconciliation

**When to Queue**:
- After bulk inventory imports
- Periodic sync (weekly)
- On-demand reconciliation check

**Required Data**: `organizationId`

**Implementation**:
```typescript
// After bulk import:
await this.bulkImportInventory(items);
await this.storeJobs.queueInventoryReconciliation(organizationId);

// Periodic (weekly):
@Cron('0 3 * * 1')  // 3 AM Monday
async weeklyInventorySync() {
  const orgs = await this.prisma.organization.findMany();
  for (const org of orgs) {
    await this.storeJobs.queueInventoryReconciliation(org.id);
  }
}
```

**Actions Performed**:
- Validates inventory records exist for all products
- Syncs stock levels from product table
- Calculates inventory valuation
- Identifies discrepancies

**Processing Time**: ~2-10 seconds (scales with product count)

---

## 🛠️ Setup Checklist

### Step 1: Verify Dependencies

```bash
# Check StoreJobsService is injected
grep -r "StoreJobsService" apps/api/src/store/services/
```

### Step 2: Add Injection to Service

```typescript
// Before:
export class OrdersService {
  constructor(private prisma: PrismaService) {}
}

// After:
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private storeJobs: StoreJobsService  // Add this
  ) {}
}
```

### Step 3: Queue a Job

```typescript
// In any async method:
await this.storeJobs.queueOrderConfirmation(order.id);
```

### Step 4: Test

```bash
# Build
pnpm --filter @vyntra/api build

# Run dev server
pnpm --filter @vyntra/api dev

# Queue a test job via API
curl -X POST http://localhost:3001/api/store/jobs/queue/order-confirmation \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "order_123"}'

# Check status
curl http://localhost:3001/api/store/jobs/queue-stats/send-order-confirmation \
  -H "Authorization: Bearer {token}"
```

---

## 🔍 Debugging Job Failures

### Job Not Processing

**Check 1**: Is the job queued?
```bash
curl http://localhost:3001/api/store/jobs/queue-stats/send-order-confirmation
```

Expected: `"pending": 0` (if processed), or `> 0` (if queued)

**Check 2**: Is there an error?
```bash
curl http://localhost:3001/api/store/jobs/status/{jobId}
# Look for "status": "failed" and "error" field
```

**Common Causes**:
- Order not found → Check orderId is correct
- Customer not found → Verify customer association
- Email provider not configured → Check SMTP settings

### Job Hangs

**Symptoms**: Job stuck in "processing" status for > 1 minute

**Solution**: In development, restart the dev server to clear in-memory queue

```bash
# Kill dev server (Ctrl+C)
# Restart
pnpm --filter @vyntra/api dev
```

### Retry Loop

**Symptoms**: Job keeps failing and retrying

**Check**: View the error message
```bash
curl http://localhost:3001/api/store/jobs/status/{jobId} | jq '.error'
```

**Common Fixes**:
- Fix the underlying issue (e.g., missing record)
- Manually re-enqueue with new data
- Delete the job from memory (restart server)

---

## 📈 Monitoring

### Dashboard Query

```bash
# Get overview of all jobs
curl http://localhost:3001/api/store/jobs/all-queues

# Look for high failure rates
curl http://localhost:3001/api/store/jobs/all-queues | jq '.[] | select(.failed > 0)'
```

### Alerting (Example)

```typescript
// Pseudo-code for alert logic
const stats = getQueueStats('send-order-confirmation');

if (stats.failed > 5) {
  alert(`⚠️ ${stats.failed} failed order confirmation emails`);
}

if (stats.pending > 100) {
  alert(`⚠️ ${stats.pending} emails pending (possible queue backup)`);
}
```

---

## 🚀 Production Checklist

Before deploying job queue to production:

- [ ] Email provider configured (SMTP/SendGrid/Mailgun)
- [ ] Job failure monitoring set up (alerts to Slack/PagerDuty)
- [ ] Queue depth monitoring (alert if > 500 pending)
- [ ] Failed job investigation process documented
- [ ] Retry policies reviewed for each job type
- [ ] Email templates tested with actual provider
- [ ] Load testing done (1000+ concurrent jobs)
- [ ] Error handling and recovery procedures tested
- [ ] Logging configured for debugging
- [ ] Bull migration plan prepared

---

## 📝 Services Needing Integration

| Service | Method | Job Type | Priority |
|---------|--------|----------|----------|
| OrdersService | create() | order-confirmation | HIGH |
| OrdersService | updateOrderStatus() | shipment-notification | HIGH |
| WebhookService | handlePaymentSucceeded() | order-confirmation | HIGH |
| WebhookService | handleChargeRefunded() | refund-notification | HIGH |
| CustomersService | addStoreCredit() | credit-alert | MEDIUM |
| InventoryService | adjustStock() | inventory-reconciliation | MEDIUM |
| New: ScheduleService | generateDailyReports() | daily-report | MEDIUM |

---

## 📞 Quick Reference

### Queue a Job

```typescript
// Email
await storeJobs.queueOrderConfirmation(orderId);
await storeJobs.queueShipmentNotification(orderId);
await storeJobs.queueRefundNotification(refundId);
await storeJobs.queueBatchEmails(recipients);

// Analytics
await storeJobs.queueInventoryReconciliation(organizationId);
await storeJobs.queueDailyReport(organizationId);
```

### Check Status

```bash
# Single job
curl http://localhost:3001/api/store/jobs/status/{jobId}

# Queue stats
curl http://localhost:3001/api/store/jobs/queue-stats/{queueName}

# All queues
curl http://localhost:3001/api/store/jobs/all-queues
```

### Job Types

```
Email: order-confirmation, shipment-notification, refund-notification, 
       credit-alert, batch-emails

Analytics: inventory-reconciliation, daily-report, calculate-customer-metrics, 
           recalculate-inventory-value

Order: process-order-cancellation

Cleanup: cleanup-old-jobs
```

---

**Next**: See [STORE_JOBS_QUEUE.md](./STORE_JOBS_QUEUE.md) for detailed system documentation.

