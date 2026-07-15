"use client";

import type { ContactFormData } from "@/lib/themes/types";
import { useContactFormSubmit, ContactRecaptchaScript } from "@/lib/themes/useContactFormSubmit";

export default function ContactForm({ data, orgId }: { data: ContactFormData; orgId?: string }) {
  const subjects = data.subjects?.length
    ? data.subjects
    : ["Order Inquiry", "Return & Refund", "Product Question", "Other"];
  const hours = data.hours ?? [];
  const {
    values,
    setField,
    submitting,
    submitted,
    error,
    handleSubmit,
    reset,
    captchaActive,
    recaptchaSiteKey,
    markRecaptchaReady,
  } = useContactFormSubmit(orgId);

  return (
    <section className="py-14 bg-gray-50">
      <ContactRecaptchaScript active={captchaActive} siteKey={recaptchaSiteKey} onReady={markRecaptchaReady} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">{data.infoTitle ?? "Contact Information"}</h2>
            {data.address && <p className="text-gray-600 text-sm mb-2"><strong>Address:</strong> {data.address}</p>}
            {data.phone && <p className="text-gray-600 text-sm mb-2"><strong>Phone:</strong> {data.phone}</p>}
            {data.email && <p className="text-gray-600 text-sm mb-4"><strong>Email:</strong> {data.email}</p>}
            {hours.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="font-semibold text-white mb-3 text-sm">Business Hours</p>
                {hours.map((h, i) => (
                  <div key={i} className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{h.day}</span>
                    <span className="text-orange-400">{h.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            {submitted ? (
              <div className="text-center py-6">
                <p className="text-lg font-bold text-gray-800 mb-1">Thank you!</p>
                <p className="text-sm text-gray-500 mb-4">We&apos;ve received your message and will get back to you soon.</p>
                <button
                  type="button"
                  onClick={reset}
                  className="text-sm font-semibold text-orange-500 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-800 mb-4">{data.formTitle ?? "Send Us a Message"}</h2>
                <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={values.name}
                    onChange={(e) => setField("name", e.target.value)}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={values.email}
                    onChange={(e) => setField("email", e.target.value)}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={values.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                  />
                  <select
                    value={values.subject}
                    onChange={(e) => setField("subject", e.target.value)}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:opacity-50"
                  >
                    <option value="">Select a subject…</option>
                    {subjects.map((s, i) => <option key={i}>{s}</option>)}
                  </select>
                  <textarea
                    rows={4}
                    placeholder="Your message…"
                    value={values.message}
                    onChange={(e) => setField("message", e.target.value)}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y disabled:opacity-50"
                  />
                  {error && <p className="text-xs text-rose-500">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-orange-500 text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                  >
                    {submitting ? "Sending…" : "Send Message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
