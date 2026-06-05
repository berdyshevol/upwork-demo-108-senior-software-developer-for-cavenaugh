// Deterministic seed data simulating the RAW payloads each external system returns.
// Each source has a deliberately different field shape — this is what the adapter
// layer (lib/adapters) normalizes away. Data is generated from a fixed seed and a
// fixed anchor date so the dashboard, API, and tests are perfectly reproducible
// (no Math.random, no Date.now).

import type { Source } from "./types";

// Fixed reporting window: the 60 days ending 2026-06-04 (inclusive).
export const ANCHOR_DATE = "2026-06-04";
const WINDOW_DAYS = 60;

// Tiny deterministic PRNG (mulberry32) so the seeded set never shifts.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateNDaysBefore(anchor: string, daysAgo: number): string {
  // Parse as UTC to avoid host-timezone drift.
  const [y, m, d] = anchor.split("-").map(Number);
  const base = Date.UTC(y, m - 1, d);
  const out = new Date(base - daysAgo * 86_400_000);
  return out.toISOString().slice(0, 10);
}

const SERVICES = [
  "AC repair",
  "Furnace install",
  "Drain cleaning",
  "Water heater replacement",
  "Thermostat install",
  "Leak detection",
  "Duct cleaning",
  "Emergency plumbing",
];

const FIRST_NAMES = [
  "Maria", "James", "Linda", "Robert", "Patricia", "Michael",
  "Jennifer", "David", "Susan", "Carlos", "Angela", "Brian",
];
const LAST_NAMES = [
  "Reyes", "Nguyen", "Carter", "Patel", "Brooks", "Flores",
  "Hughes", "Ward", "Foster", "Bryant", "Simmons", "Diaz",
];

// Per-source generation profile: volume, value range, and how likely a lead is
// to advance to booked/won. Numbers are tuned to look like real HVAC/plumbing data.
const PROFILE: Record<
  Source,
  { count: number; min: number; max: number; bookRate: number; winRate: number; spend: number; seed: number }
> = {
  google:   { count: 46, min: 180, max: 4200, bookRate: 0.55, winRate: 0.34, spend: 6200, seed: 101 },
  facebook: { count: 38, min: 150, max: 3200, bookRate: 0.42, winRate: 0.22, spend: 3100, seed: 202 },
  ghl:      { count: 28, min: 220, max: 5200, bookRate: 0.64, winRate: 0.46, spend: 1500, seed: 303 },
  website:  { count: 33, min: 160, max: 3800, bookRate: 0.5, winRate: 0.3, spend: 0, seed: 404 },
};

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length];
}

// ---- Raw, source-specific record shapes (intentionally inconsistent) ----

export interface GoogleAdsRecord {
  gclid: string;
  lead_status: "open" | "scheduled" | "converted";
  conversion_value: number;
  service_category: string;
  customer_name: string;
  date: string; // YYYY-MM-DD
}

export interface FacebookLeadRecord {
  lead_id: string;
  stage: "new" | "appointment" | "sale";
  value_usd: number;
  form_service: string;
  full_name: string;
  created_time: string; // YYYY-MM-DD
}

export interface GhlOpportunityRecord {
  contactId: string;
  pipelineStage: "lead" | "booked" | "won";
  opportunityValue: number;
  serviceTag: string;
  contactName: string;
  dateAdded: string; // YYYY-MM-DD
}

export interface WebsiteFormRecord {
  id: string;
  state: "received" | "scheduled" | "closed_won";
  est_value: number;
  service: string;
  name: string;
  submitted_at: string; // YYYY-MM-DD
}

function buildCommon(source: Source) {
  const p = PROFILE[source];
  const rnd = mulberry32(p.seed);
  return Array.from({ length: p.count }, (_, i) => {
    const rName = rnd();
    const rLast = rnd();
    const rSvc = rnd();
    const rVal = rnd();
    const rDay = rnd();
    const rBook = rnd();
    const rWin = rnd();
    const value = Math.round((p.min + rVal * (p.max - p.min)) / 10) * 10;
    const daysAgo = Math.floor(rDay * WINDOW_DAYS);
    const date = dateNDaysBefore(ANCHOR_DATE, daysAgo);
    const name = `${pick(FIRST_NAMES, rName)} ${pick(LAST_NAMES, rLast)}`;
    const service = pick(SERVICES, rSvc);
    // status ladder: every lead is at least "new"; some book; of those some win.
    const booked = rBook < p.bookRate;
    const won = booked && rWin < p.winRate;
    const status: 0 | 1 | 2 = won ? 2 : booked ? 1 : 0;
    return { i, value, date, name, service, status };
  });
}

export const googleRaw: GoogleAdsRecord[] = buildCommon("google").map((c) => ({
  gclid: `gclid_${c.i}`,
  lead_status: c.status === 2 ? "converted" : c.status === 1 ? "scheduled" : "open",
  conversion_value: c.value,
  service_category: c.service,
  customer_name: c.name,
  date: c.date,
}));

export const facebookRaw: FacebookLeadRecord[] = buildCommon("facebook").map((c) => ({
  lead_id: `fb_${c.i}`,
  stage: c.status === 2 ? "sale" : c.status === 1 ? "appointment" : "new",
  value_usd: c.value,
  form_service: c.service,
  full_name: c.name,
  created_time: c.date,
}));

export const ghlRaw: GhlOpportunityRecord[] = buildCommon("ghl").map((c) => ({
  contactId: `ghl_${c.i}`,
  pipelineStage: c.status === 2 ? "won" : c.status === 1 ? "booked" : "lead",
  opportunityValue: c.value,
  serviceTag: c.service,
  contactName: c.name,
  dateAdded: c.date,
}));

export const websiteRaw: WebsiteFormRecord[] = buildCommon("website").map((c) => ({
  id: `web_${c.i}`,
  state: c.status === 2 ? "closed_won" : c.status === 1 ? "scheduled" : "received",
  est_value: c.value,
  service: c.service,
  name: c.name,
  submitted_at: c.date,
}));

export const SPEND_BY_SOURCE: Record<Source, number> = {
  google: PROFILE.google.spend,
  facebook: PROFILE.facebook.spend,
  ghl: PROFILE.ghl.spend,
  website: PROFILE.website.spend,
};
