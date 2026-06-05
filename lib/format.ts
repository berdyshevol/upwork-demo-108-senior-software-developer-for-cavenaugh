import type { Source } from "./types";

export function usd(n: number, opts: { cents?: boolean } = {}): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.cents ? 2 : 0,
    maximumFractionDigits: opts.cents ? 2 : 0,
  }).format(n);
}

export function num(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export const SOURCE_COLOR: Record<Source, string> = {
  google: "#4285f4",
  facebook: "#1877f2",
  ghl: "#f59e0b",
  website: "#10b981",
};

export const STATUS_STYLE: Record<string, string> = {
  new: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-400/30",
  booked: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30",
  won: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
};
