import type { BlogSectionData } from "@/lib/themes/types";

export default function BlogSection({ data }: { data: BlogSectionData }) {
  if (!data.posts.length) return null;
  return (
    <section className="py-14 bg-[#f5f5f5] dark:bg-[#121214]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>
            {data.title}
          </h2>
          {data.subtitle && <p className="mt-2 text-gray-500 dark:text-gray-400">{data.subtitle}</p>}
          <div className="mt-3 mx-auto w-12 h-1 rounded bg-[#e4611e]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.posts.map((post) => (
            <a key={post.id} href={`/blog/${post.slug}`} className="group bg-white dark:bg-[#1c1c1e] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow block">
              <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-[#2a2a2e]">
                {post.image ? (
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{post.date} · {post.author}</p>
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">{post.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{post.excerpt}</p>
                <span className="inline-block mt-4 text-xs font-semibold text-[#e4611e]">
                  Read More →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
