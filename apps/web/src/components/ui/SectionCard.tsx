import { cn } from "@/lib/utils";

interface SectionCardProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  className,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden",
        className,
      )}
    >
      <div className="flex items-start gap-3 px-6 py-5 border-b border-border bg-muted/20">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-sm md:text-base lg:text-lg font-bold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-xs md:text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}
