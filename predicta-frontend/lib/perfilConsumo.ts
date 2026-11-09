import type { CustomerType } from "@/types/api";

// Perfil de consumo do cliente — o que vai no POST /api/v1/simulations/.
// Não é dado de simulação (tarifa, demanda prevista e otimização vêm todos da API): é o que o
// cliente declara sobre si.
export interface PerfilConsumo {
  monthly_kwh: number;
  customer_type: CustomerType;
  flexible_pct: number;
}
