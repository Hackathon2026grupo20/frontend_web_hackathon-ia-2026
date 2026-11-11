"use client";

import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { ForecastHourPoint } from "@/lib/demoForecast";

export function ForecastBandChart({ data }: { data: ForecastHourPoint[] }) {
  const chartData = data.map((d) => ({ ...d, faixa: Math.max(0, d.p90 - d.p10) }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="hora" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} interval={2} />
        <YAxis
          tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
          domain={[0, 1]}
          tickFormatter={(v) => `${Math.round(v * 100)}%`}
        />
        <Tooltip
          contentStyle={{ background: "#141b2e", border: "1px solid #1a2138", borderRadius: 8, color: "#eef1f8" }}
          formatter={(value: number, name: string) =>
            name === "faixa" ? null : [`${Math.round(value * 100)}%`, name]
          }
        />
        <Area dataKey="p10" stackId="banda" stroke="none" fill="transparent" name="p10" />
        <Area dataKey="faixa" stackId="banda" stroke="none" fill="var(--accent-demand-glow)" name="faixa (p10–p90)" />
        <Line dataKey="p50" name="p50 (mediana)" stroke="var(--accent-demand)" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
