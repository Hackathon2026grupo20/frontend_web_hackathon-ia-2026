import type { CustomerType } from "@/types/api";

// Catálogo de tarefas deslocáveis: ponto de partida do cadastro de carga flexível do cliente.
// Valores aproximados — não substituem a medição do equipamento real.

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
