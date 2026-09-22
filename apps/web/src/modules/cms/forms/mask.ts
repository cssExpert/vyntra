import type { FieldMask, FieldType } from "./forms.types";

/** Field types that can carry an input mask. */
export const MASK_SUPPORTED_TYPES: FieldType[] = [
  "short_text",
  "phone",
  "number",
  "password",
];

export function supportsMask(type: FieldType): boolean {
  return MASK_SUPPORTED_TYPES.includes(type);
}

/**
 * The effective mask for a field — an explicit mask wins; a `phone` field
 * defaults to the phone mask.
 */
export function effectiveMask(
  type: FieldType,
  mask?: FieldMask,
): Exclude<FieldMask, "none"> | undefined {
  if (mask && mask !== "none") return mask;
  if (type === "phone") return "phone";
  return undefined;
}

function maskPhone(value: string): string {
  const isIntl = value.trimStart().startsWith("+");
  const digits = value.replace(/\D/g, "");
  if (isIntl) {
    const chunks = digits.slice(0, 15).match(/.{1,3}/g) ?? [];
    return ("+" + chunks.join(" ")).trimEnd();
  }
  const d = digits.slice(0, 10);
  if (d.length === 0) return "";
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Formats `value` according to `mask`. Returns the value unchanged when unset. */
export function applyMask(
  mask: Exclude<FieldMask, "none"> | undefined,
  value: string,
): string {
  switch (mask) {
    case "card": {
      const d = value.replace(/\D/g, "").slice(0, 19);
      return (d.match(/.{1,4}/g) ?? []).join(" ");
    }
    case "expiry": {
      const d = value.replace(/\D/g, "").slice(0, 4);
      return d.length < 3 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
    }
    case "cvc":
      return value.replace(/\D/g, "").slice(0, 4);
    case "phone":
      return maskPhone(value);
    default:
      return value;
  }
}

/** Best `inputMode` for a mask (numeric keypad on mobile). */
export function maskInputMode(
  mask: Exclude<FieldMask, "none"> | undefined,
): "numeric" | "tel" | undefined {
  if (mask === "phone") return "tel";
  if (mask === "card" || mask === "expiry" || mask === "cvc") return "numeric";
  return undefined;
}
