// Core domain types for the Lead Attribution portal.
// These are intentionally provider-agnostic: the adapter layer (lib/adapters)
// maps each external system (Google Ads, Facebook, GoHighLevel, Website forms)
// onto these shapes so the UI never knows where a lead came from.

export type Source = "google" | "facebook" | "ghl" | "website";

export type LeadStatus = "new" | "booked" | "won";

export interface Lead {
  id: string;
  source: Source;
  status: LeadStatus;
  /** Deal/job value in USD. For new/booked leads this is the estimated value. */
  value: number;
  /** Customer-facing name, for the lead table. */
  name: string;
  /** Service line, e.g. "HVAC repair", "Drain cleaning". */
  service: string;
  /** ISO date (YYYY-MM-DD) the lead was created. */
  createdAt: string;
}

export interface SourceSpend {
  source: Source;
  /** Marketing spend in USD for the reporting period. */
  spend: number;
  /** Reporting period label, e.g. "2026-05". */
  period: string;
}

/** Per-source attribution, computed server-side from leads + spend. */
export interface SourceAttribution {
  source: Source;
  leads: number;
  booked: number;
  won: number;
  spend: number;
  revenue: number;
  /** Cost per lead = spend / leads (0 when no leads). */
  cpl: number;
  /** Return on ad spend = revenue / spend (0 when no spend). */
  roas: number;
}

export interface AttributionSummary {
  totalLeads: number;
  bookedAppointments: number;
  wonDeals: number;
  revenue: number;
  totalSpend: number;
  /** Blended cost per lead across every source. */
  blendedCpl: number;
}

export interface LeadsApiResponse {
  leads: Lead[];
  attribution: SourceAttribution[];
  summary: AttributionSummary;
}
