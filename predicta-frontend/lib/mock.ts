import type { RegionPreset } from "@/lib/regions";
import type { HourlyPoint, SimulationResponse } from "@/types/api";

// Dados sintéticos só para rodar o frontend sem backend (NEXT_PUBLIC_USE_MOCK=1).
// Mesma forma da resposta de POST /api/v1/simulations/; a UI avisa que não são dados reais.

const CARGA_MEDIA_MW: Record<string, number> = { "SE/CO": 38000, NE: 11300, S: 10400, N: 5000 };
const TARIFA_BASE = 0.85858; // R$/kWh — exemplo CEMIG-D do guia de arquitetura

// Formato típico de carga diária: vale de madrugada, pico no início da noite.
function formaCarga(hora: number) {
  return 1 + 0.12 * Math.sin(((hora - 12) / 24) * 2 * Math.PI) + 0.1 * Math.exp(-((hora - 19) ** 2) / 6);
}

function formaConsumoResidencial(hora: number) {
  return 0.6 + 0.3 * Math.exp(-((hora - 8) ** 2) / 4) + 0.9 * Math.exp(-((hora - 20) ** 2) / 5);
}

export function mockSimulation(preset: RegionPreset): SimulationResponse {
  const inicio = new Date();
  inicio.setDate(inicio.getDate() + 1);
  inicio.setHours(0, 0, 0, 0);

  const cargaMedia = CARGA_MEDIA_MW[preset.id] ?? 10000;
  const formas = Array.from({ length: 24 }, (_, h) => formaCarga(h));
  const minF = Math.min(...formas);
  const maxF = Math.max(...formas);

  const consumoDiario = preset.monthly_kwh / 30.4375;
  const formasConsumo = Array.from({ length: 24 }, (_, h) => formaConsumoResidencial(h));
  const somaConsumo = formasConsumo.reduce((s, v) => s + v, 0);
  const consumo = formasConsumo.map((v) => (v / somaConsumo) * consumoDiario);

  // Multiplicador bruto a partir da pressão D, com piso/teto e neutralidade sobre a curva de consumo.
  const pressoes = formas.map((f) => (f - minF) / (maxF - minF));
  const brutos = pressoes.map((p) => Math.min(1.1, Math.max(0.93, 1 + 0.2 * (p - 0.5))));
  const custoBruto = brutos.reduce((s, m, i) => s + m * consumo[i], 0);
  const fator = consumoDiario / custoBruto;
  const multiplicadores = brutos.map((m) => m * fator);

  const hourly: HourlyPoint[] = formas.map((f, h) => {
    const t = new Date(inicio.getTime() + h * 3_600_000);
    const dinamica = TARIFA_BASE * multiplicadores[h];
    return {
      interval_start_utc: t.toISOString(),
      local_iso: `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}T${String(h).padStart(2, "0")}:00:00`,
      time: `${String(t.getDate()).padStart(2, "0")}/${String(t.getMonth() + 1).padStart(2, "0")} ${String(h).padStart(2, "0")}h`,
      base_rs_kwh: TARIFA_BASE,
      dynamic_rs_kwh: dinamica,
      consumption_kwh: consumo[h],
      optimized_consumption_kwh: consumo[h],
      multiplier: multiplicadores[h],
      demand_pressure: pressoes[h],
      demand_p50_mw: cargaMedia * f,
      demand_context: "MOCK",
      demand_reference_n: null,
      delta_pct: 100 * (multiplicadores[h] - 1),
    };
  });

  const custoRef = consumo.reduce((s, c) => s + c * TARIFA_BASE, 0);
  const custoDin = hourly.reduce((s, h) => s + h.consumption_kwh * h.dynamic_rs_kwh, 0);
  const media = (xs: number[]) => xs.reduce((s, v) => s + v, 0) / xs.length;

  return {
    customer: {},
    concession: null,
    optimization: {},
    window: { source: "MOCK" },
    hourly,
    simulation_mode: "mock",
    display_timezone: "America/Sao_Paulo",
    simulation_scope_pt: "Dados sintéticos gerados no navegador — não vêm da API.",
    reference_tariff_mean_rs_kwh: TARIFA_BASE,
    dynamic_tariff_mean_rs_kwh: media(hourly.map((h) => h.dynamic_rs_kwh)),
    reference_cost_24h_rs: custoRef,
    dynamic_cost_24h_rs: custoDin,
    difference_pct: 100 * (custoDin / custoRef - 1),
  };
}
