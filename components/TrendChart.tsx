"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TrendPoint {
  date: string;
  leads: number;
  booked: number;
  won: number;
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="card p-4" data-testid="trend-chart">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Leads over time</h2>
        <span className="text-xs text-muted">Daily volume · all channels</span>
      </div>
      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5b8cff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#5b8cff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e2c4a" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#7e8aa3", fontSize: 11 }}
              tickFormatter={(d: string) => d.slice(5)}
              minTickGap={24}
              stroke="#1e2c4a"
            />
            <YAxis
              tick={{ fill: "#7e8aa3", fontSize: 11 }}
              stroke="#1e2c4a"
              allowDecimals={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: "#111a2e",
                border: "1px solid #1e2c4a",
                borderRadius: 8,
                color: "#e6ebf5",
                fontSize: 12,
              }}
              labelStyle={{ color: "#7e8aa3" }}
            />
            <Area
              type="monotone"
              dataKey="leads"
              stroke="#5b8cff"
              strokeWidth={2}
              fill="url(#leadsFill)"
              name="Leads"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
