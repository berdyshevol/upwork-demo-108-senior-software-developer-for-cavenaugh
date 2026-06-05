"use client";

import { useMemo, useState } from "react";
import { SOURCE_COLOR, STATUS_STYLE, num, usd } from "@/lib/format";
import type { Lead, Source } from "@/lib/types";

const SOURCE_OPTIONS: { value: Source | "all"; label: string }[] = [
  { value: "all", label: "All sources" },
  { value: "google", label: "Google Ads" },
  { value: "facebook", label: "Facebook" },
  { value: "ghl", label: "GoHighLevel" },
  { value: "website", label: "Website" },
];

const LABEL: Record<Source, string> = {
  google: "Google Ads",
  facebook: "Facebook",
  ghl: "GoHighLevel",
  website: "Website",
};

export function LeadsExplorer({
  leads,
  minDate,
  maxDate,
}: {
  leads: Lead[];
  minDate: string;
  maxDate: string;
}) {
  const [source, setSource] = useState<Source | "all">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (source !== "all" && l.source !== source) return false;
      if (from && l.createdAt < from) return false;
      if (to && l.createdAt > to) return false;
      return true;
    });
  }, [leads, source, from, to]);

  const totalValue = filtered.reduce((s, l) => s + l.value, 0);
  const wonValue = filtered.reduce((s, l) => (l.status === "won" ? s + l.value : s), 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-white">Leads</h1>
        <p className="mt-1 text-sm text-muted">
          Every lead across channels. Filter by source or date range — totals recompute
          instantly, client-side.
        </p>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap items-end gap-4 p-4">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Source
          <select
            data-testid="filter-source"
            value={source}
            onChange={(e) => setSource(e.target.value as Source | "all")}
            className="min-w-[150px] rounded-md border border-edge bg-ink px-3 py-2 text-sm text-white outline-none focus:border-brand"
          >
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted">
          From
          <input
            type="date"
            data-testid="filter-from"
            value={from}
            min={minDate}
            max={maxDate}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-md border border-edge bg-ink px-3 py-2 text-sm text-white outline-none focus:border-brand [color-scheme:dark]"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted">
          To
          <input
            type="date"
            data-testid="filter-to"
            value={to}
            min={minDate}
            max={maxDate}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-md border border-edge bg-ink px-3 py-2 text-sm text-white outline-none focus:border-brand [color-scheme:dark]"
          />
        </label>

        <button
          type="button"
          onClick={() => {
            setSource("all");
            setFrom("");
            setTo("");
          }}
          className="ml-auto rounded-md border border-edge px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          Reset
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3">
          <div className="text-[11px] uppercase tracking-wide text-muted">Leads shown</div>
          <div
            className="tnum mt-1 text-xl font-semibold text-white"
            data-testid="leads-total-count"
          >
            {num(filtered.length)}
          </div>
        </div>
        <div className="card p-3">
          <div className="text-[11px] uppercase tracking-wide text-muted">Pipeline value</div>
          <div
            className="tnum mt-1 text-xl font-semibold text-white"
            data-testid="leads-total-value"
          >
            {usd(totalValue)}
          </div>
        </div>
        <div className="card p-3">
          <div className="text-[11px] uppercase tracking-wide text-muted">Won revenue</div>
          <div className="tnum mt-1 text-xl font-semibold text-emerald-300">
            {usd(wonValue)}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="leads-table">
            <thead>
              <tr className="border-b border-edge/70 text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium">Service</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 text-right font-medium">Value</th>
                <th className="px-4 py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  data-testid="lead-row"
                  className="border-b border-edge/40 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-2.5 font-medium text-white">{l.name}</td>
                  <td className="px-4 py-2.5" data-testid="lead-source">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: SOURCE_COLOR[l.source] }}
                      />
                      {LABEL[l.source]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">{l.service}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLE[l.status]}`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="tnum px-4 py-2.5 text-right text-white">{usd(l.value)}</td>
                  <td className="tnum px-4 py-2.5 text-slate-300" data-testid="lead-date">
                    {l.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <div
            className="px-4 py-10 text-center text-sm text-muted"
            data-testid="leads-empty"
          >
            No leads match these filters. Widen the date range or pick a different source.
          </div>
        ) : null}
      </div>
    </div>
  );
}
