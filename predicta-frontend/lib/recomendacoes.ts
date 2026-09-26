import type { CustomerType, HourlyPoint } from "@/types/api";
import { AR_CONDICIONADO, type Tarefa } from "@/lib/equipamentos";
import { comoTarefa, type ItemCarga } from "@/lib/cargaFlexivel";
import { encontrarJanela } from "@/lib/loadShift";
import { horaLocal } from "@/lib/format";

function hora(h: HourlyPoint) {
  return Number(h.local_iso.slice(11, 13));
}

function fimLabel(horas: HourlyPoint[], ultimo: number) {
  return `${String((hora(horas[ultimo]) + 1) % 24).padStart(2, "0")}h`;
}

export interface RecomendacaoTarefa {
  tarefa: Tarefa;
  habitual: { inicio: string; fim: string; custo: number };
  melhor: { inicio: string; fim: string; custo: number };
  economiaRs: number;
  economiaPct: number;
  jaOtimo: boolean;
}

// Compara o horário habitual da tarefa com a janela contígua mais barata do dia simulado.
export function recomendarTarefa(horas: HourlyPoint[], tarefa: Tarefa): RecomendacaoTarefa | null {
  const d = tarefa.duracaoH;
  if (horas.length < d) return null;
  const custo = (i: number) =>
    horas.slice(i, i + d).reduce((s, h) => s + h.dynamic_rs_kwh * tarefa.potenciaKw, 0);

  // Só janelas inteiramente dentro do horário permitido da tarefa
  const [ini, fim] = tarefa.permitido;
  const cabe = (i: number) => hora(horas[i]) >= ini && hora(horas[i]) + d <= fim;
  let melhorIdx = -1;
  for (let i = 0; i <= horas.length - d; i++) {
    if (cabe(i) && (melhorIdx < 0 || custo(i) < custo(melhorIdx))) melhorIdx = i;
  }
  if (melhorIdx < 0) return null;

  // O horário habitual pode passar do fim da janela simulada (ex.: janela 21h→20h e tarefa 18h–22h).
  // A tarifa se repete a cada dia, então o custo habitual "dá a volta" nas 24 horas.
  let habIdx = horas.findIndex((h) => hora(h) === tarefa.inicioHabitual);
  if (habIdx < 0) habIdx = 0;
  const n = horas.length;
  const cHab = Array.from({ length: d }, (_, k) => horas[(habIdx + k) % n].dynamic_rs_kwh * tarefa.potenciaKw).reduce(
    (s, v) => s + v,
    0
  );
  const cMelhor = custo(melhorIdx);
  const economiaRs = cHab - cMelhor;
  return {
    tarefa,
    habitual: { inicio: horaLocal(horas[habIdx]), fim: fimLabel(horas, (habIdx + d - 1) % n), custo: cHab },
    melhor: { inicio: horaLocal(horas[melhorIdx]), fim: fimLabel(horas, melhorIdx + d - 1), custo: cMelhor },
    economiaRs,
    economiaPct: cHab > 0 ? (100 * economiaRs) / cHab : 0,
    jaOtimo: economiaRs / Math.max(cHab, 1e-9) < 0.005,
  };
}

// Recomendações sobre a carga flexível cadastrada pelo próprio cliente.
export function recomendacoesDaCarga(horas: HourlyPoint[], itens: ItemCarga[]) {
  return itens
    .map((i) => ({ item: i, rec: recomendarTarefa(horas, comoTarefa(i)) }))
    .filter((x): x is { item: ItemCarga; rec: RecomendacaoTarefa } => x.rec !== null);
}

export interface PreClimatizacao {
  equipamento: string;
  ligarAs: string;
  emVezDe: string;
  diferencaPct: number;
  economiaPorHoraRs: number;
}

// Pré-climatização: se a tarifa daqui a 2h (no pico) for bem mais cara que agora, compensa
// adiantar o resfriamento e reduzir a potência no pico. Considera só o horário comercial (11h–21h).
export function recomendarPreClimatizacao(horas: HourlyPoint[], tipo: CustomerType): PreClimatizacao | null {
  const ar = AR_CONDICIONADO[tipo];
  const media = horas.reduce((s, h) => s + h.dynamic_rs_kwh, 0) / Math.max(horas.length, 1);
  let melhor: PreClimatizacao | null = null;
  for (let i = 0; i + 2 < horas.length; i++) {
    const agora = horas[i].dynamic_rs_kwh;
    const depois = horas[i + 2].dynamic_rs_kwh;
    const hDepois = hora(horas[i + 2]);
    if (hDepois < 11 || hDepois > 21 || depois < media) continue;
    const dif = (depois - agora) / depois;
    if (dif < 0.03) continue;
    if (!melhor || dif * 100 > melhor.diferencaPct) {
      melhor = {
        equipamento: ar.nome,
        ligarAs: horaLocal(horas[i]),
        emVezDe: horaLocal(horas[i + 2]),
        diferencaPct: dif * 100,
        economiaPorHoraRs: ar.potenciaKw * (depois - agora),
      };
    }
  }
  return melhor;
}

export type NivelAviso = "alerta" | "oportunidade" | "info";

export interface Aviso {
  id: string;
  nivel: NivelAviso;
  titulo: string;
  detalhe: string;
  horaIdx: number; // índice (na janela de 24h) em que o evento acontece
}

// Avisos do dia, em ordem de prioridade. O plano define quantos o cliente recebe.
export function gerarAvisos(horas: HourlyPoint[], tipo: CustomerType): Aviso[] {
  if (horas.length < 3) return [];
  const avisos: Aviso[] = [];
  const pico = encontrarJanela(horas, 3, "pior");
  const vale = encontrarJanela(horas, 3, "melhor");
  const idx = (label: string) => Math.max(0, horas.findIndex((h) => horaLocal(h) === label));

  if (pico.mediaMultiplicador > 1.01) {
    avisos.push({
      id: "pico",
      nivel: "alerta",
      horaIdx: idx(pico.inicio),
      titulo: `Pico caro das ${pico.inicio} às ${pico.fim}`,
      detalhe: `Tarifa ${((pico.mediaMultiplicador - 1) * 100).toFixed(1)}% acima da base. Evite ligar cargas flexíveis nesse período.`,
    });
  }
  if (vale.mediaMultiplicador < 0.99) {
    avisos.push({
      id: "vale",
      nivel: "oportunidade",
      horaIdx: idx(vale.inicio),
      titulo: `Janela barata das ${vale.inicio} às ${vale.fim}`,
      detalhe: `Tarifa ${((1 - vale.mediaMultiplicador) * 100).toFixed(1)}% abaixo da base. Bom momento para cargas flexíveis.`,
    });
  }
  const pre = recomendarPreClimatizacao(horas, tipo);
  if (pre) {
    avisos.push({
      id: "preclima",
      nivel: "oportunidade",
      horaIdx: idx(pre.ligarAs),
      titulo: `Pré-climatize às ${pre.ligarAs}`,
      detalhe: `A tarifa às ${pre.ligarAs} está ${pre.diferencaPct.toFixed(0)}% mais barata que às ${pre.emVezDe}.`,
    });
  }
  const altaIdx = horas.findIndex((h) => h.demand_pressure >= 2 / 3);
  if (altaIdx >= 0) {
    const n = horas.filter((h) => h.demand_pressure >= 2 / 3).length;
    avisos.push({
      id: "pressao",
      nivel: "info",
      horaIdx: altaIdx,
      titulo: `Demanda do sistema alta a partir das ${horaLocal(horas[altaIdx])}`,
      detalhe: `${n}h do dia com pressão de demanda alta no subsistema.`,
    });
  }
  if (pico.mediaMultiplicador > 1.01) {
    avisos.push({
      id: "normaliza",
      nivel: "info",
      horaIdx: Math.min(horas.length - 1, idx(pico.inicio) + 3),
      titulo: `Tarifa volta a cair a partir das ${pico.fim}`,
      detalhe: "Cargas adiadas no pico podem ser retomadas depois desse horário.",
    });
  }
  return avisos;
}
