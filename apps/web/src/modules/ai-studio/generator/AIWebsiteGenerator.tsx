"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAIStudioStore, convertPageToEditorNodes } from "@/store/aiStudioStore";
import { useEditorStore } from "@/store/editorStore";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Step1BusinessInfo } from "./steps/Step1BusinessInfo";
import { Step2DesignPreferences } from "./steps/Step2DesignPreferences";
import { Step3PageSelection } from "./steps/Step3PageSelection";
import { Step4Generation } from "./steps/Step4Generation";
import { GenerationPreview } from "./GenerationPreview";
import { cn } from "@/lib/utils";

const STEPS = [
  { number: 1, label: "Business Info" },
  { number: 2, label: "Design" },
  { number: 3, label: "Pages" },
  { number: 4, label: "Generate" },
];

function StepIndicator({ current, complete }: { current: number; complete: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-1.5">
        {STEPS.map((step) => {
          const done = complete || current > step.number;
          const active = !complete && current === step.number;
          return (
            <div
              key={step.number}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                active ? "w-5 bg-primary" :
                done  ? "w-2 bg-primary/50" :
                        "w-2 bg-border",
              )}
            />
          );
        })}
      </div>
      {/* Label only for the active step */}
      <span className="text-[10px] font-semibold text-primary whitespace-nowrap h-3">
        {!complete && STEPS.find((s) => s.number === current)?.label}
      </span>
    </div>
  );
}

export function AIWebsiteGenerator() {
  const { wizard, closeWizard, setWizardStep, updateProjectStatus } = useAIStudioStore();
  const { setPendingNodes } = useEditorStore();
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);

  const { currentStep, generationComplete } = wizard;

  function handleClose() {
    setShowPreview(false);
    closeWizard();
  }

  function handleNext() {
    if (currentStep < 4) setWizardStep((currentStep + 1) as 1 | 2 | 3 | 4);
  }

  function handleBack() {
    if (currentStep > 1) setWizardStep((currentStep - 1) as 1 | 2 | 3 | 4);
  }

  function handleGenerationComplete() {
    // Project already saved by startGeneration — just show preview
    setShowPreview(true);
  }

  function handleOpenEditor() {
    const website = wizard.generatedWebsite;
    if (!website) return;
    const firstPage = website.pages[0];
    if (!firstPage) { handleClose(); router.push("/cms/editor"); return; }

    const nodes = convertPageToEditorNodes(firstPage);
    setPendingNodes(nodes);

    const projectId = wizard.currentProjectId;
    if (projectId) updateProjectStatus(projectId, "in-editor");

    const pageSlug = firstPage.slug.replace(/^\//, "") || "home";
    handleClose();
    router.push(`/cms/editor?page=${pageSlug}&project=${projectId ?? ""}`);
  }

  return (
    <Dialog open={wizard.isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-4xl h-[92vh] p-0 flex flex-col overflow-hidden gap-0"
      >
        <DialogTitle className="sr-only">ERV Studio — AI Website Generator</DialogTitle>
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {showPreview ? "Website Preview" : "ERV Studio — AI Website Generator"}
              </p>
              <p className="text-xs text-muted-foreground">
                {showPreview
                  ? "Review your generated website before opening in the editor"
                  : "Generate a complete website in minutes"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!showPreview && (
              <StepIndicator current={currentStep} complete={generationComplete} />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {showPreview ? (
            <GenerationPreview onOpenEditor={handleOpenEditor} onClose={handleClose} />
          ) : (
            <>
              {currentStep === 1 && <Step1BusinessInfo onNext={handleNext} />}
              {currentStep === 2 && <Step2DesignPreferences onNext={handleNext} onBack={handleBack} />}
              {currentStep === 3 && <Step3PageSelection onNext={handleNext} onBack={handleBack} />}
              {currentStep === 4 && <Step4Generation onComplete={handleGenerationComplete} />}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
