/**
 * Consistent USD display for the audit UI (US-style grouping, always USD symbol).
 */

export function formatUsd(
  amount: number,
  options?: { maximumFractionDigits?: number }
): string {
  const maxFrac =
    options?.maximumFractionDigits ??
    (Number.isFinite(amount) && Math.abs(amount % 1) < 1e-9 ? 0 : 2);
  const rounded =
    maxFrac === 0 ? Math.round(amount) : Math.round(amount * 100) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: maxFrac === 0 ? 0 : 2,
    minimumFractionDigits: maxFrac === 0 ? 0 : 2,
  }).format(rounded);
}

export function formatUsdCompact(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: amount >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: amount >= 1_000_000 ? 1 : 0,
  }).format(amount);
}
