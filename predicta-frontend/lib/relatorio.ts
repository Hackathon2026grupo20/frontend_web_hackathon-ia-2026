import type { SimulationResponse } from "@/types/api";

// Exporta as 24 horas da simulação em CSV (separador ";" e vírgula decimal, como o Excel pt-BR espera).
export function baixarRelatorioCsv(sim: SimulationResponse, plano: string) {
  const n = (v: number, casas = 4) => v.toFixed(casas).replace(".", ",");
  const linhas = [
    ["hora_local", "tarifa_base_rs_kwh", "tarifa_dinamica_rs_kwh", "multiplicador", "consumo_original_kwh", "consumo_otimizado_kwh", "pressao_demanda_D"].join(";"),
    ...sim.hourly.map((h) =>
      [
        h.local_iso,
        n(h.base_rs_kwh),
        n(h.dynamic_rs_kwh),
        n(h.multiplier),
        n(h.consumption_kwh, 3),
        n(h.optimized_consumption_kwh, 3),
        n(h.demand_pressure, 3),
      ].join(";")
    ),
  ];
  const blob = new Blob(["﻿" + linhas.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `predicta-${plano.toLowerCase()}-${sim.hourly[0]?.local_iso.slice(0, 10) ?? "simulacao"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
