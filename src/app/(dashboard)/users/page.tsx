import type { Metadata } from "next";
export const metadata: Metadata = { title: "Users" };
export default function UsersPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]"><div className="glass-card p-12 text-center max-w-sm w-full"><h1 className="text-xl font-bold font-display text-foreground mb-2">Users</h1><p className="text-sm text-muted-foreground">Team members, roles, and permissions.</p></div></div>
  );
}
