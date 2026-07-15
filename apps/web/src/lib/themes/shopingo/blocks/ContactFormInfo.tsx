"use client";

import type { ContactFormInfoData } from "@/lib/themes/types";
import { useContactFormSubmit, ContactRecaptchaScript } from "@/lib/themes/useContactFormSubmit";

const ORANGE = "#e4611e";

export default function ContactFormInfo({ data, orgId }: { data: ContactFormInfoData; orgId?: string }) {
  const phoneLines = data.phoneLines?.length ? data.phoneLines : [];
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
    <section className="py-16 bg-white dark:bg-[#151518]">
      <ContactRecaptchaScript active={captchaActive} siteKey={recaptchaSiteKey} onReady={markRecaptchaReady} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* ── Contact Form ── */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
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
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                  {data.formTitle ?? "Drop Us a Line"}
                </h2>
                {data.formSubtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{data.formSubtitle}</p>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <FormField label="Enter Your Name">
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={values.name}
                      onChange={(e) => setField("name", e.target.value)}
                      disabled={submitting}
                      className="shopingo-cfi-input"
                    />
                  </FormField>
                  <FormField label="Enter Email">
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={values.email}
                      onChange={(e) => setField("email", e.target.value)}
                      disabled={submitting}
                      className="shopingo-cfi-input"
                    />
                  </FormField>
                  <FormField label="Phone Number">
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={values.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      disabled={submitting}
                      className="shopingo-cfi-input"
                    />
                  </FormField>
                  <FormField label="Message">
                    <textarea
                      rows={5}
                      placeholder="Write your message here…"
                      value={values.message}
                      onChange={(e) => setField("message", e.target.value)}
                      disabled={submitting}
                      className="shopingo-cfi-input resize-y"
                    />
                  </FormField>

                  {error && <p className="text-xs text-rose-500">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="self-start px-8 py-3 rounded-lg text-sm font-bold text-white bg-[#212529] transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {submitting ? "Sending…" : (data.submitText ?? "Send Message")}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* ── Info Panel ── */}
          <div className="bg-[#f8f8f8] dark:bg-[#1c1c1e] rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
            {data.address && (
              <InfoRow label={data.addressLabel ?? "Address"}>
                <span className="whitespace-pre-line">{data.address}</span>
              </InfoRow>
            )}
            {phoneLines.length > 0 && (
              <InfoRow label={data.phoneLabel ?? "Phone"}>
                {phoneLines.map((line, i) => <span key={i} className="block">{line}</span>)}
              </InfoRow>
            )}
            {data.email && (
              <InfoRow label={data.emailLabel ?? "Email"}>
                <span style={{ color: ORANGE }}>{data.email}</span>
              </InfoRow>
            )}
            {data.workingDays && (
              <InfoRow label={data.workingDaysLabel ?? "Working Days"} last>
                {data.workingDays}
              </InfoRow>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .shopingo-cfi-input {
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
        .shopingo-cfi-input:focus {
          border-color: ${ORANGE};
        }
        .dark .shopingo-cfi-input {
          background: #2a2a2e;
          border-color: #3f3f46;
          color: #e4e4e7;
        }
        .dark .shopingo-cfi-input:focus {
          border-color: ${ORANGE};
        }
      `}</style>
    </section>
  );
}

function InfoRow({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`py-4 ${last ? "" : "border-b border-gray-200 dark:border-gray-700"}`}>
      <p className="font-semibold text-gray-800 dark:text-gray-100 text-base mb-1">{label}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{children}</p>
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
