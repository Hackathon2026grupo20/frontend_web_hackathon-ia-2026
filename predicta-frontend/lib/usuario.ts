import type { CustomerType } from "@/types/api";
import type { PlanoId } from "@/lib/plans";

// Usuária de demonstração da Predicta.
//
// Enquanto não existe cadastro nem login, TODO dado de cliente do front sai daqui — este é o
// único arquivo que inventa informação de cliente, e é o que a página /perfil mostra. Quando
// houver backend de contas, este objeto é substituído pela resposta do login e o resto do app
// não muda: nada além de /perfil lê este arquivo direto, o painel consome tudo pelo
// ClienteProvider.
//
// A distribuidora é a Enel RJ porque é a única validada ponta a ponta contra a API (as outras
// não têm tarifa processada no backend). O CNPJ da empresa é fictício; o da distribuidora é
// real, porque é ele que GET /catalog/profiles/ exige para devolver os perfis tarifários.

export interface Usuario {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string; // fictício — a UI sinaliza
  segmento: string;
  unidade: string;
  endereco: string;
  cidade: string;
  uf: string;
  responsavel: { nome: string; cargo: string; email: string };
  clienteDesde: string;
  planoContratado: PlanoId;

  // Contrato de energia. O par (CNPJ da distribuidora, subsistema) precisa ser coerente — é
  // exatamente o que vai no POST /api/v1/simulations/.
  distribuidoraCnpj: string; // só dígitos
  regionId: string; // subsistema ONS: N, NE, SE/CO, S

  // Consumo declarado, editável em /perfil. A lista de equipamentos flexíveis fica em /carga.
  consumo: { monthly_kwh: number; customer_type: CustomerType };

  // Equipamentos flexíveis iniciais: [id do catálogo em lib/equipamentos.ts, quantidade].
  // Só o ponto de partida — o cliente edita, remove e adiciona em /carga.
  cargaInicial: [string, number][];
}

export const USUARIO: Usuario = {
  nomeFantasia: "Supermercado Vila Nova",
  razaoSocial: "Vila Nova Comércio de Alimentos Ltda.",
  cnpj: "12.345.678/0001-95",
  segmento: "Supermercado · varejo alimentar",
  unidade: "Loja Tijuca",
  endereco: "Rua Conde de Bonfim, 1.200",
  cidade: "Rio de Janeiro",
  uf: "RJ",
  responsavel: {
    nome: "Marina Alves",
    cargo: "Gerência de operações",
    email: "operacoes@vilanova.exemplo.br",
  },
  clienteDesde: "agosto de 2025",
  planoContratado: "medio",

  distribuidoraCnpj: "33050071000158", // Enel RJ
  regionId: "SE/CO",

  consumo: { monthly_kwh: 40_000, customer_type: "commercial" },

  // ~235 kWh/dia flexíveis de um consumo diário de ~1.314 kWh → ≈18% da carga.
  cargaInicial: [
    ["camara", 6],
    ["veiculos", 2],
    ["bomba", 2],
    ["agua", 2],
    ["lote", 1],
  ],
};
