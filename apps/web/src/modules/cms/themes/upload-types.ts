export type UploadStep = "form" | "processing" | "preview" | "success";

export interface ProcessingStep {
  id: string;
  label: string;
  status: "waiting" | "active" | "done" | "error";
}

export interface ThemePage {
  name: string;
  file: string;
  isMain: boolean;
}

export interface ThemeAssets {
  images: number;
  cssFiles: number;
  jsFiles: number;
  fonts: number;
}

export interface ThemeFormData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  version: string;
  thumbnailUrl: string;
}

export interface ProcessedResult {
  pages: ThemePage[];
  assets: ThemeAssets;
  previewHtml: string;
  coverUrl: string;
}
