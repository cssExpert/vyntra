"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Renders truncated (single-line) text and shows a tooltip with the full value
 * ONLY when the text actually overflows. No tooltip when it fits.
 */
export function TruncatedText({
  children,
  className,
  tooltipClassName,
}: {
  children: string;
  className?: string;
  tooltipClassName?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setTruncated(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <p ref={ref} className={cn("truncate", className)}>
            {children}
          </p>
        </TooltipTrigger>
        {/* Only render the tooltip when the text is actually cut off. */}
        {truncated && (
          <TooltipContent
            side="top"
            className={cn("z-[200] max-w-xs break-words", tooltipClassName)}
          >
            {children}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
