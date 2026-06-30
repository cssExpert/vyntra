"use client";

import { createContext, useContext } from "react";

export type SaveState = "idle" | "saving" | "saved" | "error";

export interface EditorSaveContextValue {
  pageSlug: string | null;
  publishState: SaveState;
  draftState: SaveState;
  isLandingPage: boolean;
  onPublish: () => void;
  onSaveDraft: () => void;
}

export const EditorSaveContext = createContext<EditorSaveContextValue | null>(null);

export function useEditorSave(): EditorSaveContextValue {
  const ctx = useContext(EditorSaveContext);
  if (!ctx) throw new Error("useEditorSave must be used inside EditorLayout");
  return ctx;
}
