"use client";

import { useState } from "react";
import {
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminGuard } from "./AdminGuard";

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-start gap-3 px-6 py-5 border-b border-border bg-muted/20">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}

function Inner() {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

  const providers = [
    {
      id: "stripe",
      name: "Stripe",
      icon: "💳",
      description: "Most popular payment processor",
      features: [
        "Credit & debit cards",
        "ACH transfers (US)",
        "Bank transfers (UK, EU)",
        "Apple Pay & Google Pay",
        "Subscriptions & recurring billing",
        "99.9% uptime SLA",
      ],
      pricing: "2.9% + $0.30 per transaction",
      setupTime: "15 minutes",
      link: "https://dashboard.stripe.com",
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: "🅿️",
      description: "Largest payment network",
      features: [
        "PayPal wallet",
        "Credit & debit cards",
        "Bank transfers",
        "Buy now, pay later",
        "Subscriptions",
        "Mobile wallet support",
      ],
      pricing: "2.9% + $0.30 per transaction",
      setupTime: "10 minutes",
      link: "https://www.paypal.com/business",
    },
    {
      id: "square",
      name: "Square",
      icon: "⬜",
      description: "All-in-one payment platform",
      features: [
        "Credit & debit cards",
        "Digital wallets",
        "Bank transfers",
        "Invoice payments",
        "Subscriptions",
        "Marketplace support",
      ],
      pricing: "2.6% + $0.30 per transaction",
      setupTime: "10 minutes",
      link: "https://squareup.com",
    },
    {
      id: "razorpay",
      name: "Razorpay",
      icon: "🇮🇳",
      description: "Best for India & Southeast Asia",
      features: [
        "UPI, cards, wallets",
        "NetBanking",
        "Bank transfers",
        "Subscription management",
        "Low fraud",
        "Easy reconciliation",
      ],
      pricing: "2% + ₹0 to 2% per transaction",
      setupTime: "5 minutes",
      link: "https://razorpay.com",
    },
    {
      id: "lemonsqueezy",
      name: "Lemon Squeezy",
      icon: "🍋",
      description: "Merchant of record (SaaS friendly)",
      features: [
        "Global tax compliance",
        "No need to register for VAT",
        "180+ countries",
        "Subscriptions & one-time",
        "Affiliate programs",
        "Team support",
      ],
      pricing: "8% + payment processor fee",
      setupTime: "5 minutes",
      link: "https://lemonsqueezy.com",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Payment Methods"
        description="Configure payment providers for processing customer transactions."
      />

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Coming Soon</p>
          <p>Payment provider configuration will be available in the next update. You can set up your payment provider manually in the meantime.</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── Payment Providers ──────────────────────────────────────────── */}
        <SectionCard
          icon={CreditCard}
          title="Available Payment Providers"
          description="Click to learn more about each provider"
        >
          <div className="space-y-3">
            {providers.map((provider) => {
              const isExpanded = expandedProvider === provider.id;

              return (
                <div
                  key={provider.id}
                  className="rounded-lg border border-border overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedProvider(isExpanded ? null : provider.id)
                    }
                    className="w-full px-5 py-4 hover:bg-muted/40 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 text-left min-w-0">
                      <div className="text-2xl">{provider.icon}</div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-foreground">
                          {provider.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {provider.description}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </div>
                  </button>

                  {isExpanded && (
                    <>
                      <div className="border-t border-border px-5 py-4 bg-muted/20 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                              Features
                            </p>
                            <ul className="space-y-1.5">
                              {provider.features.map((feature) => (
                                <li
                                  key={feature}
                                  className="flex items-start gap-2 text-sm text-foreground"
                                >
                                  <span className="text-primary mt-1">✓</span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                Pricing
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {provider.pricing}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                Setup Time
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {provider.setupTime}
                              </p>
                            </div>

                            <a
                              href={provider.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-2"
                            >
                              Go to Dashboard →
                            </a>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* ── Setup Recommendations ──────────────────────────────────────── */}
        <SectionCard
          icon={CreditCard}
          title="Setup Recommendations"
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h4 className="font-semibold text-amber-900 mb-2">
                For Global SaaS Applications
              </h4>
              <p className="text-sm text-amber-800">
                Use <strong>Stripe</strong> as primary + <strong>Lemon Squeezy</strong> for tax compliance, or <strong>Stripe</strong> with tax integration.
              </p>
            </div>

            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h4 className="font-semibold text-purple-900 mb-2">
                For India/Asia Focus
              </h4>
              <p className="text-sm text-purple-800">
                Use <strong>Razorpay</strong> as primary for local payments + <strong>Stripe</strong> for international cards.
              </p>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 className="font-semibold text-green-900 mb-2">
                For Simple Subscription SaaS
              </h4>
              <p className="text-sm text-green-800">
                Use <strong>Lemon Squeezy</strong> (simplest setup, global tax handling) or <strong>Stripe</strong> (more control).
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                For Existing Business
              </h4>
              <p className="text-sm text-blue-800">
                Check if you already have <strong>Stripe</strong> or <strong>PayPal</strong> configured for seamless integration.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ── Webhook Configuration ────────────────────────────────────── */}
        <SectionCard
          icon={CreditCard}
          title="Webhook Configuration"
        >
          <div className="space-y-3">
            <p className="text-sm text-foreground">
              After setting up your payment provider, you'll need to configure webhooks for real-time transaction updates.
            </p>
            <div className="rounded-lg bg-muted/40 p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Example Webhook URL (replace with your domain)
              </p>
              <code className="block text-xs font-mono text-foreground bg-background px-3 py-2 rounded border border-border overflow-x-auto">
                https://your-domain.com/api/webhooks/payments
              </code>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure this URL in your payment provider's dashboard to receive webhook events for payment status changes, refunds, and subscriptions.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export function PaymentSettingsView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
