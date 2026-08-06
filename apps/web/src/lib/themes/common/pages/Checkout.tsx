"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Check, User, MapPin, CreditCard, Pencil } from "lucide-react";
import { useCart } from "@/lib/themes/useCart";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { useAccountAddresses, type AccountAddress } from "@/lib/themes/useAccount";
import { CouponInput } from "@/lib/themes/shared/CouponInput";
import { storefrontFetch, ApiError } from "@/lib/storefrontApi";
import { usePaymentMethods } from "@/lib/themes/usePaymentMethods";
import { StripePaymentStep } from "@/lib/themes/shared/StripePaymentStep";
import { FloatingInput } from "@/lib/themes/shared/AuthForms";

// FloatingInput builds its focus-ring color via string concatenation
// (`${accentColor}26`), which only works with a plain hex value — a
// `var(--primary, #3b82f6)` CSS expression can't have a hex alpha suffix
// appended to it. Use the theme's own fallback hex directly here instead.
const BLUE = "#3b82f6";

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

const selectCls = "w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all";
const selectStyle = { borderColor: "var(--border, #e5e7eb)", backgroundColor: "var(--background, #fff)", color: "var(--foreground, #111827)" };

type AddressForm = { line1: string; line2: string; city: string; state: string; country: string; zip: string };
const EMPTY_ADDRESS: AddressForm = { line1: "", line2: "", city: "", state: "", country: "", zip: "" };

function addressFromSaved(a: AccountAddress): AddressForm {
  return { line1: a.line1, line2: a.line2 ?? "", city: a.city, state: a.state, country: a.country, zip: a.zip };
}

interface CheckoutOrderResponse {
  order: { id: string; orderNumber: string };
  session?: { customer: { id: string; name: string; email: string; phone: string | null }; accessToken: string; refreshToken: string };
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border shadow-sm p-6" style={{ borderColor: "var(--border, #e5e7eb)", backgroundColor: "var(--card, #fff)" }}>
      {children}
    </div>
  );
}

function CardHeading({ icon: Icon, title, action }: { icon: typeof User; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: "color-mix(in srgb, var(--primary, #3b82f6) 12%, transparent)", color: "var(--primary, #3b82f6)" }}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h2 className="text-sm font-semibold" style={{ color: "var(--foreground, #111827)" }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "details", label: "Details" },
    { key: "review", label: "Review & Pay" },
  ];
  return (
    <div className="flex items-center mb-8">
      {steps.map((s, i) => {
        const isActive = step === s.key;
        const isDone = step === "review" && s.key === "details";
        return (
          <div key={s.key} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors"
                style={{
                  backgroundColor: isActive || isDone ? "var(--primary, #3b82f6)" : "transparent",
                  border: isActive || isDone ? "none" : "1.5px solid var(--border, #d1d5db)",
                  color: isActive || isDone ? "#fff" : "var(--muted-foreground, #9ca3af)",
                }}
              >
                {isDone ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: isActive ? "var(--foreground, #111827)" : "var(--muted-foreground, #9ca3af)" }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-10 h-px mx-3" style={{ backgroundColor: isDone ? "var(--primary, #3b82f6)" : "var(--border, #e5e7eb)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PaymentOption({ selected, onClick, title, description }: { selected: boolean; onClick: () => void; title: string; description: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer"
      style={{
        borderColor: selected ? "var(--primary, #3b82f6)" : "var(--border, #e5e7eb)",
        backgroundColor: selected ? "color-mix(in srgb, var(--primary, #3b82f6) 6%, transparent)" : "transparent",
      }}
    >
      <div
        className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
        style={{ borderColor: selected ? "var(--primary, #3b82f6)" : "var(--border, #d1d5db)" }}
      >
        {selected && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary, #3b82f6)" }} />}
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--foreground, #111827)" }}>{title}</p>
        <p className="text-xs" style={{ color: "var(--muted-foreground, #9ca3af)" }}>{description}</p>
      </div>
    </button>
  );
}

function AddressFields({
  value,
  onChange,
  errors,
  prefix,
}: {
  value: AddressForm;
  onChange: (value: AddressForm) => void;
  errors: Record<string, string>;
  prefix: string;
}) {
  const set = (field: keyof AddressForm) => (v: string) => onChange({ ...value, [field]: v });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <FloatingInput id={`${prefix}line1`} label="Address line 1" value={value.line1} onChange={set("line1")} accentColor={BLUE} />
        {errors[`${prefix}line1`] && <p className="text-xs mt-1" style={{ color: "var(--destructive, #e11d48)" }}>{errors[`${prefix}line1`]}</p>}
      </div>
      <div className="sm:col-span-2">
        <FloatingInput id={`${prefix}line2`} label="Address line 2 (optional)" value={value.line2} onChange={set("line2")} accentColor={BLUE} />
      </div>
      <div>
        <FloatingInput id={`${prefix}city`} label="City" value={value.city} onChange={set("city")} accentColor={BLUE} />
        {errors[`${prefix}city`] && <p className="text-xs mt-1" style={{ color: "var(--destructive, #e11d48)" }}>{errors[`${prefix}city`]}</p>}
      </div>
      <div>
        <FloatingInput id={`${prefix}state`} label="State" value={value.state} onChange={set("state")} accentColor={BLUE} />
        {errors[`${prefix}state`] && <p className="text-xs mt-1" style={{ color: "var(--destructive, #e11d48)" }}>{errors[`${prefix}state`]}</p>}
      </div>
      <div>
        <FloatingInput id={`${prefix}country`} label="Country" value={value.country} onChange={set("country")} accentColor={BLUE} />
        {errors[`${prefix}country`] && <p className="text-xs mt-1" style={{ color: "var(--destructive, #e11d48)" }}>{errors[`${prefix}country`]}</p>}
      </div>
      <div>
        <FloatingInput id={`${prefix}zip`} label="ZIP" value={value.zip} onChange={set("zip")} accentColor={BLUE} />
        {errors[`${prefix}zip`] && <p className="text-xs mt-1" style={{ color: "var(--destructive, #e11d48)" }}>{errors[`${prefix}zip`]}</p>}
      </div>
    </div>
  );
}

function SavedAddressPicker({
  addresses,
  selectedId,
  onSelect,
}: {
  addresses: AccountAddress[];
  selectedId: string;
  onSelect: (address: AccountAddress | null) => void;
}) {
  if (addresses.length === 0) return null;
  return (
    <div className="mb-4">
      <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground, #6b7280)" }}>Use a saved address</label>
      <select
        value={selectedId}
        onChange={(e) => onSelect(addresses.find((a) => a.id === e.target.value) ?? null)}
        className={selectCls}
        style={selectStyle}
      >
        <option value="">+ Enter a new address</option>
        {addresses.map((a) => (
          <option key={a.id} value={a.id}>
            {a.label || a.name} — {a.line1}, {a.city}
          </option>
        ))}
      </select>
    </div>
  );
}

function AddressSummary({ address, label }: { address: AddressForm; label: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground, #9ca3af)" }}>{label}</p>
      <p className="text-sm" style={{ color: "var(--foreground, #374151)" }}>
        {address.line1}{address.line2 && `, ${address.line2}`}<br />
        {address.city}, {address.state} {address.zip}, {address.country}
      </p>
    </div>
  );
}

type Step = "details" | "review";

export default function Checkout({ orgId }: { orgId: string }) {
  const router = useRouter();
  const { cart, applyCoupon, removeCoupon } = useCart(orgId);
  const customer = useCustomerAuthStore((s) => s.customer);
  const adoptSession = useCustomerAuthStore((s) => s.adoptSession);
  const { stripeEnabled, publishableKey } = usePaymentMethods(orgId);
  const { addresses } = useAccountAddresses(orgId, !!customer);

  const [step, setStep] = useState<Step>("details");
  const [placedOrder, setPlacedOrder] = useState<{ id: string; orderNumber: string; paid: boolean } | null>(null);

  const [name, setName] = useState(customer?.name ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [selectedShippingId, setSelectedShippingId] = useState("");
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [selectedBillingId, setSelectedBillingId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // customer is null at mount until the persisted auth store finishes
  // rehydrating from localStorage — seeding name/email/phone via useState's
  // initial value misses that, so sync them once the real customer arrives.
  useEffect(() => {
    if (!customer) return;
    setName((v) => v || customer.name);
    setEmail((v) => v || customer.email);
    setPhone((v) => v || (customer.phone ?? ""));
  }, [customer]);

  // Prefill from the customer's default shipping address once their saved
  // addresses load — only on that first load, so it doesn't clobber manual edits.
  useEffect(() => {
    if (addresses.length === 0) return;
    const def = addresses.find((a) => a.isDefaultShipping) ?? addresses[0];
    setSelectedShippingId(def.id);
    setAddress(addressFromSaved(def));
    if (def.phone && !phone) setPhone(def.phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  const contactAndAddressValid = !!(
    name &&
    email &&
    address.line1 &&
    address.city &&
    address.state &&
    address.country &&
    address.zip &&
    (billingSameAsShipping || (billingAddress.line1 && billingAddress.city && billingAddress.state && billingAddress.country && billingAddress.zip))
  );

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email address";
    if (!address.line1.trim()) errs.line1 = "Address line 1 is required";
    if (!address.city.trim()) errs.city = "City is required";
    if (!address.state.trim()) errs.state = "State is required";
    if (!address.country.trim()) errs.country = "Country is required";
    if (!address.zip.trim()) errs.zip = "ZIP is required";
    if (!billingSameAsShipping) {
      if (!billingAddress.line1.trim()) errs.billingline1 = "Address line 1 is required";
      if (!billingAddress.city.trim()) errs.billingcity = "City is required";
      if (!billingAddress.state.trim()) errs.billingstate = "State is required";
      if (!billingAddress.country.trim()) errs.billingcountry = "Country is required";
      if (!billingAddress.zip.trim()) errs.billingzip = "ZIP is required";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goToReview = () => {
    if (!validate()) return;
    setStep("review");
  };

  const handlePlaceOrder = async (paymentIntentId?: string) => {
    if (!validate()) return;
    setError(null);
    setPlacing(true);
    try {
      const res = await storefrontFetch<CheckoutOrderResponse>(orgId, "/checkout", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          shippingAddress: { name, ...address, phone: phone || undefined },
          billingAddress: billingSameAsShipping ? undefined : { name, ...billingAddress, phone: phone || undefined },
          ...(paymentIntentId && { paymentIntentId }),
        }),
      });
      if (res.session) adoptSession(orgId, res.session);
      setPlacedOrder({ id: res.order.id, orderNumber: res.order.orderNumber, paid: !!paymentIntentId });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't place your order — please try again");
    } finally {
      setPlacing(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--primary, #3b82f6) 12%, transparent)" }}>
          <CheckCircle2 className="w-9 h-9" style={{ color: "var(--primary, #3b82f6)" }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground, #111827)" }}>Order placed!</h1>
        <p className="text-sm max-w-md" style={{ color: "var(--muted-foreground, #6b7280)" }}>
          {placedOrder.paid
            ? `Thanks — your payment went through and order ${placedOrder.orderNumber} is confirmed.`
            : `Order ${placedOrder.orderNumber} is confirmed. Payment will be collected on delivery/invoice.`}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            onClick={() => router.push(`/account/orders/${placedOrder.id}`)}
            className="px-6 py-3 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--primary, #3b82f6)" }}
          >
            View Order
          </button>
          <a
            href="/shop"
            className="px-6 py-3 rounded-full border text-sm font-semibold text-center"
            style={{ borderColor: "var(--border, #e5e7eb)", color: "var(--foreground, #111827)" }}
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <p className="text-lg font-semibold mb-4" style={{ color: "var(--foreground, #111827)" }}>Your cart is empty</p>
        <a href="/shop" style={{ color: "var(--primary, #3b82f6)" }}>Continue shopping</a>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground, #111827)" }}>Checkout</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted-foreground, #9ca3af)" }}>
        {cart.items.length} item{cart.items.length !== 1 ? "s" : ""} in your order
      </p>
      <Stepper step={step} />

      <div className="space-y-6">
        {step === "details" ? (
          <>
            {!customer && (
              <p className="text-sm -mt-2" style={{ color: "var(--muted-foreground, #6b7280)" }}>
                Checking out as a guest. <a href="/account" style={{ color: "var(--primary, #3b82f6)" }}>Sign in</a> if you have an account.
              </p>
            )}

            <Card>
              <CardHeading icon={User} title="Contact" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FloatingInput id="checkout-name" label="Full name" value={name} onChange={setName} accentColor={BLUE} />
                  {fieldErrors.name && <p className="text-xs mt-1" style={{ color: "var(--destructive, #e11d48)" }}>{fieldErrors.name}</p>}
                </div>
                <div>
                  <FloatingInput id="checkout-email" label="Email" type="email" value={email} onChange={setEmail} accentColor={BLUE} />
                  {fieldErrors.email && <p className="text-xs mt-1" style={{ color: "var(--destructive, #e11d48)" }}>{fieldErrors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <FloatingInput id="checkout-phone" label="Phone" value={phone} onChange={setPhone} accentColor={BLUE} />
                </div>
              </div>
            </Card>

            <Card>
              <CardHeading icon={MapPin} title="Shipping Address" />
              <SavedAddressPicker
                addresses={addresses}
                selectedId={selectedShippingId}
                onSelect={(a) => {
                  setSelectedShippingId(a?.id ?? "");
                  setAddress(a ? addressFromSaved(a) : EMPTY_ADDRESS);
                }}
              />
              <AddressFields value={address} onChange={setAddress} errors={fieldErrors} prefix="" />
            </Card>

            <Card>
              <CardHeading icon={CreditCard} title="Billing Address" />
              <label className="flex items-center gap-2.5 text-sm mb-4 cursor-pointer" style={{ color: "var(--muted-foreground, #6b7280)" }}>
                <input type="checkbox" checked={billingSameAsShipping} onChange={(e) => setBillingSameAsShipping(e.target.checked)} className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: "var(--primary, #3b82f6)" }} />
                Same as shipping address
              </label>
              {!billingSameAsShipping && (
                <>
                  <SavedAddressPicker
                    addresses={addresses}
                    selectedId={selectedBillingId}
                    onSelect={(a) => {
                      setSelectedBillingId(a?.id ?? "");
                      setBillingAddress(a ? addressFromSaved(a) : EMPTY_ADDRESS);
                    }}
                  />
                  <AddressFields value={billingAddress} onChange={setBillingAddress} errors={fieldErrors} prefix="billing" />
                </>
              )}
            </Card>

            <button
              onClick={goToReview}
              className="w-full py-3.5 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--primary, #3b82f6)" }}
            >
              Continue to Review
            </button>
          </>
        ) : (
          <Card>
            <CardHeading
              icon={MapPin}
              title="Contact & Address"
              action={
                <button onClick={() => setStep("details")} className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--primary, #3b82f6)" }}>
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              }
            />
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Contact</p>
                <p className="text-sm" style={{ color: "var(--foreground, #374151)" }}>{name} · {email}{phone && ` · ${phone}`}</p>
              </div>
              <AddressSummary address={address} label="Shipping Address" />
              <AddressSummary address={billingSameAsShipping ? address : billingAddress} label="Billing Address" />
            </div>
          </Card>
        )}

        <Card>
          <CardHeading icon={CreditCard} title="Order Summary" />
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm gap-2">
                <span className="line-clamp-1" style={{ color: "var(--muted-foreground, #6b7280)" }}>
                  {item.productName} × {item.quantity}
                </span>
                <span className="font-semibold shrink-0" style={{ color: "var(--foreground, #111827)" }}>{formatPrice(item.lineTotal, cart.currencyCode)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 text-sm pt-4 mt-4 border-t" style={{ borderColor: "var(--border, #e5e7eb)" }}>
            <div className="flex justify-between">
              <span style={{ color: "var(--muted-foreground, #6b7280)" }}>Subtotal</span>
              <span className="font-semibold" style={{ color: "var(--foreground, #111827)" }}>{formatPrice(cart.subtotal, cart.currencyCode)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between">
                <span style={{ color: "var(--muted-foreground, #6b7280)" }}>Discount</span>
                <span className="font-semibold text-emerald-600">-{formatPrice(cart.discount, cart.currencyCode)}</span>
              </div>
            )}
            <div className="flex justify-between text-base pt-2 mt-1 border-t" style={{ borderColor: "var(--border, #e5e7eb)" }}>
              <span className="font-bold" style={{ color: "var(--foreground, #111827)" }}>Total</span>
              <span className="font-bold" style={{ color: "var(--foreground, #111827)" }}>{formatPrice(cart.total, cart.currencyCode)}</span>
            </div>
          </div>

          <div className="mt-4">
            <CouponInput couponCode={cart.couponCode} discount={cart.discount} currencyCode={cart.currencyCode} onApply={applyCoupon} onRemove={removeCoupon} />
          </div>

          {step === "review" && (
            <div className="mt-6 pt-6 border-t space-y-4" style={{ borderColor: "var(--border, #e5e7eb)" }}>
              {stripeEnabled && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--muted-foreground, #9ca3af)" }}>Payment Method</h3>
                  <PaymentOption
                    selected={paymentMethod === "card"}
                    onClick={() => setPaymentMethod("card")}
                    title="Pay Online"
                    description="Credit or debit card, via Stripe"
                  />
                  <PaymentOption
                    selected={paymentMethod === "cod"}
                    onClick={() => setPaymentMethod("cod")}
                    title="Cash on Delivery"
                    description="Pay by invoice when your order arrives"
                  />
                </div>
              )}

              {error && <p className="text-xs text-rose-500">{error}</p>}

              {stripeEnabled && paymentMethod === "card" && publishableKey ? (
                <StripePaymentStep
                  orgId={orgId}
                  publishableKey={publishableKey}
                  accentColor={BLUE}
                  disabled={!contactAndAddressValid || placing}
                  onSuccess={(paymentIntentId) => handlePlaceOrder(paymentIntentId)}
                />
              ) : (
                <button
                  onClick={() => handlePlaceOrder()}
                  disabled={placing}
                  className="w-full py-3.5 rounded-full text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary, #3b82f6)" }}
                >
                  {placing ? "Placing Order…" : "Place Order"}
                </button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
