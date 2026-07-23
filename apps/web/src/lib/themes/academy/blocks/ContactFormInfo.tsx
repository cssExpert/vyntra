"use client";

import type { ContactFormInfoData } from "@/lib/themes/types";
import { useContactFormSubmit, ContactRecaptchaScript } from "@/lib/themes/useContactFormSubmit";
import { NAVY, GOLD, SERIF } from "../theme";

export default function ContactFormInfo({ data, orgId }: { data: ContactFormInfoData; orgId?: string }) {
  const phoneLines = data.phoneLines?.length ? data.phoneLines : [];
  const departments = data.departments?.length ? data.departments : [];
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
    <section className="py-20 bg-white">
      <ContactRecaptchaScript active={captchaActive} siteKey={recaptchaSiteKey} onReady={markRecaptchaReady} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 rounded-lg p-8" style={{ border: `1px solid ${GOLD}44` }}>
            {submitted ? (
              <div className="text-center py-10">
                <p className="text-xl font-bold mb-1" style={{ fontFamily: SERIF, color: NAVY }}>Thank you!</p>
                <p className="text-sm text-gray-500 mb-4">We&apos;ve received your message and will get back to you soon.</p>
                <button type="button" onClick={reset} className="text-sm font-semibold hover:opacity-80" style={{ color: GOLD }}>
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: SERIF, color: NAVY }}>
                  {data.formTitle ?? "Send a Message"}
                </h2>
                {data.formSubtitle && <p className="text-sm text-gray-500 mb-6">{data.formSubtitle}</p>}

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={values.name}
                    onChange={(e) => setField("name", e.target.value)}
                    disabled={submitting}
                    className="academy-cfi-input"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={values.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    disabled={submitting}
                    className="academy-cfi-input"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={values.email}
                    onChange={(e) => setField("email", e.target.value)}
                    disabled={submitting}
                    className="academy-cfi-input"
                  />
                  {departments.length > 0 && (
                    <select
                      value={values.subject ?? ""}
                      onChange={(e) => setField("subject", e.target.value)}
                      disabled={submitting}
                      className="academy-cfi-input"
                    >
                      <option value="" disabled>Department</option>
                      {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
                    </select>
                  )}
                  <textarea
                    rows={5}
                    placeholder="How can we help?"
                    value={values.message}
                    onChange={(e) => setField("message", e.target.value)}
                    disabled={submitting}
                    className="academy-cfi-input resize-y"
                  />
                  {error && <p className="text-xs text-rose-500">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="self-start px-7 py-3 rounded text-sm font-semibold disabled:opacity-60"
                    style={{ background: NAVY, color: "#fff" }}
                  >
                    {submitting ? "Sending…" : (data.submitText ?? "Send Message")}
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="rounded-lg p-8" style={{ background: "#faf8f4" }}>
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
                <span style={{ color: GOLD }}>{data.email}</span>
              </InfoRow>
            )}
            {data.workingDays && (
              <InfoRow label={data.workingDaysLabel ?? "Office Hours"} last>
                {data.workingDays}
              </InfoRow>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .academy-cfi-input {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #e1ddd0;
          border-radius: 6px;
          font-size: 14px;
          color: ${NAVY};
          background: #fff;
          outline: none;
          box-sizing: border-box;
        }
        .academy-cfi-input:focus { border-color: ${GOLD}; }
      `}</style>
    </section>
  );
}

function InfoRow({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className="py-4" style={last ? {} : { borderBottom: "1px solid #e8e2d5" }}>
      <p className="font-semibold text-base mb-1" style={{ fontFamily: SERIF, color: NAVY }}>{label}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}
