import type { Metadata } from "next";
export const metadata: Metadata = { title: "CRM" };
export default function CRMPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]"><div className="glass-card p-12 text-center max-w-sm w-full"><h1 className="text-xl font-bold font-display text-foreground mb-2">CRM</h1><p className="text-sm text-muted-foreground">Leads, contacts, pipelines and deals.</p></div></div>
  );
}
