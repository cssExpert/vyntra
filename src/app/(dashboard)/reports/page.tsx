import type { Metadata } from "next";
import { PageLoadWrapper } from "@/components/common/PageLoadWrapper";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <PageLoadWrapper>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="glass-card p-12 text-center max-w-sm w-full">
          <h1 className="text-xl font-bold font-display text-foreground mb-2">Reports</h1>
          <p className="text-sm text-muted-foreground">Analytics, insights, and custom reports.</p>
        </div>
      </div>
    </PageLoadWrapper>
  );
}
