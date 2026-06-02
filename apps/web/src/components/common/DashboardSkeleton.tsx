"use client";

import React from "react";

// Base shimmer block — uses .shimmer from globals.css (theme-aware gradient sweep)
function Sk({
  className = "",
  circle = false,
}: {
  className?: string;
  circle?: boolean;
}) {
  return (
    <div
      className={`shimmer ${circle ? "rounded-full" : "rounded-md"} ${className}`}
    />
  );
}

function GlassCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`glass-card p-5 ${className}`}>{children}</div>;
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD PAGE
════════════════════════════════════════════════════════════════ */
export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <Sk className="h-7 w-40 mb-2" />
          <Sk className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Sk className="h-9 w-24" />
          <Sk className="h-9 w-28" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <Sk className="h-3 w-20" />
              <Sk className="h-7 w-7" circle />
            </div>
            <Sk className="h-7 w-28 mb-2" />
            <Sk className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Main 3-col grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Chart card (2/3) */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Sk className="h-4 w-36 mb-1.5" />
              <Sk className="h-3 w-52" />
            </div>
            <Sk className="h-4 w-20" />
          </div>
          <Sk className="h-[196px] w-full mb-3" />
          <div className="flex items-center gap-4 pt-3 border-t border-border">
            <Sk className="h-3 w-24" />
            <Sk className="h-3 w-24" />
            <div className="ml-auto">
              <Sk className="h-3 w-16 mb-1" />
              <Sk className="h-5 w-20" />
            </div>
          </div>
        </GlassCard>

        {/* Activity card (1/3) */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <Sk className="h-4 w-28" />
            <Sk className="h-3 w-14" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Sk className="h-7 w-7 shrink-0" circle />
                <div className="flex-1 min-w-0">
                  <Sk className="h-3 w-full mb-1.5" />
                  <Sk className="h-2.5 w-3/4" />
                </div>
                <Sk className="h-2.5 w-10 shrink-0" />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Second row (3-col) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Leads */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <Sk className="h-4 w-20" />
            <Sk className="h-3 w-16" />
          </div>
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Sk className="h-7 w-7 shrink-0" circle />
                <div className="flex-1">
                  <Sk className="h-3 w-28 mb-1.5" />
                  <Sk className="h-2.5 w-20" />
                </div>
                <Sk className="h-5 w-16" />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Payments */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <Sk className="h-4 w-24" />
            <Sk className="h-3 w-16" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2.5">
                  <Sk className="h-7 w-7 shrink-0" />
                  <div>
                    <Sk className="h-3 w-24 mb-1.5" />
                    <Sk className="h-2.5 w-16" />
                  </div>
                </div>
                <Sk className="h-4 w-16" />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Lighthouse + Integrations */}
        <GlassCard>
          <Sk className="h-4 w-32 mb-4" />
          <div className="flex items-center justify-around mb-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <Sk className="h-[52px] w-[52px]" circle />
                <Sk className="h-2.5 w-12" />
              </div>
            ))}
          </div>
          <Sk className="h-px w-full mb-4" />
          <Sk className="h-4 w-24 mb-3" />
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Sk className="h-7 w-7 shrink-0" />
                <Sk className="h-3 w-28 flex-1" />
                <Sk className="h-5 w-16" />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   USERS PAGE
════════════════════════════════════════════════════════════════ */
export function UsersPageSkeleton() {
  const colWidths = [
    "flex-[2]",    // Name
    "flex-[2.5]",  // Email
    "flex-[1.5]",  // Phone
    "flex-[1]",    // Role
    "flex-[1.2]",  // Group
    "flex-[1]",    // Status
    "flex-[0.8]",  // Lock
    "flex-[1.2]",  // Joined
    "flex-[0.7]",  // Actions
  ];

  const headerWidths = ["w-12", "w-10", "w-10", "w-8", "w-12", "w-10", "w-6", "w-10", "w-14"];
  const cellShapes = [
    <div key="name" className="flex items-center gap-2.5"><Sk className="h-8 w-8 shrink-0" circle /><Sk className="h-3.5 w-24" /></div>,
    <Sk key="email" className="h-3 w-36" />,
    <Sk key="phone" className="h-3 w-24" />,
    <Sk key="role" className="h-5 w-14" />,
    <Sk key="group" className="h-5 w-20 rounded-full" />,
    <Sk key="status" className="h-5 w-16 rounded-full" />,
    <Sk key="lock" className="h-3 w-8" />,
    <Sk key="joined" className="h-3 w-20" />,
    <div key="actions" className="flex items-center justify-end gap-2"><Sk className="h-7 w-7" /><Sk className="h-7 w-7" /></div>,
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div style={{ marginBottom: "20px" }}>
          <Sk className="h-8 w-24 mb-1.5" />
          <Sk className="h-4 w-16" />
        </div>
        <Sk className="h-9 w-28" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Search */}
        <Sk className="h-10 w-72 mb-6" />

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Table header row */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-muted/40">
            {colWidths.map((flex, i) => (
              <div key={i} className={`${flex} flex items-center`}>
                <Sk className={`h-3 ${headerWidths[i]}`} />
              </div>
            ))}
          </div>

          {/* Table body rows */}
          {Array.from({ length: 5 }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0"
            >
              {colWidths.map((flex, colIdx) => (
                <div key={colIdx} className={`${flex} flex items-center`}>
                  {cellShapes[colIdx]}
                </div>
              ))}
            </div>
          ))}

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-muted/40 border-t border-border">
            <Sk className="h-3 w-44" />
            <Sk className="h-3 w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CRM PAGE
════════════════════════════════════════════════════════════════ */
export function CRMPageSkeleton() {
  return (
    <div>
      {/* Header tab bar */}
      <div className="flex items-center gap-3 mb-4">
        <Sk className="h-9 w-28" />
        <div className="flex items-center gap-1 flex-1 overflow-hidden">
          {["w-24", "w-36", "w-28", "w-28"].map((w, i) => (
            <Sk key={i} className={`h-9 ${w}`} />
          ))}
          <Sk className="h-8 w-8 shrink-0" />
        </div>
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <Sk className="h-8 w-8" />
          <Sk className="h-9 w-32" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 py-2 mb-3">
        {["w-16", "w-20", "w-24", "w-20"].map((w, i) => (
          <Sk key={i} className={`h-7 ${w} rounded-full`} />
        ))}
        <div className="ml-auto flex gap-2">
          <Sk className="h-8 w-8" />
          <Sk className="h-8 w-8" />
        </div>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, col) => (
          <div key={col} className="space-y-3">
            {/* Column header */}
            <div className="flex items-center justify-between px-1 py-1">
              <Sk className="h-4 w-20" />
              <Sk className="h-5 w-7 rounded-full" />
            </div>
            {/* Cards */}
            {Array.from({ length: 3 }).map((_, card) => (
              <div key={card} className="glass-card p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Sk className="h-4 w-28" />
                  <Sk className="h-4 w-4" circle />
                </div>
                <Sk className="h-3 w-20" />
                <Sk className="h-5 w-16 rounded-full" />
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <Sk className="h-5 w-5" circle />
                  <Sk className="h-3 w-12" />
                </div>
              </div>
            ))}
            <Sk className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMAIL PAGE
════════════════════════════════════════════════════════════════ */
export function EmailPageSkeleton() {
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div style={{ marginBottom: "20px" }}>
          <Sk className="h-3 w-48 mb-2" />
          <Sk className="h-8 w-72 mb-1.5" />
          <Sk className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-3">
          <Sk className="h-9 w-40" />
          <Sk className="h-9 w-28" />
        </div>
      </div>

      {/* Tab content — workflow builder layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        {/* Builder canvas */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <Sk className="h-4 w-36" />
            <Sk className="h-4 w-16" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 border border-border rounded-lg"
            >
              <Sk className="h-8 w-8 shrink-0" />
              <div className="flex-1 min-w-0">
                <Sk className="h-3.5 w-32 mb-1.5" />
                <Sk className="h-3 w-48" />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Sk className="h-6 w-16" />
                <Sk className="h-6 w-6" />
              </div>
            </div>
          ))}
          {/* Sim log area */}
          <div className="mt-4 border border-border rounded-lg p-3 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Sk key={i} className="h-3 w-full" />
            ))}
          </div>
        </div>

        {/* Step config panel */}
        <div className="glass-card p-5 space-y-4">
          <Sk className="h-4 w-28 mb-2" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <Sk className="h-3 w-20 mb-1.5" />
              <Sk className="h-9 w-full" />
            </div>
          ))}
          <Sk className="h-10 w-full mt-2" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STUB PAGE (calling, cms, payments, reports, seo, lighthouse,
              store, settings)
════════════════════════════════════════════════════════════════ */
export function StubPageSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="glass-card p-12 max-w-sm w-full">
        <Sk className="h-6 w-32 mx-auto mb-3" />
        <Sk className="h-4 w-56 mx-auto mb-1.5" />
        <Sk className="h-4 w-40 mx-auto" />
      </div>
    </div>
  );
}
