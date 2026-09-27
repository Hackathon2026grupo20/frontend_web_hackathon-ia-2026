import type { HourlyPoint } from "@/types/api";
import { horaLocal } from "@/lib/format";

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
  // fim = início da hora seguinte à janela (a última janela termina 1h após o último ponto)
  const ultima = horas[Math.min(melhorIdx + tamanho, horas.length) - 1];
  const fimHora = (Number(ultima.local_iso.slice(11, 13)) + 1) % 24;
  return {
    inicio: horaLocal(horas[melhorIdx]),
    fim: `${String(fimHora).padStart(2, "0")}h`,
    mediaMultiplicador: melhorMedia,
  };
}
