import type { CRMContact, PipelineStage } from "../types";

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "subscriber",  label: "Subscriber",               shortLabel: "Subscriber", color: "bg-slate-500/15",   textColor: "text-slate-400"  },
  { id: "lead",        label: "Lead",                     shortLabel: "Lead",       color: "bg-brand-500/12",   textColor: "text-brand-400"  },
  { id: "mql",         label: "Marketing Qualified Lead", shortLabel: "MQL",        color: "bg-purple-500/12",  textColor: "text-purple-400" },
  { id: "sql",         label: "Sales Qualified Lead",     shortLabel: "SQL",        color: "bg-cyan-500/12",    textColor: "text-cyan-400"   },
  { id: "opportunity", label: "Opportunity",              shortLabel: "Opp",        color: "bg-warning/12",     textColor: "text-warning"    },
  { id: "customer",    label: "Customer",                 shortLabel: "Customer",   color: "bg-success/12",     textColor: "text-success"    },
];

export const SAMPLE_CONTACTS: CRMContact[] = [
  // ── Leads ────────────────────────────────────────────
  {
    id: "c01", name: "Sarah Johnson", email: "sarah@techcorp.io",
    company: "TechCorp Inc", owner: "Alex Smith",
    stage: "lead", lastActivity: "Email · 2 days ago", lastContacted: "2024-12-01",
    source: "website", tags: ["enterprise", "hot"], value: 12500, createdAt: "2024-11-15",
  },
  {
    id: "c02", name: "Marcus Chen", email: "m.chen@innovate.co",
    company: "Innovate Co", owner: "Emma Davis",
    stage: "lead", lastActivity: "Call · 4 days ago", lastContacted: "2024-11-28",
    source: "referral", tags: ["mid-market"], value: 8750, createdAt: "2024-11-20",
  },
  {
    id: "c03", name: "Priya Patel", email: "priya@startupxyz.com",
    company: "StartupXYZ", owner: undefined,
    stage: "lead", lastActivity: "Form submit · 1 day ago", lastContacted: undefined,
    source: "website", tags: ["startup", "warm"], value: 4500, createdAt: "2024-12-01",
  },
  {
    id: "c04", name: "fouad@networkhandlers.com", email: "fouad@networkhandlers.com",
    company: "Network Handlers", owner: "Alex Smith",
    stage: "lead", lastActivity: "Email · 11 years ago", lastContacted: "2015-01-30",
    source: "cold_outreach", tags: [], value: 0, createdAt: "2013-06-12",
  },
  {
    id: "c05", name: "Alok Singh", email: "alok.singh@sgtelecom.in",
    company: "SG Telecom", owner: "Ravi Gupta",
    stage: "lead", lastActivity: "Email · 11 years ago", lastContacted: "2015-02-03",
    source: "organic", tags: [], value: 0, createdAt: "2013-08-05",
  },
  {
    id: "c06", name: "HSBC Internet Banking", email: "noreply@hsbc.co.uk",
    company: "HSBC UK", owner: undefined,
    stage: "lead", lastActivity: "Email · 11 years ago", lastContacted: undefined,
    source: "organic", tags: [], value: 0, createdAt: "2013-05-20",
  },
  {
    id: "c07", name: "Aisha Mohammed", email: "aisha@digitalwave.net",
    company: "DigitalWave", owner: "Emma Davis",
    stage: "lead", lastActivity: "Email · 3 days ago", lastContacted: "2024-11-27",
    source: "social", tags: ["mid-market"], value: 6200, createdAt: "2024-11-25",
  },
  {
    id: "c08", name: "Lena Müller", email: "l.muller@kreativ.de",
    company: "Kreativ GmbH", owner: "Alex Smith",
    stage: "lead", lastActivity: "Website visit · 1 week ago", lastContacted: undefined,
    source: "organic", tags: [], value: 3000, createdAt: "2024-11-10",
  },
  // ── MQL ──────────────────────────────────────────────
  {
    id: "c09", name: "James Wilson", email: "jwilson@globalent.com",
    company: "Global Enterprises", owner: "Alex Smith",
    stage: "mql", lastActivity: "Demo request · 2 days ago", lastContacted: "2024-11-30",
    source: "paid_ads", tags: ["enterprise", "hot", "priority"], value: 45000, createdAt: "2024-10-15",
  },
  {
    id: "c10", name: "Nina Torres", email: "n.torres@nexusmedia.com",
    company: "Nexus Media", owner: "Emma Davis",
    stage: "mql", lastActivity: "Webinar · 5 days ago", lastContacted: "2024-11-25",
    source: "email", tags: ["mid-market"], value: 11000, createdAt: "2024-10-28",
  },
  // ── SQL ──────────────────────────────────────────────
  {
    id: "c11", name: "Carlos Rivera", email: "c.rivera@solarspark.io",
    company: "SolarSpark", owner: "Ravi Gupta",
    stage: "sql", lastActivity: "Proposal sent · 1 day ago", lastContacted: "2024-12-01",
    source: "referral", tags: ["hot", "enterprise"], value: 32000, createdAt: "2024-09-20",
  },
  // ── Opportunity ───────────────────────────────────────
  {
    id: "c12", name: "Yuki Tanaka", email: "yuki@brightpath.jp",
    company: "BrightPath KK", owner: "Alex Smith",
    stage: "opportunity", lastActivity: "Negotiation · today", lastContacted: "2024-12-02",
    source: "referral", tags: ["enterprise", "hot"], value: 78000, createdAt: "2024-08-15",
  },
  // ── Subscriber ────────────────────────────────────────
  {
    id: "c13", name: "Robin Blake", email: "robin@freelancer.dev",
    company: undefined, owner: undefined,
    stage: "subscriber", lastActivity: "Newsletter open · 1 week ago", lastContacted: undefined,
    source: "organic", tags: ["newsletter"], value: 0, createdAt: "2024-07-01",
  },
  // ── Customer ─────────────────────────────────────────
  {
    id: "c14", name: "Acme Corp", email: "billing@acmecorp.com",
    company: "Acme Corp", owner: "Ravi Gupta",
    stage: "customer", lastActivity: "Invoice paid · 1 day ago", lastContacted: "2024-12-01",
    source: "website", tags: ["enterprise", "annual"], value: 24000, createdAt: "2023-01-10",
  },
  {
    id: "c15", name: "Nova Studio", email: "hello@novastudio.co",
    company: "Nova Studio", owner: "Emma Davis",
    stage: "customer", lastActivity: "Support ticket · 3 days ago", lastContacted: "2024-11-29",
    source: "social", tags: ["monthly"], value: 4800, createdAt: "2023-06-15",
  },
];
