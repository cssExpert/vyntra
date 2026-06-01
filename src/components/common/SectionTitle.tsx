import type { CSSProperties } from "react";
import { cn } from "@/lib/utils"; // Or your project's class-merging utility

const SectionTitle = ({
  title,
  paragraph,
  width = "600px",
  center,
  className,
  mb = "30px",
  style,
  titleClassName,
  paragraphClassName,
}: {
  title: string;
  paragraph: string;
  width?: string;
  center?: boolean;
  mb?: string;
  className?: string;
  /** Inline styles from the parent — merged over the defaults */
  style?: CSSProperties;
  titleClassName?: string;
  paragraphClassName?: string;
}) => {
  return (
    <>
      <div
        className={cn("w-full", center && "mx-auto text-center", className)}
        style={{ maxWidth: width, marginBottom: mb, ...style }}
      >
        <h2
          className={cn(
            "text-2xl md:text-3xl font-extrabold tracking-tight text-foreground",
            titleClassName,
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            "text-muted-foreground text-sm md:text-md mt-0.5",
            paragraphClassName,
          )}
        >
          {paragraph}
        </p>
      </div>
    </>
  );
};

export default SectionTitle;
