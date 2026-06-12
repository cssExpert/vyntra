"use client";

import type { ContactFormData } from "@/lib/themes/types";

export default function ContactForm({ data }: { data: ContactFormData }) {
  const subjects = data.subjects?.length
    ? data.subjects
    : ["Order Inquiry", "Return & Refund", "Product Question", "Other"];
  const hours = data.hours ?? [];

  return (
    <section className="py-14 bg-gray-50">
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
            <h2 className="text-lg font-bold text-gray-800 mb-4">{data.formTitle ?? "Send Us a Message"}</h2>
            <form className="flex flex-col gap-3" onSubmit={e => e.preventDefault()}>
              <input type="text" placeholder="Your Name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="email" placeholder="Email Address" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="tel" placeholder="Phone Number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {subjects.map((s, i) => <option key={i}>{s}</option>)}
              </select>
              <textarea rows={4} placeholder="Your message…" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y" />
              <button type="submit" className="bg-orange-500 text-white py-2.5 rounded-lg text-sm font-semibold">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
