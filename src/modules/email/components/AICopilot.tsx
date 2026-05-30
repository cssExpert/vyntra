"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AICopilotProps {
  aiPromptInput: string;
  setAiPromptInput: React.Dispatch<React.SetStateAction<string>>;
  aiResponse: string;
  setAiResponse: React.Dispatch<React.SetStateAction<string>>;
  isAiGenerating: boolean;
  handleGeneralAiGenerate: () => void;
  selectedTemplateForAi: string;
  setSelectedTemplateForAi: React.Dispatch<React.SetStateAction<string>>;
}

const MOCK_TEMPLATES = [
  "Welcome Series",
  "Cart Abandonment Recovery",
  "Product Pitch",
  "Re-engagement Sequence",
  "Weekly Newsletter",
];

export function AICopilot({
  aiPromptInput,
  setAiPromptInput,
  aiResponse,
  isAiGenerating,
  handleGeneralAiGenerate,
  selectedTemplateForAi,
  setSelectedTemplateForAi,
}: AICopilotProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

      {/* ── Input panel ──────────────────────────────── */}
      <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <h3 className="font-bold text-lg text-foreground">AI Copywriter Engine</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Craft full-funnel email campaigns, landing pages, or broadcast emails utilizing state-of-the-art semantic structures.
          </p>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Campaign Flow Context
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_TEMPLATES.map((tpl) => (
                <button
                  key={tpl}
                  onClick={() => setSelectedTemplateForAi(tpl)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all",
                    selectedTemplateForAi === tpl
                      ? "bg-purple-500/10 border-purple-500/50 text-purple-600 dark:text-purple-400"
                      : "bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:border-primary/30",
                  )}
                >
                  {tpl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Instructions for Gemini
            </label>
            <textarea
              rows={6}
              placeholder="E.g., Write a 3-part sequence encouraging trial users to upgrade…"
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              className="w-full rounded-2xl bg-muted/50 border border-border p-4 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleGeneralAiGenerate}
          disabled={isAiGenerating}
          className="w-full mt-6 py-3.5 bg-gradient-to-r from-purple-600 via-primary to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-55"
        >
          {isAiGenerating ? (
            <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Composing…</span></>
          ) : (
            <><Sparkles className="w-5 h-5" /><span>Compose Campaign Copy</span></>
          )}
        </button>
      </div>

      {/* ── Output panel ─────────────────────────────── */}
      <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 flex flex-col min-h-[500px]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Generative Output</span>
            <h3 className="font-bold text-base text-foreground mt-0.5">Gemini Response Terminal</h3>
          </div>
          {aiResponse && (
            <button
              onClick={() => navigator.clipboard?.writeText?.(aiResponse)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              Copy Text
            </button>
          )}
        </div>

        {!aiResponse ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl border border-border">⚡</div>
            <h4 className="font-bold text-sm text-foreground">No output yet</h4>
            <p className="text-xs text-muted-foreground max-w-xs">
              Configure your copywriting rules on the left and click &lsquo;Compose Campaign Copy&rsquo; to trigger the AI engine.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto text-sm text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap">
            {aiResponse}
          </div>
        )}
      </div>
    </div>
  );
}
