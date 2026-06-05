import { SOURCE_LABELS } from "@/lib/adapters";
import { SOURCE_COLOR, num, usd } from "@/lib/format";
import type { SourceAttribution } from "@/lib/types";

export function SourceBreakdown({ rows }: { rows: SourceAttribution[] }) {
  return (
    <div className="card overflow-hidden" data-testid="source-breakdown">
      <div className="flex items-center justify-between px-4 pt-4">
        <h2 className="text-sm font-semibold text-white">Attribution by source</h2>
        <span className="text-xs text-muted">Last 60 days</span>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-edge/70 text-left text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-2 font-medium">Channel</th>
              <th className="px-4 py-2 text-right font-medium">Leads</th>
              <th className="px-4 py-2 text-right font-medium">Booked</th>
              <th className="px-4 py-2 text-right font-medium">Won</th>
              <th className="px-4 py-2 text-right font-medium">Spend</th>
              <th className="px-4 py-2 text-right font-medium">Cost / lead</th>
              <th className="px-4 py-2 text-right font-medium">Revenue</th>
              <th className="px-4 py-2 text-right font-medium">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.source}
                className="border-b border-edge/40 last:border-0 hover:bg-white/[0.02]"
                data-testid={`source-row-${r.source}`}
              >
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: SOURCE_COLOR[r.source] }}
                    />
                    <span className="font-medium text-white">
                      {SOURCE_LABELS[r.source]}
                    </span>
                  </span>
                </td>
                <td className="tnum px-4 py-2.5 text-right" data-testid="cell-leads">
                  {num(r.leads)}
                </td>
                <td className="tnum px-4 py-2.5 text-right text-amber-300">{num(r.booked)}</td>
                <td className="tnum px-4 py-2.5 text-right text-emerald-300">{num(r.won)}</td>
                <td className="tnum px-4 py-2.5 text-right" data-testid="cell-spend">
                  {usd(r.spend)}
                </td>
                <td
                  className="tnum px-4 py-2.5 text-right font-medium text-white"
                  data-testid="cell-cpl"
                >
                  {usd(r.cpl, { cents: true })}
                </td>
                <td className="tnum px-4 py-2.5 text-right">{usd(r.revenue)}</td>
                <td className="tnum px-4 py-2.5 text-right text-brand">
                  {r.spend > 0 ? `${r.roas.toFixed(1)}×` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
