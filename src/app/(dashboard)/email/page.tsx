import type { Metadata } from "next";
export const metadata: Metadata = { title: "Email Automations" };
export default function EmailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]"><div className="glass-card p-12 text-center max-w-sm w-full"><h1 className="text-xl font-bold font-display text-foreground mb-2">Email Automations</h1><p className="text-sm text-muted-foreground">Campaigns, sequences, and email workflows.</p></div></div>
  );
}
