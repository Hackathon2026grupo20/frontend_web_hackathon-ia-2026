import { getCatalogProfiles, runSimulation } from "@/lib/api";
import type { PerfilConsumo } from "@/lib/perfilConsumo";
import type {
  CustomerType,
  DistributorInfo,
  SimulationMode,
  SimulationResponse,
  TariffProfile,
} from "@/types/api";

export interface SimulationResult {
  simulation: SimulationResponse;
  profile: TariffProfile | null;
  distributor: DistributorInfo | null;
}

// Subgrupo ANEEL de baixa tensão por tipo de cliente: B1 residencial; B3 "demais classes"
// (comércio, serviços e indústria em baixa tensão). Os perfis volumétricos do MVP são todos B.
const SUBGRUPO: Record<CustomerType, string> = { residential: "B1", commercial: "B3", industrial_flat: "B3" };

// Variantes que não representam o cliente padrão: pré-pagamento, compensação de micro/minigeração
// (SCEE), tarifa social e tarifas entre distribuidoras (A2/A4 "Distribuição", ~R$ 0,01/kWh).
const VARIANTE = /pré-pagamento|SCEE|baixa renda|distribuição|cooperativa|irriga/i;

// O backend só aceita distributor_id/tariff_profile_id que existam na tabela ANEEL para o CNPJ,
// então o perfil vem de catalog/profiles: o convencional do subgrupo do cliente, sem variantes.
export function escolherPerfilTarifa(profiles: TariffProfile[], tipo: CustomerType): TariffProfile | undefined {
  const padrao = profiles.filter((p) => !VARIANTE.test(p.label) && p.subgroup.startsWith("B"));
  return (
    padrao.find((p) => p.subgroup === SUBGRUPO[tipo] && /convencional/i.test(p.modality)) ??
    padrao.find((p) => p.subgroup === SUBGRUPO[tipo]) ??
    padrao[0]
  );
}

// Contrato de energia do cliente: a distribuidora dele e o subsistema onde ela atua. Vem do
// perfil do usuário (lib/usuario.ts), não de um seletor no painel.
export interface AlvoSimulacao {
  cnpj: string; // CNPJ da distribuidora, só dígitos
  regionId: string; // subsistema ONS
  mode: SimulationMode;
  rotulo: string; // nome da distribuidora, usado só na mensagem de erro
}

export async function simularCliente(
  alvo: AlvoSimulacao,
  perfil: PerfilConsumo,
  replayKey?: string
): Promise<SimulationResult> {
  const catalogo = await getCatalogProfiles(alvo.cnpj, alvo.regionId);
  const perfilTarifa = escolherPerfilTarifa(catalogo.profiles, perfil.customer_type);
  if (!perfilTarifa) {
    throw new Error(
      `A API não tem perfil tarifário ANEEL vigente para ${alvo.rotulo} (CNPJ ${alvo.cnpj}). ` +
        "As tarifas processadas provavelmente ainda não foram carregadas no backend."
    );
  }

  const simulation = await runSimulation({
    cnpj: alvo.cnpj,
    region: alvo.regionId,
    distributor: perfilTarifa.distributor_id,
    profile: perfilTarifa.id,
    monthly_kwh: perfil.monthly_kwh,
    customer_type: perfil.customer_type,
    mode: alvo.mode,
    flexible_pct: perfil.flexible_pct,
    // "" = janela mais recente disponível (o backend escolhe)
    replay_key: replayKey || undefined,
  });
  return { simulation, profile: perfilTarifa, distributor: catalogo.distributor };
}
