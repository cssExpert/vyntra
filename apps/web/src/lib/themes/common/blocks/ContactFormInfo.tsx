"use client";

import type { ContactFormInfoData } from "@/lib/themes/types";

export default function ContactFormInfo({ data }: { data: ContactFormInfoData }) {
  const phoneLines = data.phoneLines?.length ? data.phoneLines : [];

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-1">{data.formTitle ?? "Drop Us a Line"}</h2>
            {data.formSubtitle && <p className="text-sm text-gray-500 mb-4">{data.formSubtitle}</p>}
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Enter Your Name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="email" placeholder="Enter Email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="tel" placeholder="Phone Number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <textarea rows={4} placeholder="Message" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y" />
              <button type="submit" className="self-start bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold">
                {data.submitText ?? "Send Message"}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            {data.address && (
              <div className="py-3 border-b border-gray-200">
                <p className="font-semibold text-gray-800 text-sm">{data.addressLabel ?? "Address"}</p>
                <p className="text-sm text-gray-500 whitespace-pre-line">{data.address}</p>
              </div>
            )}
            {phoneLines.length > 0 && (
              <div className="py-3 border-b border-gray-200">
                <p className="font-semibold text-gray-800 text-sm">{data.phoneLabel ?? "Phone"}</p>
                {phoneLines.map((line, i) => <p key={i} className="text-sm text-gray-500">{line}</p>)}
              </div>
            )}
            {data.email && (
              <div className="py-3 border-b border-gray-200">
                <p className="font-semibold text-gray-800 text-sm">{data.emailLabel ?? "Email"}</p>
                <p className="text-sm text-gray-500">{data.email}</p>
              </div>
            )}
            {data.workingDays && (
              <div className="py-3">
                <p className="font-semibold text-gray-800 text-sm">{data.workingDaysLabel ?? "Working Days"}</p>
                <p className="text-sm text-gray-500">{data.workingDays}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
