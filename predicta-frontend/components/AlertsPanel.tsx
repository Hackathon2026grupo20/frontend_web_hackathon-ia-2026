"use client";

import { useState } from "react";
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

// Quantos avisos aparecem sem expandir — mantém o card num tamanho fixo mesmo em dias cheios.
const LIMITE_VISIVEL = 3;

// Avisos do dia segundo as preferências do cliente (tipos, frequência e limite do plano).
export function AlertsPanel() {
  const { prefs } = useCliente();
  const { entregas, limites } = useNotificacoes();
  const [expandido, setExpandido] = useState(false);
  const avisos: (AvisoComTipo & { horario: string })[] = entregas.flatMap((e) =>
    e.avisos.map((a) => ({ ...a, horario: e.horario }))
  );
  const ocultos = avisos.length - LIMITE_VISIVEL;
  const visiveis = expandido ? avisos : avisos.slice(0, LIMITE_VISIVEL);

  return (
    <div className="bg-panel border border-border rounded-card p-4">
      <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
        <div>
          <p className="text-xs text-dim font-mono mb-1">Avisos de hoje</p>
          <h2 className="font-display text-base">O que fazer agora</h2>
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
        <>
          <ul className="flex flex-col gap-1.5">
            {visiveis.map((a) => (
              <li key={a.id} className="flex gap-3 border border-border rounded-card px-3 py-2">
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
          {ocultos > 0 && (
            <button
              type="button"
              onClick={() => setExpandido((v) => !v)}
              className="w-full mt-2 text-xs text-dim hover:text-text transition-colors text-center py-1"
            >
              {expandido ? "Mostrar menos ▲" : `Ver mais ${ocultos} aviso${ocultos > 1 ? "s" : ""} ▼`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
