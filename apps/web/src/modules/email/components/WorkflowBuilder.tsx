"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Sparkles, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkflowStep, SimLog, Branch } from "../types";

/* ─── Props ─────────────────────────────────────────────────── */
export interface WorkflowBuilderProps {
  mainSteps: WorkflowStep[];
  setMainSteps: React.Dispatch<React.SetStateAction<WorkflowStep[]>>;
  yesSteps: WorkflowStep[];
  setYesSteps: React.Dispatch<React.SetStateAction<WorkflowStep[]>>;
  noSteps: WorkflowStep[];
  setNoSteps: React.Dispatch<React.SetStateAction<WorkflowStep[]>>;
  selectedStep: WorkflowStep | null;
  setSelectedStep: React.Dispatch<React.SetStateAction<WorkflowStep | null>>;
  handleAddStep: (
    a: WorkflowStep[],
    s: React.Dispatch<React.SetStateAction<WorkflowStep[]>>,
    i: number,
    t: WorkflowStep["type"],
  ) => void;
  handleRemoveStep: (
    id: string,
    a: WorkflowStep[],
    s: React.Dispatch<React.SetStateAction<WorkflowStep[]>>,
  ) => void;
  handleUpdateStep: (id: string, f: Partial<WorkflowStep>) => void;
  handleUpdateStepConfig: (id: string, k: string, v: string | number) => void;
  simulationActive: boolean;
  simStepId: string | null;
  simReport: SimLog[];
  handleGenerateStepEmail: (step: WorkflowStep) => void;
  isAiGenerating: boolean;
}

/* ─── Step type badge colours ───────────────────────────────── */
const TYPE_BADGE: Record<WorkflowStep["type"], string> = {
  trigger: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
  action: "bg-purple-500/10  text-purple-600  dark:text-purple-400",
  delay: "bg-warning/10     text-warning",
  condition: "bg-primary/10     text-primary",
};

const SIM_CLASS =
  "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 !border-emerald-400 ring-4 ring-emerald-500/10 scale-105";

/* ─── Inline add-step menu ──────────────────────────────────── */
function AddMenu({
  show,
  types,
  onAdd,
}: {
  show: boolean;
  types: ReadonlyArray<WorkflowStep["type"]>;
  onAdd: (t: WorkflowStep["type"]) => void;
}) {
  if (!show) return null;
  return (
    <div className="absolute z-20 left-1/2 -translate-x-1/2 top-8 w-44 rounded-xl bg-card border border-border p-1 shadow-2xl">
      {types.map((type) => (
        <button
          key={type}
          onClick={() => onAdd(type)}
          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold capitalize text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          Add {type}
        </button>
      ))}
    </div>
  );
}

/* ─── Branch node ───────────────────────────────────────────── */
function BranchNode({
  step,
  isActive,
  isSelected,
  onSelect,
  onRemove,
}: {
  step: WorkflowStep;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      onClick={onSelect}
      className={cn(
        "w-full max-w-xs rounded-xl p-4 border cursor-pointer relative transition-all",
        isActive
          ? SIM_CLASS
          : cn(
              "bg-card border-border hover:border-primary/40",
              isSelected && "border-primary",
            ),
      )}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] font-bold tracking-widest uppercase text-purple-600 dark:text-purple-400">
          {step.type}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-muted-foreground hover:text-error p-1 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <h5 className="font-bold text-xs text-foreground">{step.label}</h5>
      <p className="text-[11px] text-muted-foreground mt-1">
        {step.description}
      </p>
    </motion.div>
  );
}

/* ─── Properties panel ──────────────────────────────────────── */
function PropertiesPanel({
  step,
  onClose,
  handleUpdateStep,
  handleUpdateStepConfig,
  handleGenerateStepEmail,
  isAiGenerating,
}: {
  step: WorkflowStep;
  onClose: () => void;
  handleUpdateStep: (id: string, f: Partial<WorkflowStep>) => void;
  handleUpdateStepConfig: (id: string, k: string, v: string | number) => void;
  handleGenerateStepEmail: (s: WorkflowStep) => void;
  isAiGenerating: boolean;
}) {
  return (
    <motion.div
      key="props"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-5"
    >
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <span className="text-[10px] font-bold text-primary tracking-wider uppercase">
            Properties
          </span>
          <h3 className="font-bold text-base text-foreground mt-0.5">
            {step.label}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          Close
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={step.label}
            onChange={(e) =>
              handleUpdateStep(step.id, { label: e.target.value })
            }
            className="w-full rounded-md bg-background border border-border px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
            Description
          </label>
          <textarea
            rows={2}
            value={step.description}
            onChange={(e) =>
              handleUpdateStep(step.id, { description: e.target.value })
            }
            className="w-full rounded-md bg-background border border-border px-4 py-2.5 text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {step.type === "delay" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                Duration
              </label>
              <input
                type="number"
                value={step.config.value ?? 1}
                onChange={(e) =>
                  handleUpdateStepConfig(
                    step.id,
                    "value",
                    parseInt(e.target.value),
                  )
                }
                className="w-full rounded-md bg-background border border-border px-4 py-2.5 text-foreground shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                Interval
              </label>
              <select
                value={step.config.unit ?? "days"}
                onChange={(e) =>
                  handleUpdateStepConfig(step.id, "unit", e.target.value)
                }
                className="w-full rounded-md bg-background border border-border px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
              </select>
            </div>
          </div>
        )}

        {step.type === "action" && (
          <div className="space-y-4 pt-2 border-t border-border">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                Subject Line
              </label>
              <input
                type="text"
                value={step.config.subject ?? ""}
                onChange={(e) =>
                  handleUpdateStepConfig(step.id, "subject", e.target.value)
                }
                placeholder="Subject Line"
                className="w-full rounded-md bg-background border border-border px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="p-4 rounded-md bg-purple-500/5 border border-purple-500/15 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                  Gemini Copilot
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Describe what should be in the email and Gemini will generate
                optimized, persuasive copy.
              </p>
              <textarea
                rows={4}
                placeholder="Tell Gemini who you're targeting, the core offer, and the tone…"
                value={step.config.aiPrompt ?? ""}
                onChange={(e) =>
                  handleUpdateStepConfig(step.id, "aiPrompt", e.target.value)
                }
                className="w-full rounded-md bg-background border border-border p-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
              <button
                onClick={() => handleGenerateStepEmail(step)}
                disabled={isAiGenerating}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-primary text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAiGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Compiling…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Write Email with Gemini</span>
                  </>
                )}
              </button>
            </div>

            {step.config.generatedBody && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Compiled Email
                </span>
                <div className="max-h-56 overflow-y-auto bg-background border border-border p-4 rounded-xl text-xs font-mono text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {step.config.generatedBody}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── WorkflowBuilder (main export) ────────────────────────── */
export function WorkflowBuilder({
  mainSteps,
  setMainSteps,
  yesSteps,
  setYesSteps,
  noSteps,
  setNoSteps,
  selectedStep,
  setSelectedStep,
  handleAddStep,
  handleRemoveStep,
  handleUpdateStep,
  handleUpdateStepConfig,
  simulationActive: _sim,
  simStepId,
  simReport,
  handleGenerateStepEmail,
  isAiGenerating,
}: WorkflowBuilderProps) {
  const [showAddMenuIdx, setShowAddMenuIdx] = useState<number | null>(null);
  const [addingToBranch, setAddingToBranch] = useState<Branch | null>(null);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (simReport.length === 0) return;
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [simReport]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
      {/* ── Left: canvas + console ────────────────────── */}
      <div className="xl:col-span-2 flex flex-col gap-4">
        {/* Tip banner */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-primary/80">
            <strong>Protip:</strong> Click any block to open its properties and
            use Gemini AI to compose email copy.
          </p>
        </div>

        {/* Blueprint canvas */}
        <div className="rounded-2xl border border-border bg-muted/20 relative flex flex-col items-center p-6 pt-8">
          <LayoutGroup>
            {mainSteps.map((step, idx) => {
              const isSimActive = simStepId === step.id;
              return (
                <React.Fragment key={step.id}>
                  {/* Step node */}
                  <motion.div
                    layout
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedStep(step)}
                    className={cn(
                      "w-full max-w-sm rounded-2xl p-5 border cursor-pointer relative transition-all",
                      isSimActive
                        ? SIM_CLASS
                        : cn(
                            "bg-card border-border hover:border-primary/40",
                            selectedStep?.id === step.id &&
                              "border-primary ring-2 ring-primary/20",
                          ),
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full",
                          TYPE_BADGE[step.type],
                        )}
                      >
                        {step.type}
                      </span>
                      {step.type !== "trigger" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveStep(step.id, mainSteps, setMainSteps);
                          }}
                          className="text-muted-foreground hover:text-error p-1 rounded-lg hover:bg-error/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-foreground">
                      {step.label}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                    {step.config.subject && (
                      <p className="text-xs text-primary font-medium mt-2 truncate bg-primary/5 p-1.5 rounded border border-primary/10">
                        Subject: &ldquo;{step.config.subject}&rdquo;
                      </p>
                    )}
                    {isSimActive && (
                      <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 justify-center items-center text-[10px] font-bold text-white">
                          ✓
                        </span>
                      </span>
                    )}
                  </motion.div>

                  {/* Connector + add button */}
                  {idx < mainSteps.length - 1 && (
                    <div className="w-0.5 h-10 bg-border relative flex justify-center items-center">
                      <button
                        onClick={() => {
                          setAddingToBranch("main");
                          setShowAddMenuIdx(idx);
                        }}
                        className="absolute w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:border-primary hover:text-white transition-all scale-90 hover:scale-105"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <AddMenu
                        show={
                          showAddMenuIdx === idx && addingToBranch === "main"
                        }
                        types={["action", "delay", "condition"]}
                        onAdd={(type) => {
                          handleAddStep(mainSteps, setMainSteps, idx, type);
                          setShowAddMenuIdx(null);
                        }}
                      />
                    </div>
                  )}

                  {/* Condition branches */}
                  {step.type === "condition" && (
                    <div className="w-full flex flex-col md:flex-row gap-8 justify-center my-6">
                      {/* YES */}
                      <div className="flex-1 flex flex-col items-center">
                        <div className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full mb-4">
                          YES Branch
                        </div>
                        {yesSteps.map((yStep, yIdx) => (
                          <React.Fragment key={yStep.id}>
                            <BranchNode
                              step={yStep}
                              isActive={simStepId === yStep.id}
                              isSelected={selectedStep?.id === yStep.id}
                              onSelect={() => setSelectedStep(yStep)}
                              onRemove={() =>
                                handleRemoveStep(
                                  yStep.id,
                                  yesSteps,
                                  setYesSteps,
                                )
                              }
                            />
                            {yIdx < yesSteps.length - 1 && (
                              <div className="w-0.5 h-8 bg-border relative flex justify-center items-center">
                                <button
                                  onClick={() => {
                                    setAddingToBranch("yes");
                                    setShowAddMenuIdx(yIdx);
                                  }}
                                  className="absolute w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors scale-90"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                                <AddMenu
                                  show={
                                    showAddMenuIdx === yIdx &&
                                    addingToBranch === "yes"
                                  }
                                  types={["action", "delay"]}
                                  onAdd={(type) => {
                                    handleAddStep(
                                      yesSteps,
                                      setYesSteps,
                                      yIdx,
                                      type,
                                    );
                                    setShowAddMenuIdx(null);
                                  }}
                                />
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* NO */}
                      <div className="flex-1 flex flex-col items-center">
                        <div className="text-[10px] font-bold text-error px-3 py-1 bg-error/10 border border-error/25 rounded-full mb-4">
                          NO Branch
                        </div>
                        {noSteps.map((nStep, nIdx) => (
                          <React.Fragment key={nStep.id}>
                            <BranchNode
                              step={nStep}
                              isActive={simStepId === nStep.id}
                              isSelected={selectedStep?.id === nStep.id}
                              onSelect={() => setSelectedStep(nStep)}
                              onRemove={() =>
                                handleRemoveStep(nStep.id, noSteps, setNoSteps)
                              }
                            />
                            {nIdx < noSteps.length - 1 && (
                              <div className="w-0.5 h-8 bg-border relative flex justify-center items-center">
                                <button
                                  onClick={() => {
                                    setAddingToBranch("no");
                                    setShowAddMenuIdx(nIdx);
                                  }}
                                  className="absolute w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors scale-90"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                                <AddMenu
                                  show={
                                    showAddMenuIdx === nIdx &&
                                    addingToBranch === "no"
                                  }
                                  types={["action", "delay"]}
                                  onAdd={(type) => {
                                    handleAddStep(
                                      noSteps,
                                      setNoSteps,
                                      nIdx,
                                      type,
                                    );
                                    setShowAddMenuIdx(null);
                                  }}
                                />
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </LayoutGroup>
        </div>

        {/* Simulator console */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              Campaign Simulator Log
            </h4>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
              Live Feed
            </span>
          </div>
          <div className="h-44 overflow-y-auto bg-background rounded-xl p-4 font-mono text-xs space-y-2 border border-border">
            {simReport.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-10">
                Click &ldquo;Simulate&rdquo; to watch the automation run.
              </p>
            ) : (
              simReport.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-primary select-none">[{log.time}]</span>
                  <span
                    className={
                      log.status === "success"
                        ? "text-success font-medium"
                        : log.status === "warning"
                          ? "text-warning font-medium"
                          : "text-foreground/80"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
            <div ref={consoleEndRef} />
          </div>
        </div>
      </div>

      {/* ── Right: properties panel ───────────────────── */}
      <div className="flex flex-col gap-6 self-start">
        <AnimatePresence mode="wait">
          {selectedStep ? (
            <PropertiesPanel
              key="props"
              step={selectedStep}
              onClose={() => setSelectedStep(null)}
              handleUpdateStep={handleUpdateStep}
              handleUpdateStepConfig={handleUpdateStepConfig}
              handleGenerateStepEmail={handleGenerateStepEmail}
              isAiGenerating={isAiGenerating}
            />
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center p-8 rounded-2xl border border-dashed border-border bg-muted/20"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-sm text-foreground">
                No node selected
              </h4>
              <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
                Select any workflow block on the canvas to configure parameters
                and prompt the AI writer.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
