export interface GalleryItem {
  id: string;
  url: string;
  label: string;
  uploadedAt: string;
}

const ITEMS_BY_GALLERY: Record<string, GalleryItem[]> = {
  "gal-1": [
    { id: "i1-1", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80", label: "Neon Drift", uploadedAt: "2026-05-15" },
    { id: "i1-2", url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80", label: "Glassmorph Orb", uploadedAt: "2026-05-16" },
    { id: "i1-3", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80", label: "Monochrome I", uploadedAt: "2026-05-17" },
    { id: "i1-4", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80", label: "Liquid Fire", uploadedAt: "2026-05-18" },
    { id: "i1-5", url: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=800&q=80", label: "Red Minimal", uploadedAt: "2026-05-19" },
    { id: "i1-6", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80", label: "Classical Surge", uploadedAt: "2026-05-20" },
  ],
  "gal-2": [
    { id: "i2-1", url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80", label: "Concrete Tower", uploadedAt: "2026-05-28" },
    { id: "i2-2", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", label: "Urban Canyon", uploadedAt: "2026-05-29" },
    { id: "i2-3", url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80", label: "Gridded Facade", uploadedAt: "2026-05-30" },
    { id: "i2-4", url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80", label: "Raw Edge I", uploadedAt: "2026-05-31" },
  ],
  "gal-3": [
    { id: "i3-1", url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80", label: "Moss Wall", uploadedAt: "2026-06-01" },
    { id: "i3-2", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80", label: "Forest Light", uploadedAt: "2026-06-01" },
    { id: "i3-3", url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80", label: "Green Interior", uploadedAt: "2026-06-01" },
    { id: "i3-4", url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80", label: "Leaf Canopy", uploadedAt: "2026-06-01" },
    { id: "i3-5", url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80", label: "Open Nature", uploadedAt: "2026-06-01" },
    { id: "i3-6", url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80", label: "Bio Suite", uploadedAt: "2026-06-01" },
    { id: "i3-7", url: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=800&q=80", label: "Earth Tones", uploadedAt: "2026-06-01" },
    { id: "i3-8", url: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=800&q=80", label: "Organic Arch", uploadedAt: "2026-06-01" },
  ],
  "gal-4": [
    { id: "i4-1", url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80", label: "Prism I", uploadedAt: "2026-04-10" },
    { id: "i4-2", url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80", label: "Fashion Light", uploadedAt: "2026-04-11" },
    { id: "i4-3", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80", label: "Diffraction", uploadedAt: "2026-04-12" },
    { id: "i4-4", url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80", label: "Double Expo", uploadedAt: "2026-04-13" },
    { id: "i4-5", url: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80", label: "Studio Chic", uploadedAt: "2026-04-14" },
  ],
  "gal-5": [
    { id: "i5-1", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80", label: "UI Wave", uploadedAt: "2026-03-22" },
    { id: "i5-2", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80", label: "Avatar Frame", uploadedAt: "2026-03-23" },
    { id: "i5-3", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80", label: "Glow Grid", uploadedAt: "2026-03-24" },
    { id: "i5-4", url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80", label: "Mobile Kit", uploadedAt: "2026-03-25" },
    { id: "i5-5", url: "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=800&q=80", label: "Data Vis", uploadedAt: "2026-03-26" },
    { id: "i5-6", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80", label: "Analytics UI", uploadedAt: "2026-03-27" },
  ],
};

export function getGalleryItems(galleryId: string): GalleryItem[] {
  return ITEMS_BY_GALLERY[galleryId] ?? [];
}
