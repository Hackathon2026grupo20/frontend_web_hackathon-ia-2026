"use client";

import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { DemoHourPoint } from "@/lib/demoIlustrativo";

export function ForecastChart({ data }: { data: DemoHourPoint[] }) {
  return (
    <div className="bg-panel border border-border rounded-card p-4">
      <h3 className="font-display text-base mb-3">Previsão de 24h e tarifa dinâmica</h3>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="hora" tick={{ fontSize: 11, fill: "var(--text-dim)" }} interval={2} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-dim)" }} domain={["auto", "auto"]} />
          <Tooltip contentStyle={{ background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 8 }} />
          <Area
            dataKey="consumoKwh"
            name="consumo (kWh)"
            fill="var(--accent-brand-glow)"
            stroke="var(--accent-brand)"
            strokeWidth={1.5}
          />
          <Line dataKey="tarifaBaseRsKwh" name="tarifa-base" stroke="var(--text-dim)" strokeDasharray="4 3" dot={false} />
          <Line dataKey="tarifaDinamicaRsKwh" name="tarifa dinâmica" stroke="var(--accent-demand)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
