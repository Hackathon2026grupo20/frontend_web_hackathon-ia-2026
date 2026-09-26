import type { CustomerType } from "@/types/api";

// Referências de consumo típicas (aproximadas) — usadas no dicionário de equivalências
// e nas recomendações. Não substituem a medição do equipamento real do cliente.

export interface Equivalencia {
  id: string;
  icone: string;
  kwhPorUnidade: number;
  unidade: (n: number) => string; // "2,5 horas", "12 banhos"...
  descricao: string;
}

function fmt(n: number, casas = 1) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: n >= 100 ? 0 : casas });
}

export const EQUIVALENCIAS: Equivalencia[] = [
  { id: "ar", icone: "❄️", kwhPorUnidade: 1.1, unidade: (n) => `${fmt(n)} h`, descricao: "de ar-condicionado split 12.000 BTU ligado" },
  { id: "banho", icone: "🚿", kwhPorUnidade: 0.92, unidade: (n) => `${fmt(n, 0)} banhos`, descricao: "de 10 min com chuveiro elétrico (5,5 kW)" },
  { id: "carro", icone: "🚗", kwhPorUnidade: 0.17, unidade: (n) => `${fmt(n, 0)} km`, descricao: "rodados com um carro elétrico compacto" },
  { id: "geladeira", icone: "🧊", kwhPorUnidade: 1.2, unidade: (n) => `${fmt(n)} dias`, descricao: "de uma geladeira frost-free funcionando" },
  { id: "notebook", icone: "💻", kwhPorUnidade: 0.06, unidade: (n) => `${fmt(n, 0)} h`, descricao: "de notebook em uso" },
  { id: "led", icone: "💡", kwhPorUnidade: 0.009, unidade: (n) => `${fmt(n, 0)} h`, descricao: "de uma lâmpada LED de 9 W acesa" },
  { id: "celular", icone: "🔋", kwhPorUnidade: 0.015, unidade: (n) => `${fmt(n, 0)} cargas`, descricao: "completas de celular" },
  { id: "casa", icone: "🏠", kwhPorUnidade: 165, unidade: (n) => `${fmt(n)} meses`, descricao: "de consumo de uma residência média brasileira (~165 kWh/mês)" },
];

export function calcularEquivalencias(kwh: number) {
  return EQUIVALENCIAS.map((e) => ({ ...e, quantidade: kwh / e.kwhPorUnidade }))
    // mostra primeiro o que dá um número "palpável" (nem 0,01 nem 1 milhão)
    .sort((a, b) => score(a.quantidade) - score(b.quantidade));
}

function score(q: number) {
  if (q < 0.5) return 100 + (0.5 - q);
  return Math.abs(Math.log10(q) - 1.3); // ~20 unidades é o ponto ideal
}

// Tarefas deslocáveis: duração, potência e horário em que costumam ser feitas.
export interface Tarefa {
  id: string;
  icone: string;
  nome: string;
  potenciaKw: number;
  duracaoH: number;
  inicioHabitual: number; // hora local
  // Horário em que a tarefa pode acontecer (início e fim, hora local). Ex.: lavanderia só com equipe.
  permitido: [number, number];
  para: CustomerType[];
  // Tarefas "essenciais" aparecem até no plano pequeno
  essencial?: boolean;
}

export const TAREFAS: Tarefa[] = [
  { id: "agua", icone: "♨️", nome: "Aquecer água (boiler)", potenciaKw: 3, duracaoH: 2, inicioHabitual: 18, permitido: [0, 24], para: ["residential", "commercial"], essencial: true },
  { id: "loucas", icone: "🍽️", nome: "Lava-louças / lavanderia", potenciaKw: 2.2, duracaoH: 2, inicioHabitual: 19, permitido: [6, 23], para: ["residential", "commercial"], essencial: true },
  { id: "camara", icone: "🥶", nome: "Pré-resfriar câmara fria", potenciaKw: 6, duracaoH: 3, inicioHabitual: 17, permitido: [10, 18], para: ["commercial", "industrial_flat"] },
  { id: "veiculos", icone: "🔌", nome: "Carregar veículos / empilhadeiras", potenciaKw: 11, duracaoH: 4, inicioHabitual: 18, permitido: [0, 24], para: ["commercial", "industrial_flat"], essencial: true },
  { id: "bomba", icone: "💧", nome: "Bombear água para reservatório", potenciaKw: 3.7, duracaoH: 2, inicioHabitual: 8, permitido: [0, 24], para: ["commercial", "industrial_flat"] },
  { id: "compressor", icone: "🏭", nome: "Encher tanque de ar comprimido", potenciaKw: 15, duracaoH: 2, inicioHabitual: 17, permitido: [0, 24], para: ["industrial_flat"] },
  { id: "lote", icone: "🗄️", nome: "Processamento em lote / backups", potenciaKw: 4, duracaoH: 3, inicioHabitual: 19, permitido: [0, 24], para: ["commercial", "industrial_flat"] },
];

// Ar-condicionado usado na recomendação de pré-climatização, por perfil.
export const AR_CONDICIONADO: Record<CustomerType, { nome: string; potenciaKw: number }> = {
  residential: { nome: "ar-condicionado split", potenciaKw: 1.1 },
  commercial: { nome: "ar-condicionado central (10 TR)", potenciaKw: 12 },
  industrial_flat: { nome: "sistema de climatização (chiller)", potenciaKw: 60 },
};
