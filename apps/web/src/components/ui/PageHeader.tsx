"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-foreground font-medium">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground text-sm md:text-md mt-0.5">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-shrink-0 items-center gap-2 mt-3 sm:mt-0">
          {children}
        </div>
      )}
    </motion.div>
  );
}
