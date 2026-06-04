import type { Gallery } from "./gallery.types";

export const PRESET_COVERS = [
  { id: "c1", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80", label: "Neon Abstract" },
  { id: "c2", url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80", label: "Glassmorphism 3D" },
  { id: "c3", url: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=800&q=80", label: "Minimalist Red" },
  { id: "c4", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80", label: "Classical Art" },
  { id: "c5", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80", label: "Liquid Dynamic" },
  { id: "c6", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80", label: "Monochrome Dark" },
];

export const INITIAL_GALLERIES: Gallery[] = [
  { id: "gal-1", title: "Surrealist Dreams", description: "A collection of digital art exploring dreamscapes, floating geometry, and vaporwave color scales.", category: "Digital Art", itemCount: 24, createdAt: "2026-05-15", status: "published", coverUrl: PRESET_COVERS[0].url, tags: ["Vaporwave", "3D Render", "Surrealism"], views: 1240 },
  { id: "gal-2", title: "Architectural Brutalism", description: "Documenting the raw beauty of concrete, sharp angles, and shadow plays in urban structures.", category: "Photography", itemCount: 12, createdAt: "2026-05-28", status: "published", coverUrl: PRESET_COVERS[5].url, tags: ["Architecture", "B&W", "Minimalist"], views: 890 },
  { id: "gal-3", title: "Biophilic Design Concepts", description: "Interiors and architectures merging organic nature with modern smart-home layouts.", category: "Interior Design", itemCount: 8, createdAt: "2026-06-01", status: "draft", coverUrl: PRESET_COVERS[4].url, tags: ["Organic", "Interior", "Eco-friendly"], views: 45 },
  { id: "gal-4", title: "Ethereal Portraits", description: "High-fashion portrait photography incorporating light diffraction prisms and double exposure.", category: "Photography", itemCount: 30, createdAt: "2026-04-10", status: "published", coverUrl: PRESET_COVERS[3].url, tags: ["Portrait", "Fashion", "Prism Light"], views: 3120 },
  { id: "gal-5", title: "Interactive Web Art Assets", description: "Assets curated for motion design, web development templates, and responsive canvas backdrops.", category: "Web Design", itemCount: 16, createdAt: "2026-03-22", status: "published", coverUrl: PRESET_COVERS[1].url, tags: ["UI/UX", "SVG", "Motion"], views: 1750 },
];

export const CATEGORIES = ["All", "Digital Art", "Photography", "Interior Design", "Web Design", "Fine Art", "Conceptual"];
