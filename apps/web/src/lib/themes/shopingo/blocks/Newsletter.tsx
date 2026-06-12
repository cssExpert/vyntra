import type { NewsletterData } from "@/lib/themes/types";

export default function Newsletter({ data }: { data: NewsletterData }) {
  return (
    <section className="py-20 relative overflow-hidden bg-[#1e2226]">
      {data.backgroundImage && (
        <img src={data.backgroundImage} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-15" />
      )}
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
          {data.title}
        </h2>
        {data.subtitle && (
          <p className="text-white/60 mb-8">{data.subtitle}</p>
        )}
        <div className="flex max-w-md mx-auto overflow-hidden rounded border border-white/20">
          <input
            type="email"
            placeholder={data.placeholder}
            className="flex-1 px-5 py-3.5 text-sm bg-white text-gray-800 outline-none"
            readOnly
          />
          <button className="px-7 py-3.5 text-sm font-bold text-white shrink-0 bg-[#e4611e] transition-opacity hover:opacity-85">
            {data.buttonText}
          </button>
        </div>
      </div>
    </section>
  );
}
