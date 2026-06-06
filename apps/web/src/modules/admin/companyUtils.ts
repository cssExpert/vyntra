// Shared helpers for the super-admin Companies area.

/** Generate a reasonably strong, human-typable password (no ambiguous chars). */
export function generateSecurePassword(length = 16): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%^&*-_+=";
  const all = upper + lower + digits + symbols;

  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];

  // Guarantee at least one of each class, then fill the rest.
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  while (chars.length < length) chars.push(pick(all));

  // Fisher–Yates shuffle so the guaranteed chars aren't always up front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export function formatPrice(cents: number, cycle?: string): string {
  if (!cents) return "Free";
  const amount = (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  });
  const suffix =
    cycle === "MONTHLY"
      ? "/mo"
      : cycle === "YEARLY"
        ? "/yr"
        : cycle === "LIFETIME"
          ? " once"
          : "";
  return `${amount}${suffix}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function cycleLabel(cycle: string): string {
  return cycle.charAt(0) + cycle.slice(1).toLowerCase();
}
