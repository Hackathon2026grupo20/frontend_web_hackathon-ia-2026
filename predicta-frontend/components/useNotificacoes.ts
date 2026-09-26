"use client";

import { useCliente } from "@/components/ClienteProvider";
import { LIMITES, avisosDoDia, montarEntregas } from "@/lib/notificacoes";

// Entregas do dia para o cliente atual (plano + preferências), com o id usado para "lida".
export function useNotificacoes() {
  const { plano, perfil, carga, prefs, resultado, lidas } = useCliente();
  const limites = LIMITES[plano.id];
  const sim = resultado?.simulation;
  if (!sim) return { limites, entregas: [], naoLidas: [] as string[], chave: (id: string) => id };

  const dia = sim.hourly[0]?.local_iso.slice(0, 10) ?? "";
  const chave = (id: string) => `${dia}-${id}`;
  const todos = avisosDoDia(sim.hourly, perfil.customer_type, sim.optimization, carga.itens);
  const entregas = montarEntregas(sim.hourly, todos, prefs, limites.maxPorDia);
  const naoLidas = entregas.flatMap((e) => e.avisos.map((a) => chave(a.id))).filter((k) => !lidas.includes(k));
  return { limites, entregas, naoLidas, chave };
}
