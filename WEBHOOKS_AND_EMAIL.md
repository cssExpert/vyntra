# Email Notifications & Webhook Integration Guide

**Date**: June 17, 2026  
**Status**: Ready for Implementation  
**Services**: EmailService, WebhookService

---

## 📧 Email Service

### Supported Email Providers

The `EmailService` supports multiple email providers:

```typescript
// Configured via .env: EMAIL_PROVIDER
- 'smtp' (default)        - SMTP server
- 'sendgrid'              - SendGrid API
- 'mailgun'               - Mailgun API
```

### Environment Configuration

```bash
# Email Provider Selection
EMAIL_PROVIDER=smtp

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com

# SendGrid (if using sendgrid)
SENDGRID_API_KEY=sg_...

# Mailgun (if using mailgun)
MAILGUN_API_KEY=key-...
MAILGUN_DOMAIN=mail.yourdomain.com
```

### Supported Email Notifications

#### 1. Order Confirmation
Sent after payment is confirmed.

```typescript
await emailService.sendOrderConfirmation({
  customerName: "John Doe",
  customerEmail: "john@example.com",
  orderNumber: "ORD-2026-000001",
  orderTotal: 99.99,
  orderDate: "2026-06-17",
  items: [
    {
      productName: "Product A",
      quantity: 2,
      price: 49.99
    }
  ],
  shippingAddress: {
    line1: "123 Main St",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    zip: "94105"
  }
});
```

**Includes**: Item list, shipping address, order total, summary

#### 2. Order Shipped
Sent when order is dispatched.

```typescript
await emailService.sendOrderShipped(
  "john@example.com",
  "John Doe",
  "ORD-2026-000001",
  "TRACKING123456" // optional
);
```

**Includes**: Tracking number (if available), estimated delivery

#### 3. Refund Notification
Sent when refund is processed.

```typescript
await emailService.sendRefundNotification(
  "john@example.com",
  "John Doe",
  "ORD-2026-000001",
  25.00 // refund amount
);
```

**Includes**: Refund amount, processing timeline

#### 4. Store Credit Alert
Sent when customer receives store credit.

```typescript
await emailService.sendCreditAlert(
  "john@example.com",
  "John Doe",
  25.00 // credit amount
);
```

**Includes**: Credit amount, usage instructions

#### 5. Reward Points Notification
Sent when customer earns reward points.

```typescript
await emailService.sendRewardPointsNotification(
  "john@example.com",
  "John Doe",
  100, // points earned
  1500 // new total balance
);
```

**Includes**: Points earned, new balance, redemption info

---

## 🔗 Webhook Integration

### Supported Webhook Events

#### 1. Stripe Payment Webhooks

**Endpoint**: `POST /api/store/webhooks/stripe`

Requires `stripe-signature` header for verification.

**Supported Events**:

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Update order to "processing", record payment, send confirmation email |
| `payment_intent.payment_failed` | Mark order as "cancelled", update payment status to "failed" |
| `charge.refunded` | Update refund status to "completed", send notification |

**Setup in Stripe Dashboard**:

```
1. Go to Webhooks section
2. Add endpoint: https://yourdomain.com/api/store/webhooks/stripe
3. Select events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - charge.refunded
4. Copy signing secret to STRIPE_WEBHOOK_SECRET env var
```

**Environment Configuration**:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Verification Example**:

```typescript
// The service automatically verifies the signature
// If invalid, returns 400 Bad Request
// If valid, processes the webhook
```

#### 2. Shipment Notification Webhook

**Endpoint**: `POST /api/store/webhooks/shipment`

For fulfillment services to notify order shipment.

**Request Body**:

```json
{
  "orderId": "clp5x7a9z0001qz0z0z0z0z0z",
  "trackingNumber": "1Z999AA10123456784",
  "carrier": "UPS"
}
```

**Response**:

```json
{
  "received": true,
  "orderId": "clp5x7a9z0001qz0z0z0z0z0z"
}
```

**What Happens**:
1. Order status updated to "shipped"
2. Tracking number stored
3. Timeline entry created
4. Shipment email sent to customer

#### 3. Delivery Confirmation Webhook

**Endpoint**: `POST /api/store/webhooks/delivery`

For fulfillment services to confirm delivery.

**Request Body**:

```json
{
  "orderId": "clp5x7a9z0001qz0z0z0z0z0z",
  "deliveredAt": "2026-06-20T14:30:00Z"
}
```

**What Happens**:
1. Order status updated to "delivered"
2. Delivery timestamp recorded
3. Timeline entry created

#### 4. Inventory Check Webhook

**Endpoint**: `POST /api/store/webhooks/inventory-check/:organizationId`

Check for low stock items.

**Response**:

```json
{
  "received": true,
  "lowStockItems": [
    {
      "productId": "prod_123",
      "productName": "Widget A",
      "currentStock": 5,
      "threshold": 10
    }
  ],
  "itemCount": 1
}
```

---

## 🧪 Testing Webhooks

### Test Endpoint

**Endpoint**: `POST /api/store/webhooks/test`

Simulates webhook events without actual payment processing.

**Request Body**:

```json
{
  "type": "payment_succeeded",
  "orderId": "clp5x7a9z0001qz0z0z0z0z0z",
  "organizationId": "org_abc123"
}
```

**Supported Types**:
- `payment_succeeded` - Simulate payment success
- `shipment_notified` - Simulate shipment notification
- `delivery_confirmed` - Simulate delivery confirmation

**Example Testing Workflow**:

```bash
# 1. Create an order
curl -X POST http://localhost:3001/api/store/orders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{...order data...}'

# Save the orderId from response

# 2. Test payment success webhook
curl -X POST http://localhost:3001/api/store/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment_succeeded",
    "orderId": "{saved_order_id}",
    "organizationId": "{org_id}"
  }'

# 3. Check order status
curl -X GET http://localhost:3001/api/store/orders/{saved_order_id} \
  -H "Authorization: Bearer {token}"

# Should see:
# - paymentStatus: "paid"
# - status: "processing"
# - Timeline entry for status change
```

---

## 🔐 Security Considerations

### Webhook Signature Verification

**Why**: Prevents replay attacks and ensures webhooks are from trusted sources.

**How It Works**:

1. Stripe sends request with `stripe-signature` header
2. Header contains: `t=timestamp,v1=signature`
3. We compute hash of request body with webhook secret
4. Compare computed hash with provided signature
5. Verify timestamp is recent (< 5 minutes)

**Implementation**:

```typescript
// Automatic - no code needed
// Service handles all verification
```

### Rate Limiting

**Recommended Configuration**:

```typescript
// Add to main.ts or app controller
import { ThrottlerModule } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  ttl: 60,
  limit: 30, // 30 requests per minute per IP
});
```

### IP Whitelisting (Optional)

**Stripe IP Ranges**: Check [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)

---

## 📊 Email Logging

### Development Mode

In `development` environment, emails are logged to console:

```
[EmailService] Email to john@example.com: Order Confirmation - ORD-2026-000001
```

### Production Mode

In `production`, emails are sent via configured provider.

Enable structured logging:

```bash
LOG_LEVEL=debug
```

---

## 🚀 Integration Checklist

### Before Going Live

- [ ] Configure email provider (SMTP/SendGrid/Mailgun)
- [ ] Set up Stripe webhook endpoint
- [ ] Add `STRIPE_WEBHOOK_SECRET` to environment
- [ ] Test email templates (confirmation, shipped, refund, etc.)
- [ ] Test Stripe webhook signature verification
- [ ] Test shipment notification webhook
- [ ] Test delivery confirmation webhook
- [ ] Set up monitoring/alerting for failed webhooks
- [ ] Configure retry logic for failed emails
- [ ] Set up email templates for branding

### Webhook Health Check

```bash
# Monitor webhook failures
SELECT COUNT(*) FROM failed_webhooks 
WHERE created_at > NOW() - INTERVAL '1 hour'
```

---

## 💡 Best Practices

### Email Template Customization

Override HTML templates in `EmailService`:

```typescript
// In email.service.ts, customize these methods:
- generateOrderConfirmationHtml()
- generateOrderShippedHtml()
- generateRefundNotificationHtml()
- generateCreditAlertHtml()
- generateRewardPointsHtml()
```

### Webhook Retry Strategy

For failed webhooks, implement exponential backoff:

```typescript
// Retry configuration
Max Retries: 5
Initial Delay: 1s
Max Delay: 3600s (1 hour)
Backoff: exponential with jitter
```

### Email Unsubscribe

Add unsubscribe link to all emails:

```html
<a href="https://yourdomain.com/unsubscribe?email={email}">
  Unsubscribe
</a>
```

---

## 🔍 Monitoring & Alerts

### Key Metrics to Track

1. **Email Delivery Rate**
   - Target: > 99% success
   - Alert if: < 98%

2. **Webhook Processing Time**
   - Target: < 100ms
   - Alert if: > 1000ms

3. **Failed Webhooks**
   - Target: 0
   - Alert if: > 1 in 1 hour

4. **Email Bounce Rate**
   - Target: < 0.5%
   - Alert if: > 2%

### Sentry Integration

```typescript
// Add to webhook error handling
Sentry.captureException(error, {
  tags: {
    service: 'webhook',
    event_type: event.type,
  },
});
```

---

## 📞 Troubleshooting

### Emails Not Sending

1. **Check environment variables**
   ```bash
   echo $EMAIL_PROVIDER
   echo $SMTP_HOST
   ```

2. **Enable debug logging**
   ```bash
   LOG_LEVEL=debug npm run start
   ```

3. **Test SMTP connection**
   ```bash
   nc -zv smtp.gmail.com 587
   ```

### Webhook Not Triggering

1. **Verify webhook endpoint is accessible**
   ```bash
   curl https://yourdomain.com/api/store/webhooks/stripe
   ```

2. **Check firewall/WAF rules**
   - Ensure Stripe IPs can reach endpoint

3. **Verify signature secret**
   ```bash
   echo $STRIPE_WEBHOOK_SECRET | wc -c
   # Should be ~100+ characters
   ```

4. **Check logs**
   ```bash
   tail -f logs/webhook.log
   ```

### Email Templates Not Rendering

1. **Validate HTML syntax**
   ```bash
   # Use https://validator.w3.org/
   ```

2. **Test email rendering**
   - Use Litmus, Email on Acid, or Stripo

3. **Check for email client compatibility**
   - Most issues are with Outlook

---

## 📝 Sample .env Configuration

```bash
# Email Configuration
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Stripe Configuration
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Logging
LOG_LEVEL=info

# Node Environment
NODE_ENV=production
```

---

## 🎯 Next Steps

1. **Choose email provider** - SMTP for simplicity, SendGrid for scale
2. **Implement email templates** - Brand with company colors/logo
3. **Set up Stripe webhook** - Copy webhook secret to env
4. **Test end-to-end flow** - Create order → Simulate payment → Verify email
5. **Monitor in production** - Set up alerts for failures
6. **Gather feedback** - Iterate on email templates based on open rates

---

*For detailed implementation examples, see `EmailService` and `WebhookService` in the codebase.*
