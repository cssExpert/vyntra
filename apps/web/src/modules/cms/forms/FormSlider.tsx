"use client";

export interface FormSliderProps {
  /** Current value as a string ("" → defaults to the midpoint). */
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

/**
 * A themed range slider — a styled track with a primary fill, a clean thumb and
 * a value readout. Built on a native range input (kept transparent on top) so
 * it stays keyboard-accessible without a third-party dependency.
 */
export function FormSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
}: FormSliderProps) {
  const current = value === "" ? Math.round((min + max) / 2) : Number(value);
  const clamped = Math.min(max, Math.max(min, isNaN(current) ? min : current));
  const pct = max > min ? ((clamped - min) / (max - min)) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-5 flex-1 items-center">
        {/* Track */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-muted" />
        {/* Filled portion */}
        <div
          className="absolute left-0 h-1.5 rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
        {/* Thumb */}
        <div
          className={`absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-primary bg-white shadow transition-transform ${
            disabled ? "" : "hover:scale-110"
          }`}
          style={{ left: `${pct}%` }}
        />
        {/* Transparent native input for interaction + a11y */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={clamped}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`absolute inset-0 w-full cursor-pointer opacity-0 ${
            disabled ? "cursor-not-allowed" : ""
          }`}
          style={{ margin: 0 }}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clamped}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-sm font-semibold text-foreground">
        {clamped}
      </span>
    </div>
  );
}
