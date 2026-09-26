import type { HourlyPoint } from "@/types/api";

// local_iso já vem no fuso de exibição (America/Sao_Paulo): "2026-09-19T21:00:00-03:00".
export function horaLocal(h: HourlyPoint): string {
  return `${h.local_iso.slice(11, 13)}h`;
}

// "19/09" a partir do local_iso, sem depender do fuso do navegador.
export function dataLocal(h: HourlyPoint): string {
  return `${h.local_iso.slice(8, 10)}/${h.local_iso.slice(5, 7)}`;
}

export type FaixaPressao = "alta" | "media" | "baixa";

// demand_pressure é o percentil D (0..1) da carga prevista no histórico hora×mês.
// Faixas em tercis — só para leitura na UI; o Motor 2 usa o valor contínuo.
export function faixaPressao(p: number): FaixaPressao {
  if (p >= 2 / 3) return "alta";
  if (p >= 1 / 3) return "media";
  return "baixa";
}
