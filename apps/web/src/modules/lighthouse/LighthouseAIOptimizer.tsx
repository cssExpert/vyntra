"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  RefreshCw,
  Copy,
  AlertCircle,
  Code,
  CheckCircle2,
  Award,
  ChevronRight,
} from "lucide-react";

interface LighthouseAIOptimizerProps {
  initialPrompt: string;
  onPromptChange: (prompt: string) => void;
  handleCopy: (text: string, message?: string) => void;
}

export function LighthouseAIOptimizer({
  initialPrompt,
  onPromptChange,
  handleCopy,
}: LighthouseAIOptimizerProps) {
  const [aiPrompt, setAiPrompt] = useState(initialPrompt);
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const setPrompt = (v: string) => {
    setAiPrompt(v);
    onPromptChange(v);
  };

  const callGeminiAPI = async (prompt: string) => {
    setIsAiLoading(true);
    setAiError("");
    setAiResponse("");

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: {
        parts: [
          {
            text: `You are Lighthouse Keeper, an elite NextJS, React, and web performance engineer.
Your goal is to optimize files, modules, and strategies to reach a perfect 100 score in Google Lighthouse.
Provide clean, production-ready optimizations with comparative code diffs or explanations. Use Markdown syntax.`,
          },
        ],
      },
    };

    let delay = 1000;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        if (!response.ok)
          throw new Error(`HTTP Error Status: ${response.status}`);
        const data = await response.json();
        const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (contentText) {
          setAiResponse(contentText);
          setIsAiLoading(false);
          return;
        }
        throw new Error("Empty response payload from Gemini API.");
      } catch {
        if (attempt === 5) {
          setAiError(
            "Optimizations currently offline. Please verify network access or try again shortly.",
          );
          setIsAiLoading(false);
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  const parsedAiMarkdown = useMemo(() => {
    if (!aiResponse) return null;
    const lines = aiResponse.split("\n");
    let insideCodeBlock = false;
    let currentCodeLanguage = "";
    let currentCodeLines: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      if (line.trim().startsWith("```")) {
        if (insideCodeBlock) {
          elements.push(
            <div
              key={`code-${index}`}
              className="relative my-4 rounded-xl border border-border overflow-hidden bg-neutral-950 font-mono text-sm leading-relaxed text-neutral-200"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800">
                <span className="text-xs font-semibold text-primary tracking-wider uppercase">
                  {currentCodeLanguage || "Code"}
                </span>
                <button
                  onClick={() =>
                    handleCopy(
                      currentCodeLines.join("\n"),
                      "Code block copied!",
                    )
                  }
                  className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-neutral-200"
                >
                  <Copy size={14} />
                </button>
              </div>
              <pre className="p-4 overflow-x-auto select-text">
                <code>{currentCodeLines.join("\n")}</code>
              </pre>
            </div>,
          );
          currentCodeLines = [];
          insideCodeBlock = false;
        } else {
          insideCodeBlock = true;
          currentCodeLanguage = line.replace("```", "").trim();
        }
      } else if (insideCodeBlock) {
        currentCodeLines.push(line);
      } else {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const lineParts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;
        while ((match = boldRegex.exec(line)) !== null) {
          if (match.index > lastIndex)
            lineParts.push(line.substring(lastIndex, match.index));
          lineParts.push(
            <strong
              key={`bold-${match.index}`}
              className="font-extrabold text-foreground"
            >
              {match[1]}
            </strong>,
          );
          lastIndex = boldRegex.lastIndex;
        }
        if (lastIndex < line.length) lineParts.push(line.substring(lastIndex));

        const finalParts: React.ReactNode[] = [];
        lineParts.forEach((part, partIndex) => {
          if (typeof part === "string") {
            const inlineCodeRegex = /`(.*?)`/g;
            let codeLastIdx = 0;
            let codeMatch;
            while ((codeMatch = inlineCodeRegex.exec(part)) !== null) {
              if (codeMatch.index > codeLastIdx)
                finalParts.push(part.substring(codeLastIdx, codeMatch.index));
              finalParts.push(
                <code
                  key={`inline-${partIndex}-${codeMatch.index}`}
                  className="px-1.5 py-0.5 rounded bg-neutral-800 text-amber-400 font-mono text-xs"
                >
                  {codeMatch[1]}
                </code>,
              );
              codeLastIdx = inlineCodeRegex.lastIndex;
            }
            if (codeLastIdx < part.length)
              finalParts.push(part.substring(codeLastIdx));
          } else {
            finalParts.push(part);
          }
        });

        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          elements.push(
            <li
              key={index}
              className="ml-6 list-disc text-muted-foreground my-1 leading-relaxed"
            >
              {finalParts.length > 0 ? finalParts : line.substring(2)}
            </li>,
          );
        } else if (line.trim() === "") {
          elements.push(<div key={index} className="h-3" />);
        } else {
          elements.push(
            <p
              key={index}
              className="text-muted-foreground my-1 leading-relaxed"
            >
              {finalParts.length > 0 ? finalParts : line}
            </p>,
          );
        }
      }
    });

    return <div className="space-y-1 text-muted-foreground">{elements}</div>;
  }, [aiResponse, handleCopy]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: prompt + presets */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-6 rounded-2xl border border-border bg-card/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles size={16} />
            </div>
            <h3 className="text-base font-extrabold text-foreground">
              Ask the Lighthouse Keeper
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            Paste sluggish components, layout bottlenecks, or audit feedback
            below. The Gemini engine will instantly refactor code for high
            performance.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Performance Bottleneck / Issue
              </label>
              <textarea
                rows={5}
                value={aiPrompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Next.js server side rendering taking long, image shifts on load..."
                className="w-full p-4 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs font-mono text-foreground resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Quick Tuning Presets
              </label>
              <div className="space-y-2">
                {[
                  "Fix cumulative layout shifts (CLS) on dynamic NextJS assets",
                  "Optimize heavy client-side list rendering in React",
                  "Improve CSS bundle load weight",
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(preset)}
                    className="w-full text-left p-2.5 rounded-lg border border-border bg-background/50 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition flex items-center justify-between group"
                  >
                    <span className="truncate mr-2">{preset}</span>
                    <ChevronRight
                      size={14}
                      className="text-muted-foreground/60 group-hover:text-primary transition"
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => callGeminiAPI(aiPrompt)}
              disabled={isAiLoading || !aiPrompt}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground text-xs font-bold shadow-glow-brand flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isAiLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>AI Generating Fixes...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Generate Instant Fix</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/30 text-xs text-muted-foreground space-y-3">
          <h4 className="font-bold text-foreground flex items-center gap-1.5">
            <Award size={14} className="text-emerald-400" /> Keeper&rsquo;s
            Guarantee
          </h4>
          <p className="leading-relaxed">
            All optimized blocks generated contain best-practice patterns
            compliant with current Google Lighthouse core rules.
          </p>
        </div>
      </div>

      {/* Right: response */}
      <div className="lg:col-span-7">
        <div className="p-6 rounded-2xl border border-border bg-card/30 h-full flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Lighthouse Code Refactoring
              </h3>
              <p className="text-xs text-muted-foreground">
                Automated performance optimizations directly generated by AI
              </p>
            </div>
            {aiResponse && (
              <button
                onClick={() => handleCopy(aiResponse)}
                className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1.5 transition"
              >
                <Copy size={13} /> Copy Report
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            {isAiLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-pulse" />
                  <Sparkles size={32} className="text-primary animate-bounce" />
                </div>
                <p className="text-sm font-semibold text-foreground animate-pulse text-center">
                  Analyzing bottleneck patterns...
                  <br />
                  <span className="text-xs font-normal text-muted-foreground font-mono">
                    Generating perfect score implementations
                  </span>
                </p>
              </div>
            ) : aiError ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle size={40} className="text-rose-500 mb-4" />
                <p className="text-sm text-foreground font-semibold">
                  {aiError}
                </p>
              </div>
            ) : parsedAiMarkdown ? (
              <div className="text-sm overflow-y-auto max-h-[600px] pr-2">
                {parsedAiMarkdown}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
                <Code size={40} className="text-border" />
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Ready for Optimization Input
                  </p>
                  <p className="text-xs text-muted-foreground/60 max-w-sm mt-1">
                    Click any preset on the left or type your dynamic audit
                    issue to receive optimized refactor instructions.
                  </p>
                </div>
              </div>
            )}

            {aiResponse && !isAiLoading && (
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Engine: Gemini-2.5-Flash</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={13} strokeWidth={2.5} /> Double Checked
                  Optimizations
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
