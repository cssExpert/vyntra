import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { EditorNode } from "@/types/editor";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ComponentCategory =
  | "Marketing"
  | "Navigation"
  | "Layout"
  | "Forms"
  | "Media"
  | "E-commerce"
  | "Other";

export type SectionCategory =
  | "Landing Pages"
  | "Business"
  | "SaaS"
  | "Store"
  | "Blog"
  | "Portfolio";

export type GlobalElementType =
  | "header"
  | "footer"
  | "announcement-bar"
  | "contact-cta";

export interface SavedComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  isGlobal: boolean;
  syncChanges: boolean;
  node: EditorNode;
  createdAt: string;
  projectId?: string; // null = global across all projects
}

export interface SavedSection {
  id: string;
  name: string;
  category: SectionCategory;
  node: EditorNode;
  createdAt: string;
}

export interface BrandKit {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;
  fontHeading: string;
  fontBody: string;
  buttonStyle: "rounded" | "pill" | "sharp";
  isActive: boolean;
}

export interface GlobalElement {
  id: string;
  name: string;
  elementType: GlobalElementType;
  syncAcrossPages: boolean;
  node: EditorNode;
  createdAt: string;
}

interface LibraryState {
  components: SavedComponent[];
  sections: SavedSection[];
  brandKits: BrandKit[];
  globalElements: GlobalElement[];

  // Save modal state (set by canvas toolbar, read by modal)
  pendingSaveNode: EditorNode | null;
  pendingSaveType: "component" | "section" | null;
  setPendingSave: (node: EditorNode | null, type: "component" | "section" | null) => void;

  // Modal open flags (moved to store so modals can be mounted at top level)
  brandKitModalOpen: boolean;
  globalElementModalOpen: boolean;
  setBrandKitModalOpen: (v: boolean) => void;
  setGlobalElementModalOpen: (v: boolean) => void;

  // Actions
  saveComponent: (data: Omit<SavedComponent, "id" | "createdAt">) => string;
  saveSection: (data: Omit<SavedSection, "id" | "createdAt">) => string;
  createBrandKit: (data: Omit<BrandKit, "id" | "isActive">) => string;
  activateBrandKit: (id: string) => void;
  addGlobalElement: (data: Omit<GlobalElement, "id" | "createdAt">) => string;

  deleteComponent: (id: string) => void;
  deleteSection: (id: string) => void;
  deleteBrandKit: (id: string) => void;
  deleteGlobalElement: (id: string) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      components: [],
      sections: [],
      brandKits: [],
      globalElements: [],
      pendingSaveNode: null,
      pendingSaveType: null,
      brandKitModalOpen: false,
      globalElementModalOpen: false,

      setPendingSave: (node, type) =>
        set({ pendingSaveNode: node, pendingSaveType: type }),
      setBrandKitModalOpen: (v) => set({ brandKitModalOpen: v }),
      setGlobalElementModalOpen: (v) => set({ globalElementModalOpen: v }),

      saveComponent: (data) => {
        const id = nanoid();
        set((s) => ({
          components: [
            ...s.components,
            { ...data, id, createdAt: new Date().toISOString() },
          ],
        }));
        return id;
      },

      saveSection: (data) => {
        const id = nanoid();
        set((s) => ({
          sections: [
            ...s.sections,
            { ...data, id, createdAt: new Date().toISOString() },
          ],
        }));
        return id;
      },

      createBrandKit: (data) => {
        const id = nanoid();
        set((s) => ({ brandKits: [...s.brandKits, { ...data, id, isActive: false }] }));
        return id;
      },

      activateBrandKit: (id) =>
        set((s) => ({
          brandKits: s.brandKits.map((k) => ({ ...k, isActive: k.id === id })),
        })),

      addGlobalElement: (data) => {
        const id = nanoid();
        set((s) => ({
          globalElements: [
            ...s.globalElements,
            { ...data, id, createdAt: new Date().toISOString() },
          ],
        }));
        return id;
      },

      deleteComponent: (id) =>
        set((s) => ({ components: s.components.filter((c) => c.id !== id) })),
      deleteSection: (id) =>
        set((s) => ({ sections: s.sections.filter((c) => c.id !== id) })),
      deleteBrandKit: (id) =>
        set((s) => ({ brandKits: s.brandKits.filter((c) => c.id !== id) })),
      deleteGlobalElement: (id) =>
        set((s) => ({ globalElements: s.globalElements.filter((c) => c.id !== id) })),
    }),
    { name: "ervflow-library" },
  ),
);
