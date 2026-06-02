export type ContactStage =
  | "subscriber"
  | "lead"
  | "mql"
  | "sql"
  | "opportunity"
  | "customer";

export type ContactSource =
  | "website"
  | "referral"
  | "social"
  | "email"
  | "paid_ads"
  | "organic"
  | "cold_outreach";

export interface CRMContact {
  id: string;
  name: string;
  email: string;
  company?: string;
  companyIcon?: string;
  owner?: string;
  stage: ContactStage;
  lastActivity?: string;
  lastContacted?: string;
  source?: ContactSource;
  tags?: string[];
  phone?: string;
  value?: number;
  createdAt: string;
  isUnsubscribed?: boolean;
}

export interface PipelineStage {
  id: ContactStage;
  label: string;
  shortLabel: string;
  color: string;
  textColor: string;
}

export type CRMViewMode = "board" | "list";
export type ContactListTab = "all" | "newsletter" | "unsubscribed" | "customers";

export interface ContactListTabDef {
  id: ContactListTab;
  label: string;
  count?: number;
}
