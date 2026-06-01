"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw, Trash2 } from "lucide-react";
import { FieldLabel, inputClass, SegmentedControl } from "./fields";
import { PRESET_COVERS } from "./types";

type CoverTab = "presets" | "ai" | "upload";

export interface CoverImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  onToast?: (
    msg: string,
    type?: "success" | "error" | "info" | "warning",
  ) => void;
}

export function CoverImagePicker({
  value,
  onChange,
  onToast,
}: CoverImagePickerProps) {
  const [tab, setTab] = useState<CoverTab>("presets");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAI = () => {
    if (!aiPrompt.trim()) {
      onToast?.("Please enter an AI prompt first!", "warning");
      return;
    }
    setIsGenerating(true);
    onToast?.("Generating custom banner…", "info");
    setTimeout(() => {
      const random = Math.floor(Math.random() * PRESET_COVERS.length);
      onChange(PRESET_COVERS[random]);
      setIsGenerating(false);
      onToast?.("AI banner injected successfully!", "success");
    }, 1600);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
      onToast?.("Cover image updated!", "success");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <FieldLabel>Primary Cover Image</FieldLabel>
        <SegmentedControl<CoverTab>
          value={tab}
          onChange={setTab}
          options={[
            { id: "presets", label: "presets" },
            { id: "ai", label: "✨ AI" },
            { id: "upload", label: "upload" },
          ]}
        />
      </div>

      {tab === "presets" && (
        <div className="grid grid-cols-4 gap-3">
          {PRESET_COVERS.map((cov, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(cov)}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                value === cov
                  ? "border-primary scale-95 shadow-md"
                  : "border-transparent hover:border-muted-foreground/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cov} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {tab === "ai" && (
        <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Prompt the AI tool to generate a customized cover banner.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Minimalist technical workspace, neon vector…"
              className={inputClass}
            />
            <button
              type="button"
              onClick={generateAI}
              disabled={isGenerating}
              className="px-3 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-bold rounded-lg text-xs flex items-center gap-1 shrink-0"
            >
              {isGenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Generate</span>
            </button>
          </div>
        </div>
      )}

      {tab === "upload" && (
        <div className="border-2 border-dashed border-border rounded-xl p-5 text-center transition-colors hover:border-primary bg-muted/30">
          <input
            type="file"
            id="cover-upload"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <label
            htmlFor="cover-upload"
            className="cursor-pointer text-xs font-semibold text-primary hover:underline"
          >
            Choose a PNG or JPG cover image
          </label>
        </div>
      )}

      {value && (
        <div className="relative mt-3 aspect-[21/9] rounded-xl overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute bottom-2 right-2 bg-rose-600 text-white p-1.5 rounded-lg shadow-sm hover:bg-rose-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
