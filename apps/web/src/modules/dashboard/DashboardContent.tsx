"use client";

import { useAuth } from "@/providers/AuthProvider";
import { DashboardView } from "./DashboardView";
import { SuperAdminDashboardView } from "./SuperAdminDashboardView";
import { DashboardPageSkeleton } from "@/components/common/DashboardSkeleton";
import { usePageLoad } from "@/hooks/usePageLoad";
import { motion, AnimatePresence } from "framer-motion";

export function DashboardContent() {
  const { isSuperAdmin, isLoading } = useAuth();
  const isLoaded = usePageLoad(300);

  if (isLoading || !isLoaded) {
    return <DashboardPageSkeleton />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isSuperAdmin ? <SuperAdminDashboardView /> : <DashboardView />}
      </motion.div>
    </AnimatePresence>
  );
}
