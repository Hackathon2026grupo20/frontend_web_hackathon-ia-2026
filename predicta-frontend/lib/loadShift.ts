import type { HourlyPoint } from "@/types/api";

export interface Janela {
  inicio: string;
  fim: string;
  mediaMultiplicador: number;
}

// Acha a janela contígua de N horas com a menor (ou maior) média de multiplicador —
// é o que responde "de qual horário pra qual horário transferir", não só "qual hora isolada".
export function encontrarJanela(horas: HourlyPoint[], tamanho: number, tipo: "melhor" | "pior"): Janela {
  let melhorIdx = 0;
  let melhorMedia = tipo === "melhor" ? Infinity : -Infinity;
  for (let i = 0; i <= horas.length - tamanho; i++) {
    const fatia = horas.slice(i, i + tamanho);
    const media = fatia.reduce((s, h) => s + h.multiplier, 0) / tamanho;
    if ((tipo === "melhor" && media < melhorMedia) || (tipo === "pior" && media > melhorMedia)) {
      melhorMedia = media;
      melhorIdx = i;
    }
  }
  return {
    inicio: horas[melhorIdx].time,
    fim: horas[Math.min(melhorIdx + tamanho, horas.length) % horas.length].time,
    mediaMultiplicador: melhorMedia,
  };
}

function hexParaRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Interpola entre verde (bom) e vermelho (ruim) passando por um tom neutro no meio —
// evita a leitura binária "só 3 horas boas, resto ruim" e mostra o padrão do dia inteiro.
export function corPorMultiplicador(m: number, min: number, max: number, corBoa: string, corRuim: string, corNeutra: string) {
  const t = max === min ? 0.5 : (m - min) / (max - min); // 0 = melhor, 1 = pior
  const boa = hexParaRgb(corBoa);
  const neutra = hexParaRgb(corNeutra);
  const ruim = hexParaRgb(corRuim);
  let rgb: number[];
  if (t < 0.5) {
    const tt = t / 0.5;
    rgb = boa.map((c, i) => lerp(c, neutra[i], tt));
  } else {
    const tt = (t - 0.5) / 0.5;
    rgb = neutra.map((c, i) => lerp(c, ruim[i], tt));
  }
  return `rgb(${rgb.map((c) => Math.round(c)).join(",")})`;
}
