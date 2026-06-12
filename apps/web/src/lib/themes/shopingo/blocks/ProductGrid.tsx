import type { ProductGridData, ProductItem } from "@/lib/themes/types";

const ORANGE = "#e4611e";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? ORANGE : "none"} stroke={ORANGE} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: ProductItem }) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="group bg-white border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
        )}
        {product.badge && (
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 text-white rounded" style={{ backgroundColor: ORANGE }}>
            {product.badge}
          </span>
        )}
        {discount && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 text-white rounded" style={{ backgroundColor: "#e53e3e" }}>
            -{discount}%
          </span>
        )}
        {/* Quick actions overlay */}
        <div className="absolute inset-x-0 bottom-0 flex gap-1 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <button className="flex-1 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-85" style={{ backgroundColor: ORANGE }}>
            Add to Cart
          </button>
          <button className="w-9 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:text-red-500 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{product.name}</p>
        {product.rating != null && <StarRating rating={product.rating} />}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold" style={{ color: ORANGE }}>${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ data }: { data: ProductGridData }) {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {(data.title || data.subtitle) && (
          <div className="text-center mb-10">
            {data.title && (
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>
                {data.title}
              </h2>
            )}
            {data.subtitle && <p className="mt-2 text-gray-500">{data.subtitle}</p>}
            <div className="mt-3 mx-auto w-12 h-1 rounded" style={{ backgroundColor: ORANGE }} />
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
