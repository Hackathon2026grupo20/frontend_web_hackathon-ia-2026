"use client";

import { useRouter } from "next/navigation";
import { useCliente } from "@/components/ClienteProvider";
import { LABEL_RECURSO, ORDEM_PLANOS, PLANOS, type Recurso } from "@/lib/plans";

const TIPO: Record<string, string> = { commercial: "comercial", industrial_flat: "industrial", residential: "residencial" };

export default function Planos() {
  const { plano: atual, setPlano } = useCliente();
  const router = useRouter();
  const planos = ORDEM_PLANOS.map((id) => PLANOS[id]);
  const recursos = Object.keys(LABEL_RECURSO) as Recurso[];

  function escolher(id: (typeof ORDEM_PLANOS)[number]) {
    setPlano(id);
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-dim font-mono mb-1">planos por porte</p>
        <h1 className="font-display font-bold text-2xl">Escolha o plano da sua operação</h1>
        <p className="text-sm text-dim mt-1">
          Quanto maior a operação, mais avisos, mais recomendações e mais integração.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {planos.map((p) => {
          const ativo = p.id === atual.id;
          const upgrade = ORDEM_PLANOS.indexOf(p.id) > ORDEM_PLANOS.indexOf(atual.id);
          return (
            <div
              key={p.id}
              className="bg-panel border rounded-card p-5 flex flex-col"
              style={{ borderColor: ativo ? "var(--accent-brand)" : "var(--border)" }}
            >
              <p className="text-xs text-dim font-mono mb-1">{p.porte}</p>
              <h2 className="font-display font-bold text-xl">{p.nome}</h2>
              <p className="text-xs text-dim mb-4">{p.publico}</p>
              <ul className="text-sm flex flex-col gap-1.5 my-5">
                <li>
                  📊 perfil típico: {p.perfil.monthly_kwh.toLocaleString("pt-BR")} kWh/mês ({TIPO[p.perfil.customer_type]})
                </li>
                <li>🔔 {p.avisosPorDia === Infinity ? "avisos ilimitados" : `${p.avisosPorDia} ${p.avisosPorDia === 1 ? "aviso" : "avisos"}/dia`} · {p.canaisAviso}</li>
                <li>⚡ {p.cargasFlexiveis === Infinity ? "equipamentos flexíveis ilimitados" : `até ${p.cargasFlexiveis} equipamentos flexíveis`}</li>
                <li>🏢 {p.unidades}</li>
              </ul>
              {ativo ? (
                <p className="mt-auto py-2.5 rounded-card text-sm text-center border border-border text-dim">Plano atual</p>
              ) : upgrade ? (
                <button
                  onClick={() => escolher(p.id)}
                  className="mt-auto py-2.5 rounded-card font-medium text-sm text-white"
                  style={{ background: "var(--accent-brand)" }}
                >
                  Fazer upgrade para {p.nome}
                </button>
              ) : (
                <p className="mt-auto py-2.5 text-xs text-center text-dim">Tudo deste plano já está no seu</p>
              )}
            </div>
          );
        })}
      </div>

      <section className="bg-panel border border-border rounded-card p-5 overflow-x-auto">
        <h2 className="font-display text-lg mb-3">Comparação de funcionalidades</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-dim font-mono">
              <th className="py-2 pr-3 font-normal">funcionalidade</th>
              {planos.map((p) => (
                <th key={p.id} className="py-2 px-3 font-normal text-center">
                  {p.nome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recursos.map((r) => (
              <tr key={r} className="border-t border-border">
                <td className="py-2 pr-3">{LABEL_RECURSO[r]}</td>
                {planos.map((p) => (
                  <td key={p.id} className="py-2 px-3 text-center">
                    {p.recursos.includes(r) ? (
                      <span style={{ color: "var(--accent-good)" }}>✓</span>
                    ) : (
                      <span className="text-dim">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="text-xs text-dim">
        Upgrade aqui é só demonstração: em produção o plano vem do contrato do cliente. Para voltar a um plano menor,
        use o seletor de plano no topo.
      </p>
    </div>
  );
}
