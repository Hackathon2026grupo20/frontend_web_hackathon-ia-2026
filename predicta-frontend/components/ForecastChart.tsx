"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { HourlyPoint, ReplayWindow } from "@/types/api";

// demand_pressure vem como fração 0..1 (percentil da hora frente ao histórico) — classificamos
// em faixas só pra exibição, o valor bruto é o que alimenta o gráfico.
function nivelPressao(p: number): "alta" | "media" | "baixa" {
  if (p >= 0.66) return "alta";
  if (p >= 0.33) return "media";
  return "baixa";
}

const PRESSURE_COLOR: Record<string, string> = {
  alta: "var(--accent-alert)",
  media: "var(--accent-demand)",
  baixa: "var(--accent-good)",
};

export function ForecastChart({
  hourly,
  displayTimezone,
  janela,
}: {
  hourly: HourlyPoint[];
  displayTimezone: string;
  janela: ReplayWindow;
}) {
  const data = hourly.map((h) => ({
    hora: h.time,
    demanda: h.demand_p50_mw,
    pressao: h.demand_pressure,
  }));

  const contagemPressao = hourly.reduce<Record<string, number>>((acc, h) => {
    const nivel = nivelPressao(h.demand_pressure);
    acc[nivel] = (acc[nivel] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <p className="text-xs text-dim mb-2 font-mono">Passo 4</p>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg">Previsão de demanda — {janela.label}</h2>
        <span className="text-xs text-dim font-mono">{displayTimezone}</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="hora" tick={{ fontSize: 11, fill: "var(--text-dim)" }} interval={2} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-dim)" }} />
          <Tooltip
            contentStyle={{ background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 8 }}
          />
          <Area dataKey="demanda" stroke="none" fill="var(--accent-demand)" fillOpacity={0.12} />
          <Line dataKey="demanda" stroke="var(--accent-demand)" strokeWidth={2} dot={false} name="previsão (p50 MW)" />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-2 mt-3">
        {(["alta", "media", "baixa"] as const).map((nivel) => (
          <div key={nivel} className="border border-border rounded-card px-3 py-2">
            <p className="text-[11px] text-dim capitalize">Pressão {nivel}</p>
            <b className="text-sm" style={{ color: PRESSURE_COLOR[nivel] }}>
              {contagemPressao[nivel] ?? 0}h
            </b>
          </div>
        ))}
      </div>
    </div>
  );
}
