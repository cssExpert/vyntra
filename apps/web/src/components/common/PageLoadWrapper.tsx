"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { StubPageSkeleton } from "./DashboardSkeleton";

export function PageLoadWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoaded = usePageLoad(700);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
        <motion.div
          key="skeleton"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <StubPageSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
