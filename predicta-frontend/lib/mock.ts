import type { RegionPreset } from "@/lib/regions";
import type { CustomerType, HourlyPoint, OptimizationResult, SimulationResponse } from "@/types/api";

// Dados sintéticos só para rodar o frontend sem backend (NEXT_PUBLIC_USE_MOCK=1).
// Mesma forma da resposta de POST /api/v1/simulations/; a UI avisa que não são dados reais.

const CARGA_MEDIA_MW: Record<string, number> = { "SE/CO": 38000, NE: 11300, S: 10400, N: 5000 };
const TARIFA_BASE = 0.85858; // R$/kWh — exemplo CEMIG-D do guia de arquitetura

export interface PerfilConsumo {
  monthly_kwh: number;
  customer_type: CustomerType;
  flexible_pct: number;
}

// Formato típico de carga diária do sistema: vale de madrugada, pico no fim da tarde/início da noite.
function formaCarga(hora: number) {
  return 1 + 0.12 * Math.sin(((hora - 12) / 24) * 2 * Math.PI) + 0.1 * Math.exp(-((hora - 19) ** 2) / 6);
}

// Curvas sintéticas de consumo do cliente, como no backend (synthetic_daily_profile).
const FORMA_CONSUMO: Record<CustomerType, (h: number) => number> = {
  residential: (h) => 0.6 + 0.3 * Math.exp(-((h - 8) ** 2) / 4) + 0.9 * Math.exp(-((h - 20) ** 2) / 5),
  commercial: (h) => 0.35 + (h >= 8 && h <= 19 ? 1 : 0) + 0.25 * Math.exp(-((h - 15) ** 2) / 6),
  industrial_flat: (h) => 1 + 0.08 * (h >= 7 && h <= 22 ? 1 : 0),
};

// Desloca a parcela flexível das horas mais caras para as mais baratas, sem mudar o total do dia.
// Cada hora pode receber no máximo o dobro do consumo original (limite de concentração).
function otimizar(consumo: number[], tarifa: number[], flexPct: number) {
  const otimizado = [...consumo];
  const ordem = tarifa.map((t, i) => i).sort((a, b) => tarifa[a] - tarifa[b]);
  const baratas = ordem.slice(0, 12);
  const caras = ordem.slice(12).reverse();
  let movido = 0;
  for (const origem of caras) {
    let disponivel = consumo[origem] * (flexPct / 100);
    for (const destino of baratas) {
      if (disponivel <= 0) break;
      const espaco = consumo[destino] * 2 - otimizado[destino];
      if (espaco <= 0) continue;
      const q = Math.min(espaco, disponivel);
      otimizado[destino] += q;
      otimizado[origem] -= q;
      disponivel -= q;
      movido += q;
    }
  }
  return { otimizado, movido };
}

export function mockSimulation(preset: RegionPreset, perfil: PerfilConsumo): SimulationResponse {
  const inicio = new Date();
  inicio.setDate(inicio.getDate() + 1);
  inicio.setHours(0, 0, 0, 0);

  const cargaMedia = CARGA_MEDIA_MW[preset.id] ?? 10000;
  const formas = Array.from({ length: 24 }, (_, h) => formaCarga(h));
  const minF = Math.min(...formas);
  const maxF = Math.max(...formas);

  const consumoDiario = perfil.monthly_kwh / 30.4375;
  const formasConsumo = Array.from({ length: 24 }, (_, h) => FORMA_CONSUMO[perfil.customer_type](h));
  const somaConsumo = formasConsumo.reduce((s, v) => s + v, 0);
  const consumo = formasConsumo.map((v) => (v / somaConsumo) * consumoDiario);

  // Multiplicador bruto a partir da pressão D, com piso/teto e neutralidade sobre a curva de consumo.
  const pressoes = formas.map((f) => (f - minF) / (maxF - minF));
  const brutos = pressoes.map((p) => Math.min(1.1, Math.max(0.93, 1 + 0.2 * (p - 0.5))));
  const custoBruto = brutos.reduce((s, m, i) => s + m * consumo[i], 0);
  const fator = consumoDiario / custoBruto;
  const multiplicadores = brutos.map((m) => m * fator);
  const tarifa = multiplicadores.map((m) => TARIFA_BASE * m);

  const { otimizado, movido } = otimizar(consumo, tarifa, perfil.flexible_pct);

  const hourly: HourlyPoint[] = formas.map((f, h) => {
    const t = new Date(inicio.getTime() + h * 3_600_000);
    return {
      interval_start_utc: t.toISOString(),
      local_iso: `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}T${String(h).padStart(2, "0")}:00:00`,
      time: `${String(t.getDate()).padStart(2, "0")}/${String(t.getMonth() + 1).padStart(2, "0")} ${String(h).padStart(2, "0")}h`,
      base_rs_kwh: TARIFA_BASE,
      dynamic_rs_kwh: tarifa[h],
      consumption_kwh: consumo[h],
      optimized_consumption_kwh: otimizado[h],
      multiplier: multiplicadores[h],
      demand_pressure: pressoes[h],
      demand_p50_mw: cargaMedia * f,
      demand_context: "MOCK",
      demand_reference_n: null,
      delta_pct: 100 * (multiplicadores[h] - 1),
    };
  });

  const custoRef = consumo.reduce((s, c) => s + c * TARIFA_BASE, 0);
  const custoDin = consumo.reduce((s, c, h) => s + c * tarifa[h], 0);
  const custoOtim = otimizado.reduce((s, c, h) => s + c * tarifa[h], 0);
  const media = (xs: number[]) => xs.reduce((s, v) => s + v, 0) / xs.length;

  const optimization: OptimizationResult = {
    flexible_percent: perfil.flexible_pct,
    flexible_energy_kwh: consumoDiario * (perfil.flexible_pct / 100),
    actually_shifted_kwh: movido,
    original_dynamic_cost_24h_rs: custoDin,
    optimized_dynamic_cost_24h_rs: custoOtim,
    potential_savings_24h_rs: custoDin - custoOtim,
    potential_savings_pct: (100 * (custoDin - custoOtim)) / custoDin,
    potential_savings_month_rs: (custoDin - custoOtim) * 30.4375,
  };

  return {
    customer: { customer_type: perfil.customer_type, monthly_kwh: perfil.monthly_kwh },
    concession: null,
    optimization,
    window: { source: "MOCK" },
    hourly,
    simulation_mode: "mock",
    display_timezone: "America/Sao_Paulo",
    simulation_scope_pt: "Dados sintéticos gerados no navegador — não vêm da API.",
    reference_tariff_mean_rs_kwh: TARIFA_BASE,
    dynamic_tariff_mean_rs_kwh: media(tarifa),
    reference_cost_24h_rs: custoRef,
    dynamic_cost_24h_rs: custoDin,
    difference_pct: 100 * (custoDin / custoRef - 1),
  };
}
