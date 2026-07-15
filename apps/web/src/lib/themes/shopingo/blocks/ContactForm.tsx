"use client";

import type { ContactFormData } from "@/lib/themes/types";
import { useContactFormSubmit, ContactRecaptchaScript } from "@/lib/themes/useContactFormSubmit";

const ORANGE = "#e4611e";

export default function ContactForm({ data, orgId }: { data: ContactFormData; orgId?: string }) {
  const subjects = data.subjects?.length
    ? data.subjects
    : ["Order Inquiry", "Return & Refund", "Product Question", "Partnership", "Other"];
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
    <section className="py-16 bg-[#f5f5f5] dark:bg-[#151518]">
      <ContactRecaptchaScript active={captchaActive} siteKey={recaptchaSiteKey} onReady={markRecaptchaReady} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* ── Contact Info ── */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              {data.infoTitle ?? "Contact Information"}
            </h2>

            <div className="flex flex-col gap-5">
              {data.address && (
                <InfoRow icon="📍" label="Our Address">
                  <span className="whitespace-pre-line">{data.address}</span>
                </InfoRow>
              )}
              {data.phone && (
                <InfoRow icon="📞" label="Phone">{data.phone}</InfoRow>
              )}
              {data.email && (
                <InfoRow icon="✉️" label="Email">{data.email}</InfoRow>
              )}
            </div>

            {hours.length > 0 && (
              <div className="mt-8 p-5 rounded-xl bg-[#212529]">
                <p className="font-semibold text-white mb-4">Business Hours</p>
                <div className="flex flex-col gap-2">
                  {hours.map((h, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-400">{h.day}</span>
                      <span style={{ color: h.time.toLowerCase() === "closed" ? "#aaa" : ORANGE }}>
                        {h.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.mapEmbedUrl && (
              <div className="mt-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: 220 }}>
                <iframe
                  src={data.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  title="Store location map"
                />
              </div>
            )}
          </div>

          {/* ── Contact Form ── */}
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 shadow-lg border border-transparent dark:border-gray-700">
            {submitted ? (
              <div className="text-center py-10">
                <p className="text-xl font-bold text-gray-800 dark:text-white mb-1">Thank you!</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  We&apos;ve received your message and will get back to you soon.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="text-sm font-semibold hover:opacity-80"
                  style={{ color: ORANGE }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                  {data.formTitle ?? "Send Us a Message"}
                </h2>
                {data.formSubtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{data.formSubtitle}</p>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <FormField label="Full Name">
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={values.name}
                      onChange={(e) => setField("name", e.target.value)}
                      disabled={submitting}
                      className="shopingo-input"
                    />
                  </FormField>
                  <FormField label="Email Address">
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={values.email}
                      onChange={(e) => setField("email", e.target.value)}
                      disabled={submitting}
                      className="shopingo-input"
                    />
                  </FormField>
                  <FormField label="Phone Number">
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={values.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      disabled={submitting}
                      className="shopingo-input"
                    />
                  </FormField>
                  <FormField label="Subject">
                    <select
                      value={values.subject}
                      onChange={(e) => setField("subject", e.target.value)}
                      disabled={submitting}
                      className="shopingo-input"
                    >
                      <option value="">Select a subject…</option>
                      {subjects.map((s, i) => <option key={i}>{s}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Message">
                    <textarea
                      rows={4}
                      placeholder="Write your message here…"
                      value={values.message}
                      onChange={(e) => setField("message", e.target.value)}
                      disabled={submitting}
                      className="shopingo-input resize-y"
                    />
                  </FormField>

                  {error && <p className="text-xs text-rose-500">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-lg text-sm font-bold text-white bg-[#e4611e] transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {submitting ? "Sending…" : "Send Message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .shopingo-input {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #e1e1e1;
          border-radius: 8px;
          font-size: 14px;
          color: #212529;
          background: #fff;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s, background 0.15s, color 0.15s;
        }
        .shopingo-input:focus {
          border-color: ${ORANGE};
        }
        .dark .shopingo-input {
          background: #2a2a2e;
          border-color: #3f3f46;
          color: #e4e4e7;
        }
        .dark .shopingo-input:focus {
          border-color: ${ORANGE};
        }
      `}</style>
    </section>
  );
}

function InfoRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg bg-[#e4611e] text-white">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1 text-sm">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
