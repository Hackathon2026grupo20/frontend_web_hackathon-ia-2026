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
import type { SimulacaoResponse } from "@/types/api";

export function TariffComparisonChart({ sim }: { sim: SimulacaoResponse }) {
  const diff = sim.custoTotalDinamico - sim.custoTotalBase;
  const diffPct = (diff / sim.custoTotalBase) * 100;

  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <p className="text-xs text-dim mb-2 font-mono">Passo 6</p>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-display text-lg">Tarifa-base × tarifa dinâmica (24h)</h2>
        <span className={`text-sm font-mono ${diff <= 0 ? "text-good" : "text-alert"}`}>
          {diff <= 0 ? "" : "+"}
          {diffPct.toFixed(2)}% no total do dia
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={sim.horas} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="hora" tick={{ fontSize: 11, fill: "var(--text-dim)" }} interval={2} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-dim)" }} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 8 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            dataKey="tarifaBaseRsKwh"
            name="tarifa-base"
            stroke="var(--text-dim)"
            strokeDasharray="4 3"
            dot={false}
          />
          <Line
            dataKey="tarifaDinamicaRsKwh"
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
