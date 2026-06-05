export function KpiCard({
  id,
  label,
  value,
  sub,
}: {
  id: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="card p-4" data-testid={`kpi-${id}`}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </div>
      <div
        className="tnum mt-1.5 text-2xl font-semibold text-white"
        data-testid={`kpi-${id}-value`}
      >
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-muted">{sub}</div> : null}
    </div>
  );
}
