"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import type { HourlyPoint } from "@/types/api";
import { curvaConsumoEsperada } from "@/lib/consumptionShapes";
import type { CustomerType } from "@/lib/simulationChoices";

// Recalcula a curva de consumo a partir dos shapes fixos do backend (sem chamar a API) e
// sobrepõe com o consumption_kwh que a simulação de fato devolveu — se as duas linhas
// coincidirem, confirma que o backend está aplicando a mesma fórmula documentada.
export function ConsumptionShapeCheck({
  hourly,
  monthlyKwh,
  customerType,
}: {
  hourly: HourlyPoint[];
  monthlyKwh: number;
  customerType: CustomerType;
}) {
  const esperado = curvaConsumoEsperada(monthlyKwh, customerType);

  const data = hourly.map((h, i) => ({
    hora: h.time,
    api: h.consumption_kwh,
    esperado: esperado[i] ?? null,
  }));

  const maxDiff = Math.max(...data.map((d) => Math.abs(d.api - (d.esperado ?? d.api))));
  const bate = maxDiff < 0.01;

  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-display text-lg">Curva de consumo: calculada no front × devolvida pela API</h2>
        <span className={`text-sm font-mono ${bate ? "text-good" : "text-alert"}`}>
          {bate ? "✓ bate" : `Δ máx. ${maxDiff.toFixed(4)} kWh`}
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
          <Line dataKey="api" name="consumption_kwh (API)" stroke="var(--accent-demand)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-dim mt-3">
        &quot;Esperado&quot; vem de um array de coeficientes fixo copiado do backend (motor_tarifa/customer/profiles.py),
        normalizado pra somar o consumo diário — não existe endpoint que exponha isso cru, só o resultado já aplicado
        em hourly[].consumption_kwh.
      </p>
    </div>
  );
}
