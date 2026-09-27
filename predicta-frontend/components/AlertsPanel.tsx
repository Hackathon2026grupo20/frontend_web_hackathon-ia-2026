"use client";

import Link from "next/link";
import { useCliente } from "@/components/ClienteProvider";
import { useNotificacoes } from "@/components/useNotificacoes";
import { labelIntervalo, type AvisoComTipo } from "@/lib/notificacoes";
import type { NivelAviso } from "@/lib/recomendacoes";

const COR: Record<NivelAviso, string> = {
  alerta: "var(--accent-alert)",
  oportunidade: "var(--accent-good)",
  info: "var(--accent-demand)",
};

const ICONE: Record<NivelAviso, string> = { alerta: "▲", oportunidade: "▼", info: "●" };

// Avisos do dia segundo as preferências do cliente (tipos, frequência e limite do plano).
export function AlertsPanel() {
  const { prefs } = useCliente();
  const { entregas, limites } = useNotificacoes();
  const avisos: (AvisoComTipo & { horario: string })[] = entregas.flatMap((e) =>
    e.avisos.map((a) => ({ ...a, horario: e.horario }))
  );

  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <p className="text-xs text-dim font-mono mb-1">Avisos de hoje</p>
          <h2 className="font-display text-lg">O que fazer agora</h2>
        </div>
        <span className="text-xs text-dim font-mono">
          {labelIntervalo(prefs.intervaloH)} ·{" "}
          {limites.maxPorDia === Infinity ? "sem limite" : `até ${limites.maxPorDia}/dia`} ·{" "}
          <Link href="/notificacoes" className="text-brand">
            configurar
          </Link>
        </span>
      </div>

      {avisos.length === 0 ? (
        <p className="text-sm text-dim">
          Sem avisos para a janela simulada com as suas preferências.{" "}
          <Link href="/notificacoes" className="text-brand underline">
            Ajustar tipos de aviso
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {avisos.map((a) => (
            <li key={a.id} className="flex gap-3 border border-border rounded-card px-3 py-2.5">
              <span className="text-sm mt-0.5" style={{ color: COR[a.nivel] }} aria-hidden>
                {ICONE[a.nivel]}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">{a.titulo}</p>
                <p className="text-xs text-dim">{a.detalhe}</p>
              </div>
              <span className="text-[11px] text-dim font-mono whitespace-nowrap">enviado às {a.horario}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
