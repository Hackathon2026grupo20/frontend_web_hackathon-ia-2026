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
import type { SystemSignal } from "@/types/api";

export function ForecastChart({ signal }: { signal: SystemSignal }) {
  const data = signal.previsao.map((p) => ({
    hora: p.hora,
    p10: p.p10,
    banda: Number((p.p90 - p.p10).toFixed(1)),
    p50: p.p50,
  }));

  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <p className="text-xs text-dim mb-2 font-mono">Passo 4</p>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg">Previsão de demanda — próximas 24h</h2>
        <span className="text-xs text-dim font-mono">emitido {signal.issueTime.slice(11, 16)}</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="hora" tick={{ fontSize: 11, fill: "var(--text-dim)" }} interval={2} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-dim)" }} />
          <Tooltip
            contentStyle={{ background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 8 }}
          />
          <Area dataKey="p10" stackId="a" stroke="none" fill="transparent" />
          <Area
            dataKey="banda"
            stackId="a"
            stroke="none"
            fill="var(--accent-demand)"
            fillOpacity={0.18}
            name="faixa p10–p90"
          />
          <Line dataKey="p50" stroke="var(--accent-demand)" strokeWidth={2} dot={false} name="previsão (p50)" />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex gap-4 mt-3 text-xs text-dim flex-wrap">
        <span>
          D (pressão de demanda):{" "}
          <b className="glow-demand" style={{ color: "var(--accent-demand)" }}>{signal.d.toFixed(2)}</b>
        </span>
        <span>
          S (pressão de oferta):{" "}
          {signal.s === null ? (
            <b className="glow-alert" style={{ color: "var(--accent-alert)" }}>sem fonte confiável — não estimado</b>
          ) : (
            <b className="glow-good" style={{ color: "var(--accent-good)" }}>{signal.s.toFixed(2)}</b>
          )}
        </span>
        <span>
          C (exposição climática):{" "}
          <b className="glow-climate" style={{ color: "var(--accent-climate)" }}>{signal.c.toFixed(2)}</b>
        </span>
      </div>
      {signal.qualityFlags.length > 0 && (
        <p className="text-xs text-alert mt-2">⚠ {signal.qualityFlags.join(", ")}</p>
      )}
    </div>
  );
}
