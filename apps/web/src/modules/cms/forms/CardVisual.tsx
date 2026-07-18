import { cn } from "@/lib/utils";

export interface CardVisualProps {
  cardholder?: string;
  expires?: string;
  cvv?: string;
  brandLabel?: string;
  className?: string;
}

/**
 * Decorative credit-card graphic for checkout / payment forms. Purely visual —
 * collects no value. Themed with the primary colour so it adapts to light/dark.
 */
export function CardVisual({
  cardholder = "Cardholder Name",
  expires = "MM/YY",
  cvv = "•••",
  brandLabel = "Secured Node",
  className,
}: CardVisualProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-md overflow-hidden rounded-2xl p-5 text-white shadow-lg",
        "bg-gradient-to-br from-primary to-indigo-700",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="h-8 w-11 rounded-md bg-amber-400/90" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
          {brandLabel}
        </span>
      </div>
      <div className="mt-8 flex items-center gap-3 text-lg tracking-[0.3em] text-white/90">
        <span>••••</span>
        <span>••••</span>
        <span>••••</span>
        <span>••••</span>
      </div>
      <div className="mt-6 flex items-end justify-between text-[10px] uppercase tracking-wider text-white/70">
        <div>
          <p className="text-white/50">Cardholder</p>
          <p className="mt-0.5 text-xs font-semibold tracking-normal text-white">
            {cardholder}
          </p>
        </div>
        <div>
          <p className="text-white/50">Expires</p>
          <p className="mt-0.5 text-xs font-semibold tracking-normal text-white">
            {expires}
          </p>
        </div>
        <div>
          <p className="text-white/50">CVV</p>
          <p className="mt-0.5 text-xs font-semibold tracking-normal text-white">
            {cvv}
          </p>
        </div>
      </div>
    </div>
  );
}
