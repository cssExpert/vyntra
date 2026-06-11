"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { EmailPageSkeleton } from "@/components/common/DashboardSkeleton";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster, useToaster } from "@/components/common/Toaster";
import { MotionTabs, type MotionTabItem } from "@/components/ui/MotionTabs";

import { WorkflowBuilder } from "./components/WorkflowBuilder";
import { AICopilot } from "./components/AICopilot";
import { TemplatesLibrary } from "./components/TemplatesLibrary";
import {
  generateWithGemini,
  INITIAL_WORKFLOW_STEPS,
  INITIAL_YES_BRANCH,
  INITIAL_NO_BRANCH,
} from "./data";
import type { Toast, WorkflowStep, SimLog } from "./types";

import SectionTitle from "@/components/common/SectionTitle";

type TabId = "builder" | "copilot" | "templates";

const TABS: MotionTabItem<TabId>[] = [
  { id: "builder",   label: "Builder" },
  { id: "copilot",   label: "AI Copilot" },
  { id: "templates", label: "Templates" },
];

const TAB_TITLE: Record<TabId, string> = {
  builder: "Automation Blueprint Canvas",
  copilot: "AI Copywriting Assistant",
  templates: "Visual Email Layouts",
};
const TAB_SUBTITLE: Record<TabId, string> = {
  builder:
    "Assemble automated triggers, timed logic branches, and custom copy blocks.",
  copilot: "Harness the elite capabilities of Gemini AI for converting copy.",
  templates:
    "Handcrafted design systems calibrated for perfect dark/light inbox rendering.",
};

const tabVariants = {
  enter: { opacity: 0, y: 14 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -14,
    transition: { duration: 0.18, ease: "easeIn" as const },
  },
};

export function EmailView() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("email");
  const [activeTab, setActiveTab] = useState<TabId>("builder");

  const { toasts: notifications, addToast: notify, dismiss: dismissNotification } = useToaster();

  const [mainSteps, setMainSteps] = useState<WorkflowStep[]>(
    INITIAL_WORKFLOW_STEPS,
  );
  const [yesSteps, setYesSteps] = useState<WorkflowStep[]>(INITIAL_YES_BRANCH);
  const [noSteps, setNoSteps] = useState<WorkflowStep[]>(INITIAL_NO_BRANCH);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simStepId, setSimStepId] = useState<string | null>(null);
  const [simReport, setSimReport] = useState<SimLog[]>([]);

  const [aiPromptInput, setAiPromptInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [selectedTemplateForAi, setSelectedTemplateForAi] =
    useState("Welcome Series");
  const isLoaded = usePageLoad(700);

  const handleUpdateStep = (stepId: string, fields: Partial<WorkflowStep>) => {
    const upd = (s: WorkflowStep[]) =>
      s.map((x) => (x.id === stepId ? { ...x, ...fields } : x));
    setMainSteps(upd);
    setYesSteps(upd);
    setNoSteps(upd);
    if (selectedStep?.id === stepId)
      setSelectedStep((p) => (p ? { ...p, ...fields } : p));
    notify("Workflow configuration saved!");
  };

  const handleUpdateStepConfig = (
    stepId: string,
    key: string,
    value: string | number,
  ) => {
    const upd = (s: WorkflowStep[]) =>
      s.map((x) =>
        x.id === stepId ? { ...x, config: { ...x.config, [key]: value } } : x,
      );
    setMainSteps(upd);
    setYesSteps(upd);
    setNoSteps(upd);
    if (selectedStep?.id === stepId)
      setSelectedStep((p) =>
        p ? { ...p, config: { ...p.config, [key]: value } } : p,
      );
  };

  const handleAddStep = (
    arr: WorkflowStep[],
    set: React.Dispatch<React.SetStateAction<WorkflowStep[]>>,
    idx: number,
    type: WorkflowStep["type"],
  ) => {
    let s: WorkflowStep = {
      id: `step-${Date.now()}`,
      type,
      label: `New ${type.toUpperCase()}`,
      description: "Click to configure.",
      config: {},
    };
    if (type === "action")
      s = {
        ...s,
        label: "Send Automated Email",
        config: {
          subject: "Instant update!",
          aiPrompt: "Draft a marketing email.",
        },
      };
    else if (type === "delay")
      s = { ...s, label: "Wait 1 Day", config: { value: 1, unit: "days" } };
    else if (type === "condition")
      s = {
        ...s,
        label: "Condition: Check Clicked?",
        config: { conditionType: "clicked" },
      };
    const updated = [...arr];
    updated.splice(idx + 1, 0, s);
    set(updated);
    setSelectedStep(s);
    notify(`Added ${type} step`);
  };

  const handleRemoveStep = (
    stepId: string,
    arr: WorkflowStep[],
    set: React.Dispatch<React.SetStateAction<WorkflowStep[]>>,
  ) => {
    set(arr.filter((x) => x.id !== stepId));
    if (selectedStep?.id === stepId) setSelectedStep(null);
    notify("Removed step from workflow");
  };

  const runSimulation = async () => {
    if (simulationActive) return;
    setSimulationActive(true);
    setSimReport([]);
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const log = (message: string, status: SimLog["status"] = "info") =>
      setSimReport((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString(), message, status },
      ]);
    log("🚀 Starting simulation for: jane.doe@example.com");
    for (const step of mainSteps) {
      setSimStepId(step.id);
      log(`Entering step [${step.label}]`);
      await sleep(1500);
      if (step.type === "trigger") log("✅ Trigger verified.", "success");
      else if (step.type === "action")
        log(`📧 Sent: "${step.config.subject ?? "No Subject"}"`, "success");
      else if (step.type === "delay")
        log(
          `⏳ Cooling down for ${step.config.value ?? 1} ${step.config.unit ?? "days"}...`,
          "warning",
        );
      else if (step.type === "condition") {
        const yes = Math.random() > 0.4;
        log(`🔍 Branch: ${yes ? "YES (Opened)" : "NO (Inactive)"}`, "warning");
        await sleep(1000);
        log(yes ? "🌿 Routing to YES path." : "🍂 Routing to NO path.");
        for (const b of yes ? yesSteps : noSteps) {
          setSimStepId(b.id);
          log(`Entering step [${b.label}]`);
          await sleep(1500);
          if (b.type === "action")
            log(
              `📧 Branch Email: "${b.config.subject ?? "No Subject"}"`,
              "success",
            );
        }
      }
    }
    setSimStepId(null);
    setSimulationActive(false);
    log("🏁 Simulation finished.", "success");
    notify("Simulation complete!", "success");
  };

  const handleGenerateStepEmail = async (step: WorkflowStep) => {
    if (!step.config.aiPrompt) {
      notify("Provide an AI Prompt first.", "warning");
      return;
    }
    setIsAiGenerating(true);
    notify("Gemini Copilot is writing your email...", "info");
    try {
      const copy = await generateWithGemini(step.config.aiPrompt, "");
      handleUpdateStepConfig(step.id, "generatedBody", copy);
      notify("Email copy compiled by Gemini!", "success");
    } catch {
      notify("Generation failed.", "error");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleGeneralAiGenerate = async () => {
    if (!aiPromptInput) {
      notify("Enter a prompt first.", "warning");
      return;
    }
    setIsAiGenerating(true);
    notify("Consulting Gemini AI...", "info");
    try {
      const res = await generateWithGemini(
        `Template: ${selectedTemplateForAi}. ${aiPromptInput}`,
        "",
      );
      setAiResponse(res);
      notify("Campaign concept generated!", "success");
    } catch {
      notify("Could not connect to Gemini.", "error");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const switchTab = (id: TabId) => {
    setActiveTab(id);
    setSelectedStep(null);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
        <motion.div
          key="skeleton"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <EmailPageSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
    <>
      <Toaster toasts={notifications} onDismiss={dismissNotification} />

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <p className="text-xs text-primary font-semibold uppercase tracking-wider">
              Live Marketing Node Connected
            </p>
          </div>
          <SectionTitle
            title={TAB_TITLE[activeTab]}
            paragraph={TAB_SUBTITLE[activeTab]}
          />
        </div>

        <div className="flex items-center gap-3">
          <MotionTabs
            tabs={TABS}
            active={activeTab}
            onChange={switchTab}
            layoutId="email-tab-indicator"
            className="w-fit"
          />
          {activeTab === "builder" && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={runSimulation}
              disabled={simulationActive}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                simulationActive
                  ? "bg-muted text-muted-foreground border border-border cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20",
              )}
            >
              <Play className="w-4 h-4" />
              <span>{simulationActive ? "Simulating…" : "Simulate"}</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Tab content — shared slide animation */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          variants={tabVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {activeTab === "builder" && (
            <WorkflowBuilder
              mainSteps={mainSteps}
              setMainSteps={setMainSteps}
              yesSteps={yesSteps}
              setYesSteps={setYesSteps}
              noSteps={noSteps}
              setNoSteps={setNoSteps}
              selectedStep={selectedStep}
              setSelectedStep={setSelectedStep}
              handleAddStep={handleAddStep}
              handleRemoveStep={handleRemoveStep}
              handleUpdateStep={handleUpdateStep}
              handleUpdateStepConfig={handleUpdateStepConfig}
              simulationActive={simulationActive}
              simStepId={simStepId}
              simReport={simReport}
              handleGenerateStepEmail={handleGenerateStepEmail}
              isAiGenerating={isAiGenerating}
            />
          )}
          {activeTab === "copilot" && (
            <AICopilot
              aiPromptInput={aiPromptInput}
              setAiPromptInput={setAiPromptInput}
              aiResponse={aiResponse}
              setAiResponse={setAiResponse}
              isAiGenerating={isAiGenerating}
              handleGeneralAiGenerate={handleGeneralAiGenerate}
              selectedTemplateForAi={selectedTemplateForAi}
              setSelectedTemplateForAi={setSelectedTemplateForAi}
            />
          )}
          {activeTab === "templates" && <TemplatesLibrary notify={notify} />}
        </motion.div>
      </AnimatePresence>
    </>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
