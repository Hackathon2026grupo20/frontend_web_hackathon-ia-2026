"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { HourlyPoint } from "@/types/api";
import { horaLocal } from "@/lib/format";

export function TariffComparisonChart({
  hourly,
  differencePct,
}: {
  hourly: HourlyPoint[];
  differencePct: number;
}) {
  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <p className="text-xs text-dim mb-2 font-mono">Passo 6</p>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-display text-lg">Tarifa-base × tarifa dinâmica (24h)</h2>
        <span className={`text-sm font-mono ${differencePct <= 0 ? "text-good" : "text-alert"}`}>
          {differencePct <= 0 ? "" : "+"}
          {differencePct.toFixed(2)}% no total do dia
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={hourly.map((h) => ({ ...h, hora: horaLocal(h) }))}
          margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="hora"tick={{ fontSize: 11, fill: "var(--text-dim)" }} interval={2} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-dim)" }} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 8 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line dataKey="base_rs_kwh" name="tarifa-base" stroke="var(--text-dim)" strokeDasharray="4 3" dot={false} />
          <Line
            dataKey="dynamic_rs_kwh"
            name="tarifa dinâmica"
            stroke="var(--accent-supply)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-dim mt-3">
        Neutralidade aproximada: o custo esperado pro mesmo consumo fica perto da referência — a simulação muda{" "}
        <em>quando</em> se paga mais ou menos, não o total.
      </p>
    </div>
  );
}
