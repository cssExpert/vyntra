import type { Metadata } from "next";
import { PageLoadWrapper } from "@/components/common/PageLoadWrapper";

export const metadata: Metadata = { title: "Calling" };

export default function CallingPage() {
  return (
    <PageLoadWrapper>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="glass-card p-12 text-center max-w-sm w-full">
          <h1 className="text-xl font-bold font-display text-foreground mb-2">Calling</h1>
          <p className="text-sm text-muted-foreground">VoIP calls, call logs, and recordings.</p>
        </div>
      </div>
    </PageLoadWrapper>
  );
}
