// Shapes fixos do backend (motor_tarifa/customer/profiles.py) — coeficientes relativos por hora
// local (00h–23h, America/Sao_Paulo), não kWh absoluto. Não existe endpoint que exponha isso cru;
// só sai "já aplicado" dentro de hourly[].consumption_kwh de uma simulação. Copiado manualmente
// pra poder recalcular a curva esperada no frontend e comparar com o que a API de fato devolve.
import type { CustomerType } from "./simulationChoices";

const SHAPES: Record<CustomerType, number[]> = {
  residential: [
    0.45, 0.38, 0.34, 0.32, 0.34, 0.45, 0.7, 0.92, 0.78, 0.63, 0.58, 0.56, 0.58, 0.6, 0.62, 0.66, 0.78, 1.0, 1.25,
    1.35, 1.2, 0.98, 0.75, 0.58,
  ],
  commercial: [
    0.15, 0.12, 0.1, 0.1, 0.1, 0.12, 0.25, 0.55, 0.9, 1.1, 1.2, 1.25, 1.25, 1.22, 1.18, 1.15, 1.05, 0.85, 0.55, 0.35,
    0.25, 0.2, 0.18, 0.16,
  ],
  industrial_flat: Array(24).fill(1),
};

const DIAS_POR_MES = 30.4375;

// Reproduz exatamente a lógica do backend: daily_kwh = monthly_kwh / 30.4375;
// values = daily_kwh * shape / sum(shape). Retorna 24 valores em kWh, hora 00 a 23 local.
export function curvaConsumoEsperada(monthlyKwh: number, tipo: CustomerType): number[] {
  const shape = SHAPES[tipo];
  const dailyKwh = monthlyKwh / DIAS_POR_MES;
  const soma = shape.reduce((a, b) => a + b, 0);
  return shape.map((s) => (dailyKwh * s) / soma);
}
