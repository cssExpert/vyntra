import type { Metadata } from "next";
export const metadata: Metadata = { title: "Lighthouse" };
export default function LighthousePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]"><div className="glass-card p-12 text-center max-w-sm w-full"><h1 className="text-xl font-bold font-display text-foreground mb-2">Lighthouse</h1><p className="text-sm text-muted-foreground">Website performance audits and scores.</p></div></div>
  );
}
