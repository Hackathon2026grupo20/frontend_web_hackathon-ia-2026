// Dados 100% sintéticos para a seção "Veja na prática" da landing page.
// Servem só para ilustrar a mecânica do produto (previsão de 24h + deslocamento de carga
// flexível) — não vêm da API nem de nenhuma simulação real, e não devem ser tratados como tal.

export interface DemoHourPoint {
  hora: string; // "00h".."23h"
  consumoKwh: number;
  tarifaBaseRsKwh: number;
  tarifaDinamicaRsKwh: number;
}

export interface DemoLoadShift {
  equipamento: string;
  janela: [number, number]; // horas em que o equipamento pode rodar
  horaHabitual: number;
  horaRecomendada: number;
  duracaoHoras: number;
  economiaPct: number;
}

export interface DemoUnidade {
  id: string;
  label: string;
  hourly: DemoHourPoint[];
  loadShift: DemoLoadShift;
}

// Curva senoidal simples com pico vespertino — só para ter um formato plausível de demanda.
function curvaSintetica(baseKwh: number, amplitude: number, picoHora: number) {
  return Array.from({ length: 24 }, (_, h) => {
    const fase = ((h - picoHora + 24) % 24) / 24;
    const consumo = baseKwh + amplitude * Math.cos(fase * 2 * Math.PI);
    return Math.max(0, Math.round(consumo * 10) / 10);
  });
}

function montarHourly(consumo: number[], tarifaBase: number, picoTarifa: number, amplitudeTarifa: number): DemoHourPoint[] {
  return consumo.map((consumoKwh, h) => {
    const fase = ((h - picoTarifa + 24) % 24) / 24;
    const dinamica = tarifaBase + amplitudeTarifa * Math.cos(fase * 2 * Math.PI);
    return {
      hora: `${String(h).padStart(2, "0")}h`,
      consumoKwh,
      tarifaBaseRsKwh: tarifaBase,
      tarifaDinamicaRsKwh: Math.max(0.1, Math.round(dinamica * 1000) / 1000),
    };
  });
}

export const DEMO_UNIDADES: DemoUnidade[] = [
  {
    id: "SE/CO",
    label: "Sudeste/Centro-Oeste",
    hourly: montarHourly(curvaSintetica(38, 14, 19), 0.78, 19, 0.22),
    loadShift: {
      equipamento: "Câmara fria",
      janela: [0, 24],
      horaHabitual: 18,
      horaRecomendada: 3,
      duracaoHoras: 3,
      economiaPct: 24,
    },
  },
  {
    id: "NE",
    label: "Nordeste",
    hourly: montarHourly(curvaSintetica(30, 11, 14), 0.71, 14, 0.19),
    loadShift: {
      equipamento: "Bombeamento de irrigação",
      janela: [5, 22],
      horaHabitual: 16,
      horaRecomendada: 6,
      duracaoHoras: 4,
      economiaPct: 18,
    },
  },
];
