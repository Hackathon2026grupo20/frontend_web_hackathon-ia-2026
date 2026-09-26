"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import type { HourlyPoint, SimulationOptimization } from "@/types/api";
import { curvaConsumoEsperada } from "@/lib/consumptionShapes";
import type { CustomerType } from "@/lib/simulationChoices";

// Recalcula a curva de consumo a partir dos shapes fixos do backend (sem chamar a API) e
// sobrepõe com o consumption_kwh que a simulação de fato devolveu — se as duas linhas
// coincidirem, confirma que o backend está aplicando a mesma fórmula documentada.
//
// optimized_consumption_kwh já vem pronto da API (hourly[].optimized_consumption_kwh) — é o
// resultado de deslocar flexible_pct% da carga pras horas mais baratas, então não precisa (nem
// dá, sem reimplementar o algoritmo de otimização) recalcular isso no front; só plotamos.
//
// A "economia estimada" aqui é um cross-check independente: soma(consumo × tarifa dinâmica) vs
// soma(consumo otimizado × tarifa dinâmica), comparado com optimization.potential_savings_24h_rs
// que o backend já devolve — se baterem, confirma que a curva otimizada e o resumo de economia
// são consistentes entre si.
export function ConsumptionShapeCheck({
  hourly,
  monthlyKwh,
  customerType,
  optimization,
}: {
  hourly: HourlyPoint[];
  monthlyKwh: number;
  customerType: CustomerType;
  optimization: SimulationOptimization;
}) {
  const esperado = curvaConsumoEsperada(monthlyKwh, customerType);

  const data = hourly.map((h, i) => ({
    hora: h.time,
    esperado: esperado[i] ?? null,
    consumo: h.consumption_kwh,
    otimizado: h.optimized_consumption_kwh,
  }));

  const maxDiffShape = Math.max(...data.map((d) => Math.abs(d.consumo - (d.esperado ?? d.consumo))));
  const shapeBate = maxDiffShape < 0.01;

  const custoOriginal = hourly.reduce((s, h) => s + h.consumption_kwh * h.dynamic_rs_kwh, 0);
  const custoOtimizado = hourly.reduce((s, h) => s + h.optimized_consumption_kwh * h.dynamic_rs_kwh, 0);
  const economiaEstimada = custoOriginal - custoOtimizado;
  const diffEconomia = Math.abs(economiaEstimada - optimization.potential_savings_24h_rs);
  const economiaBate = diffEconomia < 0.05;

  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-display text-lg">Curva de consumo: bruta × otimizada</h2>
        <span className={`text-sm font-mono ${shapeBate ? "text-good" : "text-alert"}`}>
          shape {shapeBate ? "✓ bate" : `Δ máx. ${maxDiffShape.toFixed(4)} kWh`}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="hora" tick={{ fontSize: 11, fill: "var(--text-dim)" }} interval={2} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-dim)" }} />
          <Tooltip contentStyle={{ background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line dataKey="esperado" name="esperado (shape local)" stroke="var(--text-dim)" strokeDasharray="4 3" dot={false} />
          <Line dataKey="consumo" name="consumo bruto (API)" stroke="var(--accent-demand)" strokeWidth={2} dot={false} />
          <Line dataKey="otimizado" name="consumo otimizado (API)" stroke="var(--accent-good)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <div className="border border-border rounded-card px-3 py-2">
          <p className="text-[11px] text-dim">Economia estimada aqui (consumo × tarifa, hora a hora)</p>
          <b className="text-sm font-mono">R$ {economiaEstimada.toFixed(2)}</b>
        </div>
        <div className={`border rounded-card px-3 py-2 ${economiaBate ? "border-good bg-good/10" : "border-alert bg-alert/10"}`}>
          <p className="text-[11px] text-dim">optimization.potential_savings_24h_rs (API)</p>
          <b className={`text-sm font-mono ${economiaBate ? "text-good" : "text-alert"}`}>
            R$ {optimization.potential_savings_24h_rs.toFixed(2)} {economiaBate ? "· ✓ bate" : `· Δ ${diffEconomia.toFixed(2)}`}
          </b>
        </div>
      </div>

      <p className="text-xs text-dim mt-3">
        &quot;Esperado&quot; vem de um array de coeficientes fixo copiado do backend (motor_tarifa/customer/profiles.py) —
        não existe endpoint que exponha isso cru. Já a curva otimizada é o optimized_consumption_kwh que a própria
        API devolve (resultado de deslocar {optimization.flexible_percent.toFixed(0)}% da carga pras horas mais
        baratas); a economia acima é recalculada de forma independente aqui só pra conferir consistência com o
        resumo que o backend já entrega.
      </p>
    </div>
  );
}
