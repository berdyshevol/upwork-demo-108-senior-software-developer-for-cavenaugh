import { NextResponse } from "next/server";
import {
  computeAttribution,
  computeSummary,
  filterLeads,
  loadPortalData,
  type LeadFilter,
} from "@/lib/attribution";
import type { LeadsApiResponse, Source } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_SOURCES: Source[] = ["google", "facebook", "ghl", "website"];

// GET /api/leads?source=ghl&from=2026-05-01&to=2026-06-04
// Returns normalized leads plus server-computed attribution + blended summary.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const sourceParam = searchParams.get("source");
  const filter: LeadFilter = {
    source:
      sourceParam && VALID_SOURCES.includes(sourceParam as Source)
        ? (sourceParam as Source)
        : "all",
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  };

  const { leads, spendBySource } = await loadPortalData();
  const filtered = filterLeads(leads, filter);

  const body: LeadsApiResponse = {
    leads: filtered,
    attribution: computeAttribution(filtered, spendBySource),
    summary: computeSummary(filtered, spendBySource),
  };

  return NextResponse.json(body, {
    headers: { "cache-control": "no-store" },
  });
}
