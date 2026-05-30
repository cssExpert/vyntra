import type { Metadata } from "next";
export const metadata: Metadata = { title: "CMS / Editor" };
export default function CMSPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]"><div className="glass-card p-12 text-center max-w-sm w-full"><h1 className="text-xl font-bold font-display text-foreground mb-2">CMS / Editor</h1><p className="text-sm text-muted-foreground">Page editor, blog, and content management.</p></div></div>
  );
}
