"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Save,
  Store,
  CreditCard,
  Truck,
  DollarSign,
  Bell,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MotionTabs, type MotionTabItem } from "@/components/ui/MotionTabs";

type TabId = "general" | "payment" | "shipping" | "tax" | "notifications" | "ai";

const TABS: MotionTabItem<TabId>[] = [
  { id: "general",       label: "General",          icon: Store },
  { id: "payment",       label: "Payment",           icon: CreditCard },
  { id: "shipping",      label: "Shipping",          icon: Truck },
  { id: "tax",           label: "Tax",               icon: DollarSign },
  { id: "notifications", label: "Notifications",     icon: Bell },
  { id: "ai",            label: "AI & Integrations", icon: Cpu },
];

const inputCls =
  "w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15";
const labelCls = "block text-xs font-semibold text-foreground mb-1";

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer",
          on ? "bg-primary" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200",
            on ? "left-4" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function StoreSettingsView() {
  const isLoaded = usePageLoad(500);
  const [activeTab, setActiveTab] = useState<TabId>("general");

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
        <motion.div key="sk" exit={{ opacity: 0 }} className="space-y-4">
          <div className="h-9 w-48 rounded-sm bg-muted animate-pulse" />
          <div className="h-64 w-full rounded-xl bg-muted animate-pulse" />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <PageHeader
            title="Store Settings"
            description="Configure your store's general settings, payments, shipping, and more."
            breadcrumbs={[
              { label: "Store", href: "/store" },
              { label: "Settings" },
            ]}
          >
            <button
              onClick={() => {
                alert("alert");
              }}
              className="rounded-sm border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer">
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </button>
          </PageHeader>

          <MotionTabs
            tabs={TABS}
            active={activeTab}
            onChange={setActiveTab}
            layoutId="store-settings-tab"
            className="w-fit"
          />

          {/* Tab content */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {activeTab === "general" && (
                <>
                  <Section title="Store Identity">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldGroup label="Store Name">
                        <input
                          className={inputCls}
                          defaultValue="ERVFlow Store"
                        />
                      </FieldGroup>
                      <FieldGroup label="Store URL">
                        <input
                          className={inputCls}
                          defaultValue="https://store.ervflow.com"
                        />
                      </FieldGroup>
                      <FieldGroup label="Support Email">
                        <input
                          className={inputCls}
                          defaultValue="support@ervflow.com"
                        />
                      </FieldGroup>
                      <FieldGroup label="Currency">
                        <select className={inputCls}>
                          <option>USD — US Dollar</option>
                          <option>EUR — Euro</option>
                          <option>GBP — British Pound</option>
                        </select>
                      </FieldGroup>
                      <FieldGroup label="Country / Region">
                        <select className={inputCls}>
                          <option>United States</option>
                          <option>United Kingdom</option>
                          <option>European Union</option>
                        </select>
                      </FieldGroup>
                      <FieldGroup label="Timezone">
                        <select className={inputCls}>
                          <option>UTC-05:00 Eastern Time</option>
                          <option>UTC+00:00 London</option>
                        </select>
                      </FieldGroup>
                    </div>
                  </Section>
                  <Section title="Checkout Settings">
                    <Toggle
                      label="Guest checkout"
                      description="Allow customers to checkout without creating an account."
                      defaultChecked
                    />
                    <Toggle label="Require phone number" />
                    <Toggle label="Enable order notes" defaultChecked />
                    <Toggle
                      label="Terms & Conditions checkbox"
                      defaultChecked
                    />
                  </Section>
                </>
              )}

              {activeTab === "payment" && (
                <Section
                  title="Payment Gateways"
                  description="Connect and configure your payment providers."
                >
                  {[
                    {
                      name: "Stripe",
                      connected: true,
                      desc: "Credit / Debit cards, Apple Pay, Google Pay",
                    },
                    {
                      name: "PayPal",
                      connected: false,
                      desc: "PayPal balance, card, and Pay Later",
                    },
                    {
                      name: "Razorpay",
                      connected: false,
                      desc: "UPI, net banking, cards (India)",
                    },
                  ].map((gw) => (
                    <div
                      key={gw.name}
                      className="flex items-center justify-between rounded-sm border border-border p-4"
                    >
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {gw.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {gw.desc}
                        </p>
                      </div>
                      <button
                        className={cn(
                          "px-4 py-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer",
                          gw.connected
                            ? "bg-error/10 text-error border border-error/20 hover:bg-error/20"
                            : "bg-primary text-primary-foreground hover:bg-primary/90",
                        )}
                      >
                        {gw.connected ? "Disconnect" : "Connect"}
                      </button>
                    </div>
                  ))}
                </Section>
              )}

              {activeTab === "shipping" && (
                <Section
                  title="Shipping Methods"
                  description="Set up shipping zones, rates, and carriers."
                >
                  <Toggle label="Free shipping on orders over threshold" />
                  <FieldGroup label="Free Shipping Minimum ($)">
                    <input
                      className={inputCls}
                      type="number"
                      defaultValue="50"
                    />
                  </FieldGroup>
                  <Toggle label="Flat rate shipping" defaultChecked />
                  <FieldGroup label="Flat Rate ($)">
                    <input
                      className={inputCls}
                      type="number"
                      defaultValue="4.99"
                    />
                  </FieldGroup>
                  <Toggle label="Local pickup" />
                  <Toggle label="Real-time carrier rates (UPS / FedEx)" />
                </Section>
              )}

              {activeTab === "tax" && (
                <Section title="Tax Configuration">
                  <Toggle label="Enable tax calculation" defaultChecked />
                  <Toggle label="Prices include tax (display)" />
                  <Toggle label="Charge tax on shipping" />
                  <FieldGroup label="Default Tax Rate (%)">
                    <input
                      className={inputCls}
                      type="number"
                      defaultValue="9"
                    />
                  </FieldGroup>
                </Section>
              )}

              {activeTab === "notifications" && (
                <Section title="Email Notifications">
                  <Toggle
                    label="New order notification to admin"
                    defaultChecked
                  />
                  <Toggle
                    label="Order confirmation to customer"
                    defaultChecked
                  />
                  <Toggle
                    label="Shipping confirmation to customer"
                    defaultChecked
                  />
                  <Toggle
                    label="Refund notification to customer"
                    defaultChecked
                  />
                  <Toggle label="Low stock alert to admin" defaultChecked />
                  <Toggle
                    label="Abandoned cart recovery email"
                    defaultChecked
                  />
                </Section>
              )}

              {activeTab === "ai" && (
                <Section
                  title="AI Assistant"
                  description="Connect your AI provider to enable the Store AI Assistant."
                >
                  <FieldGroup label="Anthropic API Key">
                    <input
                      className={inputCls}
                      type="password"
                      placeholder="sk-ant-…"
                    />
                  </FieldGroup>
                  <FieldGroup label="Default AI Model">
                    <select className={inputCls}>
                      <option>claude-sonnet-4-6</option>
                      <option>claude-opus-4-8</option>
                      <option>claude-haiku-4-5-20251001</option>
                    </select>
                  </FieldGroup>
                  <Toggle
                    label="AI product description generation"
                    defaultChecked
                  />
                  <Toggle label="AI order fraud detection" defaultChecked />
                  <Toggle label="AI customer segmentation" />
                </Section>
              )}
            </motion.div>
            <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-background/80 backdrop-blur-md border-t border-border/60 flex items-center justify-between gap-4 z-10">
              <p className="text-xs text-muted-foreground hidden sm:block">
                Unsaved changes will be lost if you navigate away.
              </p>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => {
                    alert("alert");
                  }}
                  className="rounded-sm border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer">
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </button>
              </div>
            </div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
