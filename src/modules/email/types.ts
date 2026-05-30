export interface Toast {
  id: number;
  message: string;
  type: "success" | "warning" | "error" | "info";
}

export interface WorkflowStepConfig {
  triggerType?: string;
  subject?: string;
  aiPrompt?: string;
  generatedBody?: string;
  value?: number;
  unit?: string;
  conditionType?: string;
  yesId?: string;
  noId?: string;
}

export interface WorkflowStep {
  id: string;
  type: "trigger" | "action" | "delay" | "condition";
  label: string;
  description: string;
  config: WorkflowStepConfig;
}

export interface SimLog {
  time: string;
  message: string;
  status: "info" | "success" | "warning" | "error";
}

export type Branch = "main" | "yes" | "no";
