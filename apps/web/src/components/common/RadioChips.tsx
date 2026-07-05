"use client";

/** Compact grid of chip-style radio options — e.g. discount type, 3-way restriction mode. */
export function RadioChips<T extends string>({
  options,
  value,
  onChange,
  columns = 3,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  columns?: number;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center justify-center gap-2 cursor-pointer rounded-md border px-3 py-2.5 text-center transition-all ${
            value === opt.value
              ? "border-primary bg-primary/5"
              : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
          }`}
        >
          <input
            type="radio"
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="sr-only"
          />
          <span className={`text-[13px] font-medium ${value === opt.value ? "text-primary" : "text-foreground"}`}>
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
}
