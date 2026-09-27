import { getDistributionAreas } from "@/lib/api";
import type { DistributionAreaProperties } from "@/types/api";

// Distribuidoras a partir do GeoJSON de áreas de concessão da ANEEL. O objetivo é só popular o
// seletor: o que interessa é o CNPJ, porque é ele que catalog/profiles/ exige para devolver os
// perfis tarifários — e é do perfil que saem as tarifas.

export interface Distribuidora {
  cnpj: string; // só dígitos, como a API espera
  sigla: string;
  razaoSocial: string;
  uf: string;
  regionId: string; // subsystem_id: N, NE, SE/CO, S
  concessionaria: boolean; // false = permissionária (cooperativas de eletrificação rural)
  unidadesConsumidoras: number;
}

function normalizar(p: DistributionAreaProperties): Distribuidora {
  return {
    cnpj: p.cnpj_digits,
    sigla: p.sigla,
    razaoSocial: p.razao_social,
    uf: p.uf,
    regionId: p.subsystem_id,
    concessionaria: p.tipo_outorga === "CONCESSIONÁRIA",
    unidadesConsumidoras: p.num_unidades_consumidoras ?? 0,
  };
}

export async function listarDistribuidoras(): Promise<Distribuidora[]> {
  const geo = await getDistributionAreas();
  const porCnpj = new Map<string, Distribuidora>();
  for (const f of geo.features ?? []) {
    const d = normalizar(f.properties);
    if (d.cnpj && !porCnpj.has(d.cnpj)) porCnpj.set(d.cnpj, d); // uma empresa pode ter várias áreas
  }
  return [...porCnpj.values()];
}

// Concessionárias primeiro e as maiores no topo: são as que têm tarifa publicada e interessam
// para a conferência. As permissionárias ficam no fim, mas continuam escolhíveis.
export function distribuidorasDaRegiao(todas: Distribuidora[], regionId: string): Distribuidora[] {
  return todas
    .filter((d) => d.regionId === regionId)
    .sort(
      (a, b) =>
        Number(b.concessionaria) - Number(a.concessionaria) ||
        b.unidadesConsumidoras - a.unidadesConsumidoras ||
        a.sigla.localeCompare(b.sigla)
    );
}

export function rotuloDistribuidora(d: Distribuidora): string {
  return `${d.sigla} — ${d.razaoSocial} (${d.uf})`;
}
