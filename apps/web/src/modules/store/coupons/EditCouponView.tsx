"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Save, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { StoreCoupon, CouponType } from "../store.types";
import { toStoreCoupon } from "../store.utils";
import { storeCoupons } from "@/lib/api";
import { Input } from "@/components/ui/input";

interface EditCouponViewProps {
  couponId: string;
}

const inp = "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15";
const sel = "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15 cursor-pointer";
const lbl = "block text-sm font-medium text-foreground mb-1.5";

// datetime-local inputs need "YYYY-MM-DDTHH:mm", not a full ISO 8601 string
function toDatetimeLocal(iso?: string): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.055 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: "easeOut" } } };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={item} className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </motion.div>
  );
}

function F({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      {children}
    </div>
  );
}

export function EditCouponView({ couponId }: EditCouponViewProps) {
  const t = useTranslations("store.coupons");
  const [coupon, setCoupon] = useState<StoreCoupon | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [code, setCode] = useState("");
  const [type, setType] = useState<CouponType>("percent");
  const [value, setValue] = useState("");
  const [minimumSpend, setMinimumSpend] = useState("");
  const [maximumDiscount, setMaximumDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [usageLimitPerUser, setUsageLimitPerUser] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [freeShipping, setFreeShipping] = useState(false);
  const [status, setStatus] = useState<"active" | "expired" | "disabled">("active");

  useEffect(() => {
    const fetchCoupon = async () => {
      setIsLoading(true);
      try {
        const found = toStoreCoupon(await storeCoupons.get(couponId));
        setCoupon(found);
        setCode(found.code || "");
        setType(found.type || "percent");
        setValue(String(found.value || ""));
        setMinimumSpend(String(found.minimumSpend || ""));
        setMaximumDiscount(String(found.maximumDiscount || ""));
        setUsageLimit(String(found.usageLimit || ""));
        setUsageLimitPerUser(String(found.usageLimitPerUser || ""));
        setStartsAt(toDatetimeLocal(found.startsAt));
        setExpiresAt(toDatetimeLocal(found.expiresAt));
        setFreeShipping(found.freeShipping === true);
        setStatus(found.status || "active");
      } catch {
        setCoupon(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoupon();
  }, [couponId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await storeCoupons.update(couponId, {
        code,
        type,
        value: parseFloat(value) || 0,
        minimumSpend: parseFloat(minimumSpend) || 0,
        maximumDiscount: parseFloat(maximumDiscount) || 0,
        usageLimit: parseInt(usageLimit) || undefined,
        usageLimitPerUser: parseInt(usageLimitPerUser) || undefined,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        freeShipping,
        status,
      });
      router.push("/store/coupons");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </motion.div>
    );
  }

  if (!coupon) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 min-h-96">
        <p className="text-muted-foreground">{t("noCoupons")}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key="content" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="flex flex-col gap-4">
        <PageHeader
          title={`${t("edit")} - ${coupon.code}`}
          description={t("updateRules")}
          breadcrumbs={[
            { label: t("store"), href: "/store" },
            { label: t("title"), href: "/store/coupons" },
            { label: t("edit") },
          ]}
        >
          <Button variant="outline" size="lg" onClick={() => router.back()}>
            <X size={16} />
            {t("cancel")}
          </Button>
          <Button size="lg" onClick={handleSave} disabled={isSaving}>
            <Save size={16} />
            {isSaving ? "Saving..." : t("save")}
          </Button>
        </PageHeader>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <div className="lg:col-span-2 space-y-5">
            <Card title="Basic Information">
              <F label={<>Coupon Code</>}>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUMMER2024" className={inp} />
              </F>
              <F label={<>Discount Type</>}>
                <select value={type} onChange={(e) => setType(e.target.value as CouponType)} className={sel}>
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed_cart">Fixed Amount - Entire Cart</option>
                  <option value="fixed_product">Fixed Amount - Per Product</option>
                </select>
              </F>
              <F label={<>Discount Value</>}>
                <div className="relative">
                  <Input value={value} onChange={(e) => setValue(e.target.value)} type="number" min="0" step="0.01" placeholder="10" className={inp} />
                  <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground text-[14px] pointer-events-none">{type === "percent" ? "%" : "$"}</span>
                </div>
              </F>
            </Card>

            <Card title="Restrictions">
              <F label="Minimum Purchase Amount">
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground text-[14px] pointer-events-none">$</span>
                  <Input value={minimumSpend} onChange={(e) => setMinimumSpend(e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" className={`${inp} pl-7`} />
                </div>
              </F>
              <F label="Maximum Discount">
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground text-[14px] pointer-events-none">$</span>
                  <Input value={maximumDiscount} onChange={(e) => setMaximumDiscount(e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" className={`${inp} pl-7`} />
                </div>
              </F>
              <F label="Usage Limit (Total)">
                <Input value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} type="number" min="0" placeholder="Unlimited" className={inp} />
              </F>
              <F label="Usage Limit Per Customer">
                <Input value={usageLimitPerUser} onChange={(e) => setUsageLimitPerUser(e.target.value)} type="number" min="0" placeholder="Unlimited" className={inp} />
              </F>
            </Card>

            <Card title="Validity Period">
              <F label="Start Date">
                <Input value={startsAt} onChange={(e) => setStartsAt(e.target.value)} type="datetime-local" className={inp} />
              </F>
              <F label="Expiry Date">
                <Input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} type="datetime-local" className={inp} />
              </F>
            </Card>

            <Card title="Additional Options">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={freeShipping} onChange={(e) => setFreeShipping(e.target.checked)} className="w-4 h-4 rounded-sm accent-primary cursor-pointer" />
                  <span className="text-[14px] text-foreground">Grant Free Shipping</span>
                </label>
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card title="Status">
              <F label="Coupon Status">
                <select value={status} onChange={(e) => setStatus(e.target.value as "active" | "expired" | "disabled")} className={sel}>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="disabled">Disabled</option>
                </select>
              </F>
            </Card>
          </div>
        </motion.div>

        <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-background/80 backdrop-blur-md border-t border-border/60 flex items-center justify-between gap-4 z-10">
          <p className="text-xs text-muted-foreground hidden sm:block">Unsaved changes will be lost if you navigate away.</p>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" onClick={() => router.push("/store/coupons")}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save size={14} />
              {isSaving ? "Saving..." : t("save")}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
