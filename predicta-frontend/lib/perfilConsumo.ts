import type { CustomerType } from "@/types/api";
import { pctFlexivel, type CargaConfig } from "@/lib/cargaFlexivel";

// Perfil de consumo do cliente — o que vai no POST /api/v1/simulations/.
//
// Não é dado de simulação (tarifa, demanda prevista e otimização vêm todos da API): é o que o
// cliente declara sobre si. Hoje são três números porque é o que a API aceita, e eles começam
// preenchidos a partir do plano (lib/plans.ts) e da carga flexível (lib/cargaFlexivel.ts) só
// como ponto de partida editável.
//
// Quando o cliente puder informar seu consumo em detalhe — curva horária medida em vez de um
// total mensal, potência real de cada equipamento em vez do catálogo típico — é este perfil que
// cresce, e a estimativa em lib/consumptionShapes.ts deixa de ser necessária.
export interface PerfilConsumo {
  monthly_kwh: number;
  customer_type: CustomerType;
  flexible_pct: number;
}

// O % flexível não é digitado: sai da lista de equipamentos que o cliente marcou como deslocáveis.
export function perfilDaCarga(carga: CargaConfig): PerfilConsumo {
  return {
    monthly_kwh: carga.monthly_kwh,
    customer_type: carga.customer_type,
    flexible_pct: pctFlexivel(carga),
  };
}
