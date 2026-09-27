import type { CustomerType } from "@/types/api";
import { TAREFAS, type Tarefa } from "@/lib/equipamentos";
import { USUARIO } from "@/lib/usuario";

// Carga flexível declarada pelo cliente: o que ele consegue ligar em outro horário sem prejudicar
// a operação. É daqui que sai o % flexível enviado para a simulação.

export interface ItemCarga {
  id: string;
  icone: string;
  nome: string;
  potenciaKw: number; // por unidade
  quantidade: number;
  horasPorDia: number; // tempo de funcionamento contínuo por dia
  janela: [number, number]; // pode rodar entre [início, fim) — hora local
  inicioHabitual: number;
  agendado: boolean; // cliente aceitou rodar na melhor janela do dia
}

export interface CargaConfig {
  monthly_kwh: number;
  customer_type: CustomerType;
  itens: ItemCarga[];
}

export const LIMITE_PCT_FLEXIVEL = 80; // mesmo teto aceito pela API (flexible_pct ≤ 80)

export function energiaDiaKwh(item: ItemCarga) {
  return item.potenciaKw * item.quantidade * item.horasPorDia;
}

export function energiaFlexivelDia(c: CargaConfig) {
  return c.itens.reduce((s, i) => s + energiaDiaKwh(i), 0);
}

export function consumoDia(c: CargaConfig) {
  return c.monthly_kwh / 30.4375;
}

export function pctFlexivel(c: CargaConfig) {
  const dia = consumoDia(c);
  if (dia <= 0) return 0;
  return Math.min(LIMITE_PCT_FLEXIVEL, Math.round((1000 * energiaFlexivelDia(c)) / dia) / 10);
}

export function itemDoCatalogo(t: Tarefa, quantidade = 1): ItemCarga {
  return {
    id: `${t.id}-${Math.random().toString(36).slice(2, 7)}`,
    icone: t.icone,
    nome: t.nome,
    potenciaKw: t.potenciaKw,
    quantidade,
    horasPorDia: t.duracaoH,
    janela: t.permitido,
    inicioHabitual: t.inicioHabitual,
    agendado: false,
  };
}

// Ponto de partida da carga: o consumo e os equipamentos declarados pela usuária (lib/usuario.ts),
// não o plano — trocar de assinatura não muda o tamanho da operação do cliente.
export function cargaPadrao(): CargaConfig {
  return {
    monthly_kwh: USUARIO.consumo.monthly_kwh,
    customer_type: USUARIO.consumo.customer_type,
    itens: USUARIO.cargaInicial.flatMap(([id, qtd]) => {
      const tarefa = TAREFAS.find((t) => t.id === id);
      return tarefa ? [itemDoCatalogo(tarefa, qtd)] : [];
    }),
  };
}

// Converte um item do cliente no formato usado pelas recomendações de horário.
export function comoTarefa(item: ItemCarga): Tarefa {
  return {
    id: item.id,
    icone: item.icone,
    nome: item.quantidade > 1 ? `${item.nome} (${item.quantidade} un.)` : item.nome,
    potenciaKw: item.potenciaKw * item.quantidade,
    duracaoH: Math.max(1, Math.min(24, Math.round(item.horasPorDia))),
    inicioHabitual: item.inicioHabitual,
    permitido: item.janela,
    para: ["residential", "commercial", "industrial_flat"],
  };
}
