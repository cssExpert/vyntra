"use client";

import { useTranslations } from "next-intl";
import { CreditCard, Info, Lightbulb, Webhook } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Collapse } from "@/components/ui/Collapse";
import type { CollapseItem } from "@/components/ui/Collapse";
import { AdminGuard } from "./AdminGuard";
import Icon from "@/components/common/Icon";
import { SectionCard } from "@/components/ui/SectionCard";

const providers = [
  {
    id: "stripe",
    name: "Stripe",
    icon: <Icon name="Stripe" size="32" className="h-8 w-8" />,
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
    icon: <Icon name="PayPal" size="32" className="h-8 w-8" />,
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
    icon: <Icon name="Square" size="32" className="h-8 w-8" />,
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
    icon: <Icon name="Razorpay" size="32" className="h-8 w-8" />,
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
    icon: <Icon name="LemonSqueezy" size="32" className="h-8 w-8" />,
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

const providerItems: CollapseItem[] = providers.map((p) => ({
  id: p.id,
  trigger: (
    <div className="flex items-center gap-4">
      <span className="text-2xl leading-none">{p.icon}</span>
      <div>
        <h4 className="font-bold text-foreground">{p.name}</h4>
        <p className="text-sm text-muted-foreground mt-0.5">{p.description}</p>
      </div>
    </div>
  ),
  content: (
    <div className="px-5 py-4 bg-muted/20 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
            Features
          </p>
          <ul className="space-y-1.5">
            {p.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <span className="text-primary mt-0.5">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
              Pricing
            </p>
            <p className="text-sm font-medium text-foreground">{p.pricing}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
              Setup Time
            </p>
            <p className="text-sm font-medium text-foreground">{p.setupTime}</p>
          </div>

          <a
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline mt-1"
          >
            Go to Dashboard →
          </a>
        </div>
      </div>
    </div>
  ),
}));

function Inner() {
  const t = useTranslations("admin.payment");

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={t("title")}
        description={t("description")}
      />

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <h3 className="text-base font-bold mb-1">{t("comingSoon")}</h3>
          <p>
            {t("paymentConfigComingSoon")}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── Payment Providers ──────────────────────────────────────────── */}
        <SectionCard
          icon={CreditCard}
          title={t("availablePaymentProviders")}
          description={t("learnMoreProviders")}
        >
          <Collapse items={providerItems} />
        </SectionCard>

        {/* ── Setup Recommendations ──────────────────────────────────────── */}
        <SectionCard
          icon={Lightbulb}
          title={t("setupRecommendations")}
          description={t("setupRecommendationsDesc")}
        >
          <div className="space-y-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h4 className="font-bold text-amber-900 mb-2">
                {t("globalSaaS")}
              </h4>
              <p className="text-sm text-amber-800">
                {t("globalSaaSText")}
              </p>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
              <h4 className="font-bold text-purple-900 mb-2">
                {t("indiaAsia")}
              </h4>
              <p className="text-sm text-purple-800">
                {t("indiaAsiaText")}
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <h4 className="font-bold text-green-900 mb-2">
                {t("simpleSubscription")}
              </h4>
              <p className="text-sm text-green-800">
                {t("simpleSubscriptionText")}
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h4 className="font-bold text-blue-900 mb-2">
                {t("existingBusiness")}
              </h4>
              <p className="text-sm text-blue-800">
                {t("existingBusinessText")}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ── Webhook Configuration ────────────────────────────────────── */}
        <SectionCard
          icon={Webhook}
          title={t("webhookConfiguration")}
          description={t("webhookConfigDesc")}
        >
          <div className="space-y-3">
            <p className="text-sm text-foreground">
              {t("afterSetup")}
            </p>
            <div className="rounded-xl bg-muted/40 p-4 space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {t("exampleWebhookUrl")}
              </p>
              <code className="block text-xs font-mono text-foreground bg-background px-3 py-2 rounded-lg border border-border overflow-x-auto">
                https://your-domain.com/api/webhooks/payments
              </code>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("configureUrl")}
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
