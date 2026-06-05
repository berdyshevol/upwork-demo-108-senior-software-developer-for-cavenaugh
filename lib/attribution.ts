// Server-side aggregation: pull normalized leads + spend from every adapter,
// then compute attribution (CPL, ROAS, revenue/source) and the blended summary.
// This is the single source of truth shared by the dashboard, /leads, and the API.

import { adapters } from "./adapters";
import type {
  AttributionSummary,
  Lead,
  Source,
  SourceAttribution,
} from "./types";

const SOURCE_ORDER: Source[] = ["google", "facebook", "ghl", "website"];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Revenue is recognized only on WON deals. */
function revenueOf(leads: Lead[]): number {
  return leads.reduce((sum, l) => (l.status === "won" ? sum + l.value : sum), 0);
}

export interface PortalData {
  leads: Lead[];
  spendBySource: Record<Source, number>;
}

/** Fetch + normalize everything through the adapter layer. */
export async function loadPortalData(): Promise<PortalData> {
  const leadResults = await Promise.all(adapters.map((a) => a.fetchLeads()));
  const spendResults = await Promise.all(adapters.map((a) => a.fetchSpend()));

  const leads = leadResults
    .flat()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); // newest first

  const spendBySource = {} as Record<Source, number>;
  for (const s of spendResults) spendBySource[s.source] = s.spend;

  return { leads, spendBySource };
}

/** Compute per-source attribution from a (possibly filtered) lead set. */
export function computeAttribution(
  leads: Lead[],
  spendBySource: Record<Source, number>
): SourceAttribution[] {
  return SOURCE_ORDER.map((source) => {
    const rows = leads.filter((l) => l.source === source);
    const spend = spendBySource[source] ?? 0;
    const revenue = revenueOf(rows);
    const count = rows.length;
    return {
      source,
      leads: count,
      booked: rows.filter((l) => l.status === "booked").length,
      won: rows.filter((l) => l.status === "won").length,
      spend,
      revenue,
      cpl: count > 0 ? round2(spend / count) : 0,
      roas: spend > 0 ? round2(revenue / spend) : 0,
    };
  }).filter((a) => a.leads > 0);
}

/** Blended KPI summary across all sources in the given lead set. */
export function computeSummary(
  leads: Lead[],
  spendBySource: Record<Source, number>
): AttributionSummary {
  const totalLeads = leads.length;
  // Only count spend for sources that actually appear in this (filtered) set,
  // so blended CPL stays honest when the user filters to one channel.
  const presentSources = new Set(leads.map((l) => l.source));
  const totalSpend = SOURCE_ORDER.reduce(
    (sum, s) => (presentSources.has(s) ? sum + (spendBySource[s] ?? 0) : sum),
    0
  );
  return {
    totalLeads,
    bookedAppointments: leads.filter((l) => l.status === "booked").length,
    wonDeals: leads.filter((l) => l.status === "won").length,
    revenue: revenueOf(leads),
    totalSpend,
    blendedCpl: totalLeads > 0 ? round2(totalSpend / totalLeads) : 0,
  };
}

/** Leads grouped by day for the trend chart, oldest → newest. */
export function leadsByDay(
  leads: Lead[]
): { date: string; leads: number; booked: number; won: number }[] {
  const byDay = new Map<string, { leads: number; booked: number; won: number }>();
  for (const l of leads) {
    const e = byDay.get(l.createdAt) ?? { leads: 0, booked: 0, won: 0 };
    e.leads += 1;
    if (l.status === "booked") e.booked += 1;
    if (l.status === "won") e.won += 1;
    byDay.set(l.createdAt, e);
  }
  return [...byDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, v]) => ({ date, ...v }));
}

export interface LeadFilter {
  source?: Source | "all";
  from?: string; // inclusive YYYY-MM-DD
  to?: string; // inclusive YYYY-MM-DD
}

export function filterLeads(leads: Lead[], f: LeadFilter): Lead[] {
  return leads.filter((l) => {
    if (f.source && f.source !== "all" && l.source !== f.source) return false;
    if (f.from && l.createdAt < f.from) return false;
    if (f.to && l.createdAt > f.to) return false;
    return true;
  });
}
