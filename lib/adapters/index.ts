// ============================================================================
// SOURCE ADAPTER LAYER
// ----------------------------------------------------------------------------
// Every marketing/CRM source the portal supports implements ONE interface:
// `SourceAdapter`. The adapter's job is to translate that system's raw,
// idiosyncratic payload into the canonical `Lead` shape the rest of the app
// uses. Swapping the mock for a live Google Ads / Facebook / GoHighLevel API
// means replacing the `fetchRawLeads()` body — nothing in the UI changes.
//
// This is the seam the PRD calls out: "a real GoHighLevel/Google/Facebook API
// could replace the mock without UI changes."
// ============================================================================

import type { Lead, LeadStatus, Source, SourceSpend } from "../types";
import {
  ANCHOR_DATE,
  SPEND_BY_SOURCE,
  facebookRaw,
  ghlRaw,
  googleRaw,
  websiteRaw,
  type FacebookLeadRecord,
  type GhlOpportunityRecord,
  type GoogleAdsRecord,
  type WebsiteFormRecord,
} from "../seed";

export interface SourceAdapter {
  readonly source: Source;
  /** Human label for the channel, used in the UI. */
  readonly label: string;
  /** Normalized leads for this source. Async to mirror a real network call. */
  fetchLeads(): Promise<Lead[]>;
  /** Marketing spend for the reporting period. */
  fetchSpend(): Promise<SourceSpend>;
}

const PERIOD = ANCHOR_DATE.slice(0, 7); // "2026-06"

// ---- Google Ads -----------------------------------------------------------
class GoogleAdsAdapter implements SourceAdapter {
  readonly source = "google" as const;
  readonly label = "Google Ads";

  private toStatus(s: GoogleAdsRecord["lead_status"]): LeadStatus {
    return s === "converted" ? "won" : s === "scheduled" ? "booked" : "new";
  }

  async fetchLeads(): Promise<Lead[]> {
    return googleRaw.map((r) => ({
      id: r.gclid,
      source: this.source,
      status: this.toStatus(r.lead_status),
      value: r.conversion_value,
      name: r.customer_name,
      service: r.service_category,
      createdAt: r.date,
    }));
  }

  async fetchSpend(): Promise<SourceSpend> {
    return { source: this.source, spend: SPEND_BY_SOURCE.google, period: PERIOD };
  }
}

// ---- Facebook Lead Ads ----------------------------------------------------
class FacebookAdapter implements SourceAdapter {
  readonly source = "facebook" as const;
  readonly label = "Facebook";

  private toStatus(s: FacebookLeadRecord["stage"]): LeadStatus {
    return s === "sale" ? "won" : s === "appointment" ? "booked" : "new";
  }

  async fetchLeads(): Promise<Lead[]> {
    return facebookRaw.map((r) => ({
      id: r.lead_id,
      source: this.source,
      status: this.toStatus(r.stage),
      value: r.value_usd,
      name: r.full_name,
      service: r.form_service,
      createdAt: r.created_time,
    }));
  }

  async fetchSpend(): Promise<SourceSpend> {
    return { source: this.source, spend: SPEND_BY_SOURCE.facebook, period: PERIOD };
  }
}

// ---- GoHighLevel (GHL) ----------------------------------------------------
class GhlAdapter implements SourceAdapter {
  readonly source = "ghl" as const;
  readonly label = "GoHighLevel";

  private toStatus(s: GhlOpportunityRecord["pipelineStage"]): LeadStatus {
    return s === "won" ? "won" : s === "booked" ? "booked" : "new";
  }

  async fetchLeads(): Promise<Lead[]> {
    return ghlRaw.map((r) => ({
      id: r.contactId,
      source: this.source,
      status: this.toStatus(r.pipelineStage),
      value: r.opportunityValue,
      name: r.contactName,
      service: r.serviceTag,
      createdAt: r.dateAdded,
    }));
  }

  async fetchSpend(): Promise<SourceSpend> {
    return { source: this.source, spend: SPEND_BY_SOURCE.ghl, period: PERIOD };
  }
}

// ---- Website forms (organic / direct) -------------------------------------
class WebsiteAdapter implements SourceAdapter {
  readonly source = "website" as const;
  readonly label = "Website";

  private toStatus(s: WebsiteFormRecord["state"]): LeadStatus {
    return s === "closed_won" ? "won" : s === "scheduled" ? "booked" : "new";
  }

  async fetchLeads(): Promise<Lead[]> {
    return websiteRaw.map((r) => ({
      id: r.id,
      source: this.source,
      status: this.toStatus(r.state),
      value: r.est_value,
      name: r.name,
      service: r.service,
      createdAt: r.submitted_at,
    }));
  }

  async fetchSpend(): Promise<SourceSpend> {
    return { source: this.source, spend: SPEND_BY_SOURCE.website, period: PERIOD };
  }
}

// The registry. Adding a new channel = add one adapter here. Nothing else changes.
export const adapters: SourceAdapter[] = [
  new GoogleAdsAdapter(),
  new FacebookAdapter(),
  new GhlAdapter(),
  new WebsiteAdapter(),
];

export const SOURCE_LABELS: Record<Source, string> = Object.fromEntries(
  adapters.map((a) => [a.source, a.label])
) as Record<Source, string>;
