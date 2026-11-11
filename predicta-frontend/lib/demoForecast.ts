// Dados 100% sintéticos para a vitrine de produto da landing page — não vêm da API nem de
// nenhuma simulação real. Servem só para ilustrar a mecânica da previsão de pressão de demanda
// com faixa de incerteza (p10/p50/p90) nos quatro subsistemas elétricos.

export interface ForecastHourPoint {
  hora: string; // "00h".."23h"
  p10: number; // pressão de demanda prevista, escala 0–1 (cenário conservador)
  p50: number; // mediana
  p90: number; // cenário mais extremo
}

export interface SubsistemaForecast {
  id: "SE/CO" | "S" | "NE" | "N";
  label: string;
  descricao: string; // frase fixa, sem números — usada no mapa e no tooltip
  hourly: ForecastHourPoint[];
}

function curva(base: number, amplitude: number, picoHora: number, largura: number): ForecastHourPoint[] {
  return Array.from({ length: 24 }, (_, h) => {
    const fase = ((h - picoHora + 24) % 24) / 24;
    const p50 = base + amplitude * Math.cos(fase * 2 * Math.PI);
    const banda = largura * (0.6 + 0.4 * Math.sin(fase * Math.PI));
    const clamp = (v: number) => Math.min(1, Math.max(0, Math.round(v * 100) / 100));
    return {
      hora: `${String(h).padStart(2, "0")}h`,
      p10: clamp(p50 - banda),
      p50: clamp(p50),
      p90: clamp(p50 + banda),
    };
  });
}

export const SUBSISTEMAS: SubsistemaForecast[] = [
  {
    id: "SE/CO",
    label: "Sudeste/Centro-Oeste",
    descricao: "Maior subsistema do país, com forte interligação entre regiões.",
    hourly: curva(0.55, 0.22, 19, 0.12),
  },
  {
    id: "S",
    label: "Sul",
    descricao: "Matriz com peso hidroelétrico relevante e influência climática subtropical.",
    hourly: curva(0.5, 0.2, 20, 0.11),
  },
  {
    id: "NE",
    label: "Nordeste",
    descricao: "Subsistema com forte presença de geração eólica e solar.",
    hourly: curva(0.48, 0.18, 14, 0.14),
  },
  {
    id: "N",
    label: "Norte",
    descricao: "Predominância hidroelétrica, com parte do território isolada da rede principal.",
    hourly: curva(0.42, 0.15, 13, 0.13),
  },
];
