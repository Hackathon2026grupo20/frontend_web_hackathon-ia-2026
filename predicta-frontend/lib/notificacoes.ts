import type { CustomerType, HourlyPoint, OptimizationResult } from "@/types/api";
import type { PlanoId } from "@/lib/plans";
import { gerarAvisos, recomendacoesDaCarga, type Aviso } from "@/lib/recomendacoes";
import type { ItemCarga } from "@/lib/cargaFlexivel";
import { horaLocal } from "@/lib/format";

export type TipoNotificacao = "pico" | "vale" | "preclima" | "pressao" | "normaliza" | "economia" | "tarefa";
export type Canal = "app" | "email" | "sms" | "webhook";

export const TIPOS: { id: TipoNotificacao; nome: string; descricao: string }[] = [
  { id: "pico", nome: "Pico caro", descricao: "Quando a tarifa vai ficar bem acima da base." },
  { id: "vale", nome: "Janela barata", descricao: "Melhor momento do dia para cargas flexíveis." },
  { id: "economia", nome: "Resumo de economia", descricao: "Quanto dá para economizar hoje deslocando consumo." },
  { id: "preclima", nome: "Hora de pré-climatizar", descricao: "Ligar o ar antes do pico, enquanto a tarifa está baixa." },
  { id: "pressao", nome: "Demanda do sistema alta", descricao: "Subsistema sob pressão de demanda." },
  { id: "tarefa", nome: "Melhor horário para tarefas", descricao: "Janela ideal para a tarefa flexível que mais economiza." },
  { id: "normaliza", nome: "Tarifa voltando ao normal", descricao: "Fim do pico: cargas adiadas podem ser retomadas." },
];

export const CANAIS: { id: Canal; nome: string }[] = [
  { id: "app", nome: "No app (sino)" },
  { id: "email", nome: "E-mail" },
  { id: "sms", nome: "SMS" },
  { id: "webhook", nome: "Webhook (integração)" },
];

export interface LimitesNotificacao {
  intervaloMinH: number; // menor intervalo entre entregas que o plano permite
  atalhos: number[]; // intervalos sugeridos na tela
  maxPorDia: number; // avisos por dia (Infinity = sem limite)
  tipos: TipoNotificacao[];
  canais: Canal[];
  silencio: boolean; // pode configurar horário de silêncio
}

export const LIMITES: Record<PlanoId, LimitesNotificacao> = {
  pequeno: { intervaloMinH: 12, atalhos: [12, 24], maxPorDia: 2, tipos: ["pico", "vale", "economia"], canais: ["app", "email"], silencio: false },
  medio: { intervaloMinH: 3, atalhos: [3, 6, 12, 24], maxPorDia: 8, tipos: ["pico", "vale", "economia", "preclima", "pressao"], canais: ["app", "email"], silencio: true },
  grande: { intervaloMinH: 1, atalhos: [1, 3, 6, 12, 24], maxPorDia: Infinity, tipos: TIPOS.map((t) => t.id), canais: ["app", "email", "sms", "webhook"], silencio: true },
};

export interface PreferenciasNotificacao {
  intervaloH: number;
  tipos: TipoNotificacao[];
  canais: Canal[];
  silencio: { ativo: boolean; inicio: number; fim: number };
}

export function preferenciasPadrao(plano: PlanoId): PreferenciasNotificacao {
  const l = LIMITES[plano];
  return {
    intervaloH: l.intervaloMinH === 1 ? 3 : l.intervaloMinH === 3 ? 6 : 12,
    tipos: [...l.tipos],
    canais: ["app", "email"],
    silencio: { ativo: false, inicio: 22, fim: 6 },
  };
}

// Garante que preferências salvas (ou vindas de outro plano) respeitam os limites do plano atual.
export function ajustarAoPlano(p: PreferenciasNotificacao, plano: PlanoId): PreferenciasNotificacao {
  const l = LIMITES[plano];
  return {
    intervaloH: Math.min(24, Math.max(l.intervaloMinH, Math.round(p.intervaloH))),
    tipos: p.tipos.filter((t) => l.tipos.includes(t)),
    canais: p.canais.filter((c) => l.canais.includes(c)),
    silencio: { ...p.silencio, ativo: l.silencio && p.silencio.ativo },
  };
}

function hora(h: HourlyPoint) {
  return Number(h.local_iso.slice(11, 13));
}

function emSilencio(horaDoDia: number, s: PreferenciasNotificacao["silencio"]) {
  if (!s.ativo) return false;
  return s.inicio <= s.fim ? horaDoDia >= s.inicio && horaDoDia < s.fim : horaDoDia >= s.inicio || horaDoDia < s.fim;
}

export interface AvisoComTipo extends Aviso {
  tipo: TipoNotificacao;
}

// Todos os avisos possíveis do dia, com o tipo e a hora (índice) do evento.
export function avisosDoDia(horas: HourlyPoint[], tipo: CustomerType, opt: OptimizationResult, itens: ItemCarga[]): AvisoComTipo[] {
  const base: AvisoComTipo[] = gerarAvisos(horas, tipo).map((a) => ({ ...a, tipo: a.id as TipoNotificacao }));
  const extras: AvisoComTipo[] = [];
  const economia = opt.potential_savings_24h_rs ?? 0;
  if (economia > 0) {
    extras.push({
      id: "economia",
      tipo: "economia",
      nivel: "oportunidade",
      horaIdx: 0,
      titulo: `Hoje dá para economizar ${economia.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
      detalhe: "Deslocando a parte flexível do consumo para as horas mais baratas.",
    });
  }
  // Equipamento do cliente que mais economiza mudando de horário
  const tarefa = recomendacoesDaCarga(horas, itens)
    .map((x) => x.rec)
    .filter((r) => !r.jaOtimo)
    .sort((a, b) => b.economiaRs - a.economiaRs)[0];
  if (tarefa) {
    const idx = horas.findIndex((h) => horaLocal(h) === tarefa.melhor.inicio);
    extras.push({
      id: "tarefa",
      tipo: "tarefa",
      nivel: "oportunidade",
      horaIdx: Math.max(0, idx),
      titulo: `${tarefa.tarefa.nome}: ${tarefa.melhor.inicio}–${tarefa.melhor.fim}`,
      detalhe: `${tarefa.economiaPct.toFixed(0)}% mais barato que no horário habitual (${tarefa.habitual.inicio}).`,
    });
  }
  return [...extras.filter((e) => e.tipo === "economia"), ...base, ...extras.filter((e) => e.tipo === "tarefa")];
}

export interface Entrega {
  slotIdx: number;
  horario: string; // "12h"
  adiadaPorSilencio: boolean;
  avisos: AvisoComTipo[];
}

// Agenda do dia: os avisos são agrupados na entrega (a cada N horas) anterior ao evento.
// Entregas que caem no horário de silêncio são adiadas para o fim dele.
export function montarEntregas(
  horas: HourlyPoint[],
  avisos: AvisoComTipo[],
  prefs: PreferenciasNotificacao,
  maxPorDia: number
): Entrega[] {
  if (!horas.length) return [];
  const escolhidos = avisos.filter((a) => prefs.tipos.includes(a.tipo)).slice(0, maxPorDia);
  const porSlot = new Map<number, Entrega>();
  for (const a of escolhidos) {
    let slot = Math.floor(a.horaIdx / prefs.intervaloH) * prefs.intervaloH;
    let adiada = false;
    while (slot < horas.length && emSilencio(hora(horas[slot]), prefs.silencio)) {
      slot += 1;
      adiada = true;
    }
    if (slot >= horas.length) continue; // todo o resto do dia está em silêncio
    const e = porSlot.get(slot) ?? { slotIdx: slot, horario: horaLocal(horas[slot]), adiadaPorSilencio: adiada, avisos: [] };
    e.avisos.push(a);
    porSlot.set(slot, e);
  }
  return [...porSlot.values()].sort((a, b) => a.slotIdx - b.slotIdx);
}

// Horários de entrega do dia para a pré-visualização (ignora se há aviso ou não).
export function horariosDeEntrega(horas: HourlyPoint[], prefs: PreferenciasNotificacao): string[] {
  const out: string[] = [];
  for (let i = 0; i < horas.length; i += prefs.intervaloH) {
    if (!emSilencio(hora(horas[i]), prefs.silencio)) out.push(horaLocal(horas[i]));
  }
  return out;
}

export function labelIntervalo(h: number) {
  return h === 1 ? "a cada 1 hora" : h === 24 ? "1 vez por dia" : `a cada ${h} horas`;
}
