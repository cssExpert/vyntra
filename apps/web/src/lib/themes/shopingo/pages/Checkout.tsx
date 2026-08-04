"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/themes/useCart";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { useAccountAddresses, type AccountAddress } from "@/lib/themes/useAccount";
import { CouponInput } from "@/lib/themes/shared/CouponInput";
import { storefrontFetch, ApiError } from "@/lib/storefrontApi";
import { usePaymentMethods } from "@/lib/themes/usePaymentMethods";
import { StripePaymentStep } from "@/lib/themes/shared/StripePaymentStep";

const ORANGE = "#e4611e";

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

const inputCls = "w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] rounded outline-none focus:border-[#e4611e]";
const errorCls = "border-rose-400 dark:border-rose-500";

type AddressForm = { line1: string; line2: string; city: string; state: string; country: string; zip: string };
const EMPTY_ADDRESS: AddressForm = { line1: "", line2: "", city: "", state: "", country: "", zip: "" };

function addressFromSaved(a: AccountAddress): AddressForm {
  return { line1: a.line1, line2: a.line2 ?? "", city: a.city, state: a.state, country: a.country, zip: a.zip };
}

interface CheckoutOrderResponse {
  order: { id: string; orderNumber: string };
  session?: { customer: { id: string; name: string; email: string; phone: string | null }; accessToken: string; refreshToken: string };
}

interface AddressFieldsProps {
  value: AddressForm;
  onChange: (value: AddressForm) => void;
  errors: Record<string, string>;
  prefix: string;
}

function AddressFields({ value, onChange, errors, prefix }: AddressFieldsProps) {
  const set = (field: keyof AddressForm) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [field]: e.target.value });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="sm:col-span-2">
        <input placeholder="Address line 1" value={value.line1} onChange={set("line1")} className={`${inputCls} ${errors[`${prefix}line1`] ? errorCls : ""}`} />
        {errors[`${prefix}line1`] && <p className="text-xs text-rose-500 mt-1">{errors[`${prefix}line1`]}</p>}
      </div>
      <input placeholder="Address line 2 (optional)" value={value.line2} onChange={set("line2")} className={`${inputCls} sm:col-span-2`} />
      <div>
        <input placeholder="City" value={value.city} onChange={set("city")} className={`${inputCls} ${errors[`${prefix}city`] ? errorCls : ""}`} />
        {errors[`${prefix}city`] && <p className="text-xs text-rose-500 mt-1">{errors[`${prefix}city`]}</p>}
      </div>
      <div>
        <input placeholder="State / Province" value={value.state} onChange={set("state")} className={`${inputCls} ${errors[`${prefix}state`] ? errorCls : ""}`} />
        {errors[`${prefix}state`] && <p className="text-xs text-rose-500 mt-1">{errors[`${prefix}state`]}</p>}
      </div>
      <div>
        <input placeholder="Country" value={value.country} onChange={set("country")} className={`${inputCls} ${errors[`${prefix}country`] ? errorCls : ""}`} />
        {errors[`${prefix}country`] && <p className="text-xs text-rose-500 mt-1">{errors[`${prefix}country`]}</p>}
      </div>
      <div>
        <input placeholder="ZIP / Postal code" value={value.zip} onChange={set("zip")} className={`${inputCls} ${errors[`${prefix}zip`] ? errorCls : ""}`} />
        {errors[`${prefix}zip`] && <p className="text-xs text-rose-500 mt-1">{errors[`${prefix}zip`]}</p>}
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
    <div className="mb-3">
      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Use a saved address</label>
      <select
        value={selectedId}
        onChange={(e) => onSelect(addresses.find((a) => a.id === e.target.value) ?? null)}
        className={inputCls}
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
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 dark:text-white">
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
    if (!address.zip.trim()) errs.zip = "ZIP / postal code is required";
    if (!billingSameAsShipping) {
      if (!billingAddress.line1.trim()) errs.billingline1 = "Address line 1 is required";
      if (!billingAddress.city.trim()) errs.billingcity = "City is required";
      if (!billingAddress.state.trim()) errs.billingstate = "State is required";
      if (!billingAddress.country.trim()) errs.billingcountry = "Country is required";
      if (!billingAddress.zip.trim()) errs.billingzip = "ZIP / postal code is required";
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
      <section className="py-24 bg-white dark:bg-[#121214] min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${ORANGE}1a` }}>
          <CheckCircle2 className="w-9 h-9" style={{ color: ORANGE }} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>
          Order placed!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          {placedOrder.paid
            ? `Thanks — your payment went through and order ${placedOrder.orderNumber} is confirmed.`
            : `Order ${placedOrder.orderNumber} is confirmed. Payment will be collected on delivery/invoice.`}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            onClick={() => router.push(`/account/orders/${placedOrder.id}`)}
            className="px-6 py-3 rounded bg-[#e4611e] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#c9540f] transition-colors"
          >
            View Order
          </button>
          <a href="/shop" className="px-6 py-3 rounded border border-gray-200 dark:border-gray-700 text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-center">
            Continue Shopping
          </a>
        </div>
      </section>
    );
  }

  if (cart.items.length === 0) {
    return (
      <section className="py-24 bg-white dark:bg-[#121214] min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Your cart is empty</p>
        <a href="/shop" className="text-sm underline" style={{ color: ORANGE }}>Continue shopping</a>
      </section>
    );
  }

  return (
    <section className="py-10 bg-white dark:bg-[#121214] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
          Checkout
        </h1>
        <div className="flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-wide">
          <span style={{ color: step === "details" ? ORANGE : "#9ca3af" }}>1. Details</span>
          <span className="text-gray-300 dark:text-gray-700">—</span>
          <span style={{ color: step === "review" ? ORANGE : "#9ca3af" }}>2. Review &amp; Pay</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {step === "details" ? (
              <>
                {!customer && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Checking out as a guest.{" "}
                    <a href="/account" className="font-semibold hover:underline" style={{ color: ORANGE }}>Sign in</a> if you have an account.
                  </p>
                )}

                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white mb-3">Contact</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} ${fieldErrors.name ? errorCls : ""}`} />
                      {fieldErrors.name && <p className="text-xs text-rose-500 mt-1">{fieldErrors.name}</p>}
                    </div>
                    <div>
                      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputCls} ${fieldErrors.email ? errorCls : ""}`} />
                      {fieldErrors.email && <p className="text-xs text-rose-500 mt-1">{fieldErrors.email}</p>}
                    </div>
                    <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inputCls} sm:col-span-2`} />
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white mb-3">Shipping Address</h2>
                  <SavedAddressPicker
                    addresses={addresses}
                    selectedId={selectedShippingId}
                    onSelect={(a) => {
                      setSelectedShippingId(a?.id ?? "");
                      setAddress(a ? addressFromSaved(a) : EMPTY_ADDRESS);
                    }}
                  />
                  <AddressFields value={address} onChange={setAddress} errors={fieldErrors} prefix="" />
                </div>

                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white mb-3">Billing Address</h2>
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 cursor-pointer">
                    <input type="checkbox" checked={billingSameAsShipping} onChange={(e) => setBillingSameAsShipping(e.target.checked)} />
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
                </div>

                <button
                  onClick={goToReview}
                  className="w-full sm:w-auto px-8 py-3.5 rounded bg-[#e4611e] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#c9540f] transition-colors"
                >
                  Continue to Review
                </button>
              </>
            ) : (
              <>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">Contact &amp; Address</h2>
                    <button onClick={() => setStep("details")} className="text-xs font-semibold hover:underline" style={{ color: ORANGE }}>Edit</button>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Contact</p>
                    <p className="text-sm text-gray-900 dark:text-white">{name} · {email}{phone && ` · ${phone}`}</p>
                  </div>
                  <AddressSummary address={address} label="Shipping Address" />
                  <AddressSummary address={billingSameAsShipping ? address : billingAddress} label="Billing Address" />
                </div>
              </>
            )}
          </div>

          <div className="space-y-5">
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">Order Summary</h2>
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm gap-2">
                    <span className="text-gray-600 dark:text-gray-400 line-clamp-1">
                      {item.productName} {item.variantLabel && `(${item.variantLabel})`} × {item.quantity}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white shrink-0">{formatPrice(item.lineTotal, cart.currencyCode)}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 text-sm pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(cart.subtotal, cart.currencyCode)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Discount</span>
                    <span className="font-semibold text-emerald-600">-{formatPrice(cart.discount, cart.currencyCode)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base pt-1">
                  <span className="font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatPrice(cart.total, cart.currencyCode)}</span>
                </div>
              </div>

              <CouponInput
                couponCode={cart.couponCode}
                discount={cart.discount}
                currencyCode={cart.currencyCode}
                onApply={applyCoupon}
                onRemove={removeCoupon}
                accentColor={ORANGE}
              />

              {step === "review" && (
                <>
                  {stripeEnabled && (
                    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">Payment</h2>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                          <input type="radio" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                          Pay Online (Card)
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                          <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                          Cash on Delivery / Invoice
                        </label>
                      </div>
                    </div>
                  )}

                  {error && <p className="text-xs text-rose-500">{error}</p>}

                  {stripeEnabled && paymentMethod === "card" && publishableKey ? (
                    <StripePaymentStep
                      orgId={orgId}
                      publishableKey={publishableKey}
                      accentColor={ORANGE}
                      disabled={!contactAndAddressValid || placing}
                      onSuccess={(paymentIntentId) => handlePlaceOrder(paymentIntentId)}
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => handlePlaceOrder()}
                        disabled={placing}
                        className="w-full py-3.5 rounded bg-[#e4611e] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#c9540f] transition-colors disabled:opacity-50"
                      >
                        {placing ? "Placing Order…" : "Place Order"}
                      </button>
                      {!stripeEnabled && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center">Payment collected on delivery/invoice — no card required at checkout.</p>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
