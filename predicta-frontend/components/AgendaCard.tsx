"use client";

import Link from "next/link";
import { useCliente } from "@/components/ClienteProvider";
import { recomendacoesDaCarga } from "@/lib/recomendacoes";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Equipamentos que o cliente agendou na página Carga flexível, com a janela do dia.
export function AgendaCard() {
  const { carga, resultado } = useCliente();
  if (!resultado) return null;

  const recs = recomendacoesDaCarga(resultado.simulation.hourly, carga.itens).filter((r) => r.item.agendado && !r.rec.jaOtimo);
  const total = recs.reduce((s, r) => s + r.rec.economiaRs, 0);
  const pendentes = carga.itens.length - recs.length;

  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <p className="text-xs text-dim font-mono mb-1">Carga flexível</p>
          <h2 className="font-display text-lg">Agenda de hoje</h2>
        </div>
        <Link href="/carga" className="text-xs text-brand">
          {recs.length ? "editar agenda" : "agendar equipamentos"} →
        </Link>
      </div>
      {recs.length === 0 ? (
        <p className="text-sm text-dim">
          Nenhum equipamento agendado.{" "}
          {carga.itens.length > 0 ? `Você tem ${carga.itens.length} equipamentos flexíveis cadastrados.` : "Cadastre sua carga flexível."}
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {recs
              .sort((a, b) => a.rec.melhor.inicio.localeCompare(b.rec.melhor.inicio))
              .map(({ item, rec }) => (
                <li key={item.id} className="flex items-center justify-between gap-3 border border-border rounded-card px-3 py-2">
                  <span className="text-sm">
                    <span aria-hidden>{item.icone}</span> {item.nome}
                    {item.quantidade > 1 && <span className="text-dim"> · {item.quantidade} un.</span>}
                  </span>
                  <span className="text-sm font-mono whitespace-nowrap">
                    <b style={{ color: "var(--accent-good)" }}>
                      {rec.melhor.inicio}–{rec.melhor.fim}
                    </b>
                    <span className="text-dim text-xs"> · {brl(rec.economiaRs)}</span>
                  </span>
                </li>
              ))}
          </ul>
          <p className="text-xs text-dim mt-3">
            Economia agendada: <b style={{ color: "var(--accent-good)" }}>{brl(total)}/dia</b>
            {pendentes > 0 && ` · ${pendentes} equipamento${pendentes > 1 ? "s" : ""} sem agendamento`}
          </p>
        </>
      )}
    </div>
  );
}
