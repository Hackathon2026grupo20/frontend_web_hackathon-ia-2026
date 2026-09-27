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
import type { HourlyPoint } from "@/types/api";
import { dataLocal, faixaPressao, horaLocal, type FaixaPressao } from "@/lib/format";

const PRESSURE_COLOR: Record<FaixaPressao, string> = {
  alta: "var(--accent-alert)",
  media: "var(--accent-demand)",
  baixa: "var(--accent-good)",
};

const MODE_LABEL: Record<string, string> = {
  replay: "replay histórico",
  operational: "previsão operacional",
  mock: "dados de exemplo",
};

export function ForecastChart({
  hourly,
  displayTimezone,
  mode,
}: {
  hourly: HourlyPoint[];
  displayTimezone: string;
  mode: string;
}) {
  const data = hourly.map((h) => ({
    hora: horaLocal(h),
    demanda: h.demand_p50_mw,
  }));

  // A data vem da janela simulada (em replay é histórica), não do relógio do navegador.
  const inicio = hourly.length ? dataLocal(hourly[0]) : "";
  const fim = hourly.length ? dataLocal(hourly[hourly.length - 1]) : "";
  const periodo = inicio === fim ? inicio : `${inicio}–${fim}`;

  const contagemPressao = hourly.reduce<Record<FaixaPressao, number>>(
    (acc, h) => {
      acc[faixaPressao(h.demand_pressure)] += 1;
      return acc;
    },
    { alta: 0, media: 0, baixa: 0 }
  );

  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <p className="text-xs text-dim mb-2 font-mono">Passo 4</p>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-display text-lg">
          Previsão de demanda — {periodo} (24h, {MODE_LABEL[mode] ?? mode})
        </h2>
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
              {contagemPressao[nivel]}h
            </b>
          </div>
        ))}
      </div>
      <p className="text-xs text-dim mt-2">
        Pressão = percentil da demanda prevista no histórico da mesma hora e mês (tercis: baixa, média, alta).
      </p>
    </div>
  );
}
