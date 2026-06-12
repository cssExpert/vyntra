"use client";

import type { ContactFormData } from "@/lib/themes/types";

const ORANGE = "#e4611e";
const DARK = "#212529";

export default function ContactForm({ data }: { data: ContactFormData }) {
  const subjects = data.subjects?.length
    ? data.subjects
    : ["Order Inquiry", "Return & Refund", "Product Question", "Partnership", "Other"];
  const hours = data.hours ?? [];

  return (
    <section style={{ background: "#f5f5f5", padding: "64px 0" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* ── Contact Info ── */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {data.infoTitle ?? "Contact Information"}
            </h2>

            <div className="flex flex-col gap-5">
              {data.address && (
                <InfoRow icon="📍" label="Our Address">
                  <span className="whitespace-pre-line">{data.address}</span>
                </InfoRow>
              )}
              {data.phone && (
                <InfoRow icon="📞" label="Phone">
                  {data.phone}
                </InfoRow>
              )}
              {data.email && (
                <InfoRow icon="✉️" label="Email">
                  {data.email}
                </InfoRow>
              )}
            </div>

            {hours.length > 0 && (
              <div
                className="mt-8 p-5 rounded-xl"
                style={{ background: DARK }}
              >
                <p className="font-semibold text-white mb-4">Business Hours</p>
                <div className="flex flex-col gap-2">
                  {hours.map((h, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-400">{h.day}</span>
                      <span
                        style={{
                          color:
                            h.time.toLowerCase() === "closed" ? "#aaa" : ORANGE,
                        }}
                      >
                        {h.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.mapEmbedUrl && (
              <div
                className="mt-6 rounded-xl overflow-hidden border border-gray-200"
                style={{ height: 220 }}
              >
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
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              {data.formTitle ?? "Send Us a Message"}
            </h2>
            {data.formSubtitle && (
              <p className="text-sm text-gray-500 mb-6">{data.formSubtitle}</p>
            )}

            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField label="First Name">
                  <input
                    type="text"
                    placeholder="John"
                    className="form-input"
                  />
                </FormField>
                <FormField label="Last Name">
                  <input
                    type="text"
                    placeholder="Doe"
                    className="form-input"
                  />
                </FormField>
              </div>

              <FormField label="Email Address">
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="form-input"
                />
              </FormField>

              <FormField label="Phone Number">
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="form-input"
                />
              </FormField>

              <FormField label="Subject">
                <select className="form-input bg-white">
                  {subjects.map((s, i) => (
                    <option key={i}>{s}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Message">
                <textarea
                  rows={4}
                  placeholder="Write your message here…"
                  className="form-input resize-y"
                />
              </FormField>

              <button
                type="submit"
                className="w-full py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: ORANGE }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #e1e1e1;
          border-radius: 8px;
          font-size: 14px;
          color: #212529;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .form-input:focus {
          border-color: ${ORANGE};
        }
      `}</style>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg"
        style={{ background: ORANGE, color: "#fff" }}
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-800 mb-1 text-sm">{label}</p>
        <p className="text-sm text-gray-500 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
