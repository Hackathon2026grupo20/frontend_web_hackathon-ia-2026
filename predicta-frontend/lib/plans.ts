import type { CustomerType } from "@/types/api";

// Planos do SaaS por porte do cliente. Preços ainda não definidos — a UI só oferece o upgrade.
export type PlanoId = "pequeno" | "medio" | "grande";

export type Recurso =
  | "previsao24h"
  | "comparacaoTarifa"
  | "faixaDeslocamento"
  | "economiaResumo"
  | "economiaDetalhada"
  | "equivalenciasCompletas"
  | "preClimatizacao"
  | "alertasTempoReal"
  | "exportarRelatorio"
  | "api";

export interface Plano {
  id: PlanoId;
  nome: string;
  porte: string;
  publico: string;
  // Perfil de consumo típico, ponto de partida até o cliente cadastrar a própria carga (lib/cargaFlexivel.ts).
  perfil: { monthly_kwh: number; customer_type: CustomerType; flexible_pct: number };
  avisosPorDia: number; // Infinity = sem limite
  canaisAviso: string;
  equivalencias: number; // quantas equivalências do dicionário aparecem
  unidades: string;
  cargasFlexiveis: number; // equipamentos flexíveis que o cliente pode cadastrar
  recursos: Recurso[];
}

const BASE: Recurso[] = ["previsao24h", "comparacaoTarifa", "economiaResumo"];

export const PLANOS: Record<PlanoId, Plano> = {
  pequeno: {
    id: "pequeno",
    nome: "Essencial",
    porte: "pequeno porte",
    publico: "Comércio e escritórios pequenos",
    perfil: { monthly_kwh: 3_000, customer_type: "commercial", flexible_pct: 15 },
    avisosPorDia: 2,
    canaisAviso: "a cada 12h · app e e-mail",
    equivalencias: 3,
    unidades: "1 unidade",
    cargasFlexiveis: 3,
    recursos: BASE,
  },
  medio: {
    id: "medio",
    nome: "Profissional",
    porte: "médio porte",
    publico: "Supermercados, clínicas, redes de lojas",
    perfil: { monthly_kwh: 40_000, customer_type: "commercial", flexible_pct: 25 },
    avisosPorDia: 8,
    canaisAviso: "a partir de 3 em 3h · app e e-mail",
    equivalencias: 8,
    unidades: "até 5 unidades",
    cargasFlexiveis: 10,
    recursos: [...BASE, "faixaDeslocamento", "economiaDetalhada", "equivalenciasCompletas", "preClimatizacao"],
  },
  grande: {
    id: "grande",
    nome: "Enterprise",
    porte: "grande porte",
    publico: "Indústrias e grandes consumidores",
    perfil: { monthly_kwh: 500_000, customer_type: "industrial_flat", flexible_pct: 30 },
    avisosPorDia: Infinity,
    canaisAviso: "a partir de 1 em 1h · app, e-mail, SMS e webhook",
    equivalencias: Infinity,
    unidades: "unidades ilimitadas",
    cargasFlexiveis: Infinity,
    recursos: [
      ...BASE,
      "faixaDeslocamento",
      "economiaDetalhada",
      "equivalenciasCompletas",
      "preClimatizacao",
      "alertasTempoReal",
      "exportarRelatorio",
      "api",
    ],
  },
};

export const ORDEM_PLANOS: PlanoId[] = ["pequeno", "medio", "grande"];

export function temRecurso(plano: Plano, recurso: Recurso) {
  return plano.recursos.includes(recurso);
}

// Menor plano que libera o recurso — usado no cadeado "disponível no plano X".
export function planoMinimo(recurso: Recurso): Plano {
  const id = ORDEM_PLANOS.find((p) => PLANOS[p].recursos.includes(recurso)) ?? "grande";
  return PLANOS[id];
}

// Próximo plano (acima do atual) que atende à condição — ex.: libera mais avisos ou recomendações.
export function proximoPlano(atual: Plano, melhor: (p: Plano) => boolean): Plano | undefined {
  return ORDEM_PLANOS.slice(ORDEM_PLANOS.indexOf(atual.id) + 1)
    .map((id) => PLANOS[id])
    .find(melhor);
}

export const LABEL_RECURSO: Record<Recurso, string> = {
  previsao24h: "Previsão de demanda 24h",
  comparacaoTarifa: "Tarifa-base × tarifa dinâmica",
  faixaDeslocamento: "Faixa de deslocamento de carga (pico → vale)",
  economiaResumo: "Resumo de economia (R$ e kWh)",
  economiaDetalhada: "Economia detalhada com curva otimizada",
  equivalenciasCompletas: "Dicionário completo de equivalências",
  preClimatizacao: "Pré-climatização inteligente",
  alertasTempoReal: "Avisos de hora em hora, por SMS e webhook",
  exportarRelatorio: "Exportar relatório (CSV)",
  api: "Acesso à API",
};
