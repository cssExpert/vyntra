"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/themes/useCart";
import { useCustomerAuthStore } from "@/store/customerAuthStore";
import { useAccountAddresses, type AccountAddress } from "@/lib/themes/useAccount";
import { CouponInput } from "@/lib/themes/shared/CouponInput";
import { storefrontFetch, ApiError } from "@/lib/storefrontApi";
import { useStorefrontToastStore } from "@/store/storefrontToastStore";
import { usePaymentMethods } from "@/lib/themes/usePaymentMethods";
import { StripePaymentStep } from "@/lib/themes/shared/StripePaymentStep";

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

const inputCls = "w-full px-3.5 py-2.5 text-sm border rounded outline-none";
const inputStyle = { borderColor: "var(--border, #e5e7eb)" };
const errorInputStyle = { borderColor: "var(--destructive, #e11d48)" };

type AddressForm = { line1: string; line2: string; city: string; state: string; country: string; zip: string };
const EMPTY_ADDRESS: AddressForm = { line1: "", line2: "", city: "", state: "", country: "", zip: "" };

function addressFromSaved(a: AccountAddress): AddressForm {
  return { line1: a.line1, line2: a.line2 ?? "", city: a.city, state: a.state, country: a.country, zip: a.zip };
}

interface CheckoutOrderResponse {
  order: { id: string; orderNumber: string };
  session?: { customer: { id: string; name: string; email: string; phone: string | null }; accessToken: string; refreshToken: string };
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
  const set = (field: keyof AddressForm) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [field]: e.target.value });
  return (
    <>
      <div>
        <input placeholder="Address line 1" value={value.line1} onChange={set("line1")} className={inputCls} style={errors[`${prefix}line1`] ? errorInputStyle : inputStyle} />
        {errors[`${prefix}line1`] && <p className="text-xs mt-1" style={{ color: "var(--destructive, #e11d48)" }}>{errors[`${prefix}line1`]}</p>}
      </div>
      <input placeholder="Address line 2 (optional)" value={value.line2} onChange={set("line2")} className={inputCls} style={inputStyle} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input placeholder="City" value={value.city} onChange={set("city")} className={inputCls} style={errors[`${prefix}city`] ? errorInputStyle : inputStyle} />
          {errors[`${prefix}city`] && <p className="text-xs mt-1" style={{ color: "var(--destructive, #e11d48)" }}>{errors[`${prefix}city`]}</p>}
        </div>
        <div>
          <input placeholder="State" value={value.state} onChange={set("state")} className={inputCls} style={errors[`${prefix}state`] ? errorInputStyle : inputStyle} />
          {errors[`${prefix}state`] && <p className="text-xs mt-1" style={{ color: "var(--destructive, #e11d48)" }}>{errors[`${prefix}state`]}</p>}
        </div>
        <div>
          <input placeholder="Country" value={value.country} onChange={set("country")} className={inputCls} style={errors[`${prefix}country`] ? errorInputStyle : inputStyle} />
          {errors[`${prefix}country`] && <p className="text-xs mt-1" style={{ color: "var(--destructive, #e11d48)" }}>{errors[`${prefix}country`]}</p>}
        </div>
        <div>
          <input placeholder="ZIP" value={value.zip} onChange={set("zip")} className={inputCls} style={errors[`${prefix}zip`] ? errorInputStyle : inputStyle} />
          {errors[`${prefix}zip`] && <p className="text-xs mt-1" style={{ color: "var(--destructive, #e11d48)" }}>{errors[`${prefix}zip`]}</p>}
        </div>
      </div>
    </>
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
    <div>
      <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground, #6b7280)" }}>Use a saved address</label>
      <select
        value={selectedId}
        onChange={(e) => onSelect(addresses.find((a) => a.id === e.target.value) ?? null)}
        className={inputCls}
        style={inputStyle}
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

export default function Checkout({ orgId }: { orgId: string }) {
  const router = useRouter();
  const { cart, applyCoupon, removeCoupon } = useCart(orgId);
  const customer = useCustomerAuthStore((s) => s.customer);
  const adoptSession = useCustomerAuthStore((s) => s.adoptSession);
  const addToast = useStorefrontToastStore((s) => s.addToast);
  const { stripeEnabled, publishableKey } = usePaymentMethods(orgId);
  const { addresses } = useAccountAddresses(orgId, !!customer);

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
      addToast("Order placed successfully!", "success");
      router.push(`/account/orders/${res.order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't place your order — please try again");
    } finally {
      setPlacing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <p className="text-lg font-semibold mb-4" style={{ color: "var(--foreground, #111827)" }}>Your cart is empty</p>
        <a href="/shop" style={{ color: "var(--primary, #3b82f6)" }}>Continue shopping</a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--foreground, #111827)" }}>Checkout</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        <div className="space-y-6">
          {!customer && (
            <p className="text-sm" style={{ color: "var(--muted-foreground, #6b7280)" }}>
              Checking out as a guest. <a href="/account" style={{ color: "var(--primary, #3b82f6)" }}>Sign in</a> if you have an account.
            </p>
          )}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground, #111827)" }}>Contact</h2>
            <div>
              <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} style={fieldErrors.name ? errorInputStyle : inputStyle} />
              {fieldErrors.name && <p className="text-xs mt-1" style={{ color: "var(--destructive, #e11d48)" }}>{fieldErrors.name}</p>}
            </div>
            <div>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} style={fieldErrors.email ? errorInputStyle : inputStyle} />
              {fieldErrors.email && <p className="text-xs mt-1" style={{ color: "var(--destructive, #e11d48)" }}>{fieldErrors.email}</p>}
            </div>
            <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} style={inputStyle} />
          </div>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground, #111827)" }}>Shipping Address</h2>
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
          <div className="space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground, #111827)" }}>Billing Address</h2>
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--muted-foreground, #6b7280)" }}>
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
        </div>

        <div className="border rounded-lg p-5 space-y-4 h-fit" style={{ borderColor: "var(--border, #e5e7eb)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground, #111827)" }}>Order Summary</h2>
          <ul className="space-y-2 max-h-56 overflow-y-auto">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm gap-2">
                <span className="line-clamp-1" style={{ color: "var(--muted-foreground, #6b7280)" }}>
                  {item.productName} × {item.quantity}
                </span>
                <span className="font-semibold shrink-0" style={{ color: "var(--foreground, #111827)" }}>{formatPrice(item.lineTotal, cart.currencyCode)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 text-sm pt-2 border-t" style={{ borderColor: "var(--border, #e5e7eb)" }}>
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
            <div className="flex justify-between text-base">
              <span className="font-bold" style={{ color: "var(--foreground, #111827)" }}>Total</span>
              <span className="font-bold" style={{ color: "var(--foreground, #111827)" }}>{formatPrice(cart.total, cart.currencyCode)}</span>
            </div>
          </div>

          <CouponInput couponCode={cart.couponCode} discount={cart.discount} currencyCode={cart.currencyCode} onApply={applyCoupon} onRemove={removeCoupon} />

          {stripeEnabled && (
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--border, #e5e7eb)" }}>
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground, #111827)" }}>Payment</h2>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--foreground, #111827)" }}>
                  <input type="radio" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                  Pay Online (Card)
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--foreground, #111827)" }}>
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
              accentColor="#3b82f6"
              disabled={!contactAndAddressValid || placing}
              onSuccess={(paymentIntentId) => handlePlaceOrder(paymentIntentId)}
            />
          ) : (
            <button
              onClick={() => handlePlaceOrder()}
              disabled={placing}
              className="w-full py-3 rounded text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--primary, #3b82f6)" }}
            >
              {placing ? "Placing Order…" : "Place Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
