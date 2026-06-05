import { KpiCard } from "@/components/KpiCard";
import { SourceBreakdown } from "@/components/SourceBreakdown";
import { TrendChart } from "@/components/TrendChart";
import {
  computeAttribution,
  computeSummary,
  leadsByDay,
  loadPortalData,
} from "@/lib/attribution";
import { usd } from "@/lib/format";

// Seed data is static; render at request time but never cache stale builds.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { leads, spendBySource } = await loadPortalData();
  const summary = computeSummary(leads, spendBySource);
  const attribution = computeAttribution(leads, spendBySource);
  const trend = leadsByDay(leads);

  const bookRate =
    summary.totalLeads > 0
      ? Math.round((summary.bookedAppointments / summary.totalLeads) * 100)
      : 0;
  const blendedRoas =
    summary.totalSpend > 0 ? (summary.revenue / summary.totalSpend).toFixed(1) : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Lead Attribution Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Every lead from Google, Facebook, GoHighLevel and your website — unified, with
          true cost-per-lead and revenue attribution per channel.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          id="total-leads"
          label="Total leads"
          value={summary.totalLeads.toLocaleString("en-US")}
          sub={`${summary.wonDeals} won · ${bookRate}% booked`}
        />
        <KpiCard
          id="booked"
          label="Booked appointments"
          value={summary.bookedAppointments.toLocaleString("en-US")}
          sub="Scheduled, not yet closed"
        />
        <KpiCard
          id="revenue"
          label="Attributed revenue"
          value={usd(summary.revenue)}
          sub={`${blendedRoas}× blended ROAS`}
        />
        <KpiCard
          id="blended-cpl"
          label="Blended cost / lead"
          value={usd(summary.blendedCpl, { cents: true })}
          sub={`${usd(summary.totalSpend)} ad spend`}
        />
      </div>

      <TrendChart data={trend} />

      <SourceBreakdown rows={attribution} />
    </div>
  );
}
