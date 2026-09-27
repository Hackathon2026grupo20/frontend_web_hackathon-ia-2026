"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCliente } from "@/components/ClienteProvider";
import { TAREFAS } from "@/lib/equipamentos";
import { proximoPlano } from "@/lib/plans";
import { recomendacoesDaCarga } from "@/lib/recomendacoes";
import {
  LIMITE_PCT_FLEXIVEL,
  consumoDia,
  energiaDiaKwh,
  energiaFlexivelDia,
  itemDoCatalogo,
  pctFlexivel,
  type CargaConfig,
  type ItemCarga,
} from "@/lib/cargaFlexivel";
import type { CustomerType } from "@/types/api";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (v: number, casas = 1) => v.toLocaleString("pt-BR", { maximumFractionDigits: casas });
const hh = (h: number) => `${String(h).padStart(2, "0")}h`;

const TIPOS: { id: CustomerType; nome: string }[] = [
  { id: "commercial", nome: "Comércio / serviços" },
  { id: "industrial_flat", nome: "Indústria" },
  { id: "residential", nome: "Residencial" },
];

export default function CargaFlexivel() {
  const { plano, carga, setCarga, resultado, carregando } = useCliente();
  const [rascunho, setRascunho] = useState<CargaConfig>(carga);
  const [novo, setNovo] = useState(TAREFAS[0].id);

  // Quando a carga salva muda (troca de plano, agendamento), o rascunho acompanha.
  useEffect(() => setRascunho(carga), [carga]);

  const alterado = JSON.stringify(rascunho) !== JSON.stringify(carga);
  const limite = plano.cargasFlexiveis;
  const noLimite = rascunho.itens.length >= limite;
  const upgrade = proximoPlano(plano, (p) => p.cargasFlexiveis > limite);
  const pct = pctFlexivel(rascunho);
  const pctBruto = consumoDia(rascunho) > 0 ? (100 * energiaFlexivelDia(rascunho)) / consumoDia(rascunho) : 0;

  function mudarItem(id: string, parcial: Partial<ItemCarga>) {
    setRascunho({ ...rascunho, itens: rascunho.itens.map((i) => (i.id === id ? { ...i, ...parcial } : i)) });
  }

  function adicionar() {
    if (noLimite) return;
    const base =
      novo === "personalizado"
        ? { ...itemDoCatalogo(TAREFAS[0]), icone: "⚙️", nome: "Equipamento personalizado", potenciaKw: 5, horasPorDia: 2, janela: [0, 24] as [number, number], inicioHabitual: 18 }
        : itemDoCatalogo(TAREFAS.find((t) => t.id === novo)!);
    setRascunho({ ...rascunho, itens: [...rascunho.itens, base] });
  }

  function alternarAgenda(id: string) {
    setCarga({ ...carga, itens: carga.itens.map((i) => (i.id === id ? { ...i, agendado: !i.agendado } : i)) });
  }

  // Agenda calculada sobre a carga SALVA e a simulação atual
  const recs = resultado ? recomendacoesDaCarga(resultado.simulation.hourly, carga.itens) : [];
  const economiaAgendada = recs.filter((r) => r.item.agendado && !r.rec.jaOtimo).reduce((s, r) => s + r.rec.economiaRs, 0);

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      <div>
        <p className="text-xs text-dim font-mono mb-1">sua operação · plano {plano.nome}</p>
        <h1 className="font-display font-bold text-2xl">Carga flexível</h1>
        <p className="text-sm text-dim mt-1">
          Cadastre o que pode rodar em outro horário sem prejudicar a operação. A Predicta calcula a melhor janela do dia
          para cada equipamento e você agenda.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Resumo rotulo="Consumo por dia" valor={`${num(consumoDia(rascunho), 0)} kWh`} />
        <Resumo rotulo="Energia flexível por dia" valor={`${num(energiaFlexivelDia(rascunho), 0)} kWh`} />
        <Resumo rotulo="Parcela flexível" valor={`${num(pct)}%`} destaque />
        <Resumo rotulo="Equipamentos" valor={`${rascunho.itens.length}${limite === Infinity ? "" : ` de ${limite}`}`} />
      </div>
      {pctBruto > LIMITE_PCT_FLEXIVEL && (
        <p className="text-xs" style={{ color: "var(--accent-alert)" }}>
          A carga cadastrada passa de {LIMITE_PCT_FLEXIVEL}% do consumo diário ({num(pctBruto)}%). A simulação usa no máximo{" "}
          {LIMITE_PCT_FLEXIVEL}% — confira o consumo mensal ou as potências.
        </p>
      )}

      {/* Passo 1: consumo */}
      <section className="bg-panel border border-border rounded-card p-5">
        <p className="text-xs text-dim font-mono mb-1">Passo 1</p>
        <h2 className="font-display text-lg mb-4">Seu consumo</h2>
        <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
          <Campo rotulo="Consumo mensal (kWh)">
            <input
              type="number"
              min={1}
              step={100}
              value={rascunho.monthly_kwh}
              onChange={(e) => setRascunho({ ...rascunho, monthly_kwh: Math.max(1, Number(e.target.value) || 1) })}
              className={INPUT}
            />
          </Campo>
          <Campo rotulo="Tipo de operação">
            <select
              value={rascunho.customer_type}
              onChange={(e) => setRascunho({ ...rascunho, customer_type: e.target.value as CustomerType })}
              className={INPUT}
            >
              {TIPOS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </Campo>
        </div>
      </section>

      {/* Passo 2: equipamentos */}
      <section className="bg-panel border border-border rounded-card p-5">
        <p className="text-xs text-dim font-mono mb-1">Passo 2</p>
        <h2 className="font-display text-lg mb-4">Equipamentos flexíveis</h2>

        <div className="flex flex-col gap-3">
          {rascunho.itens.map((i) => (
            <div key={i.id} className="border border-border rounded-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl" aria-hidden>
                  {i.icone}
                </span>
                <input value={i.nome} onChange={(e) => mudarItem(i.id, { nome: e.target.value })} className={`${INPUT} flex-1 font-medium`} aria-label="Nome do equipamento" />
                <span className="text-xs text-dim font-mono whitespace-nowrap">{num(energiaDiaKwh(i), 0)} kWh/dia</span>
                <button
                  type="button"
                  onClick={() => setRascunho({ ...rascunho, itens: rascunho.itens.filter((x) => x.id !== i.id) })}
                  className="text-dim hover:text-alert text-lg px-2"
                  aria-label={`Remover ${i.nome}`}
                  title="Remover"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <Campo rotulo="Potência (kW)">
                  <input type="number" min={0.1} step={0.1} value={i.potenciaKw} onChange={(e) => mudarItem(i.id, { potenciaKw: Math.max(0.1, Number(e.target.value) || 0.1) })} className={INPUT} />
                </Campo>
                <Campo rotulo="Quantidade">
                  <input type="number" min={1} step={1} value={i.quantidade} onChange={(e) => mudarItem(i.id, { quantidade: Math.max(1, Math.round(Number(e.target.value) || 1)) })} className={INPUT} />
                </Campo>
                <Campo rotulo="Horas por dia">
                  <input type="number" min={1} max={24} step={1} value={i.horasPorDia} onChange={(e) => mudarItem(i.id, { horasPorDia: Math.min(24, Math.max(1, Math.round(Number(e.target.value) || 1))) })} className={INPUT} />
                </Campo>
                <Campo rotulo="Pode rodar das">
                  <HoraSelect valor={i.janela[0]} max={23} onChange={(v) => mudarItem(i.id, { janela: [v, Math.max(v + 1, i.janela[1])] })} />
                </Campo>
                <Campo rotulo="até">
                  <HoraSelect valor={i.janela[1]} min={1} max={24} onChange={(v) => mudarItem(i.id, { janela: [Math.min(i.janela[0], v - 1), v] })} />
                </Campo>
                <Campo rotulo="Hoje liga às">
                  <HoraSelect valor={i.inicioHabitual} max={23} onChange={(v) => mudarItem(i.id, { inicioHabitual: v })} />
                </Campo>
              </div>
              {i.horasPorDia > i.janela[1] - i.janela[0] && (
                <p className="text-xs mt-2" style={{ color: "var(--accent-alert)" }}>
                  A janela permitida ({hh(i.janela[0])}–{hh(i.janela[1])}) é menor que o tempo de funcionamento ({i.horasPorDia}h).
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-4">
          <select value={novo} onChange={(e) => setNovo(e.target.value)} className={INPUT} disabled={noLimite} aria-label="Equipamento para adicionar">
            {TAREFAS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icone} {t.nome}
              </option>
            ))}
            <option value="personalizado">⚙️ Personalizado…</option>
          </select>
          <button type="button" onClick={adicionar} disabled={noLimite} className="px-4 py-2 rounded-card text-sm border border-border hover:border-brand disabled:opacity-40">
            + Adicionar
          </button>
          {noLimite && upgrade && (
            <span className="text-xs text-dim">
              🔒 Limite de {limite} equipamentos do plano.{" "}
              <Link href="/planos" className="text-brand underline">
                Fazer upgrade para {upgrade.nome}
              </Link>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => setCarga(rascunho)}
            disabled={!alterado}
            className="px-5 py-2.5 rounded-card text-sm font-medium text-white disabled:opacity-40"
            style={{ background: "var(--accent-brand)" }}
          >
            Salvar e recalcular
          </button>
          {alterado ? (
            <>
              <button type="button" onClick={() => setRascunho(carga)} className="text-sm text-dim hover:text-text">
                Descartar
              </button>
              <span className="text-xs text-dim">alterações não salvas</span>
            </>
          ) : (
            <span className="text-xs text-dim">{carregando ? "recalculando…" : "tudo salvo"}</span>
          )}
        </div>
      </section>

      {/* Passo 3: agenda */}
      <section className="bg-panel border border-border rounded-card p-5">
        <div className="flex items-end justify-between flex-wrap gap-2 mb-4">
          <div>
            <p className="text-xs text-dim font-mono mb-1">Passo 3</p>
            <h2 className="font-display text-lg">Agenda do dia</h2>
            <p className="text-xs text-dim">Melhor janela para cada equipamento salvo, pela tarifa dinâmica simulada.</p>
          </div>
          {economiaAgendada > 0 && (
            <p className="text-sm">
              Agendado: <b style={{ color: "var(--accent-good)" }}>{brl(economiaAgendada)}/dia</b>
              <span className="text-dim"> · ≈ {brl(economiaAgendada * 30)}/mês</span>
            </p>
          )}
        </div>

        {alterado && (
          <p className="text-xs mb-3" style={{ color: "var(--accent-demand)" }}>
            Salve as alterações do Passo 2 para atualizar a agenda.
          </p>
        )}
        {!resultado ? (
          <p className="text-sm text-dim">{carregando ? "Carregando simulação…" : "Sem simulação disponível."}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {carga.itens.map((item) => {
              const r = recs.find((x) => x.item.id === item.id)?.rec;
              return (
                <div key={item.id} className="flex items-center justify-between gap-3 flex-wrap border border-border rounded-card px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl" aria-hidden>
                      {item.icone}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {item.nome}
                        {item.quantidade > 1 && <span className="text-dim"> · {item.quantidade} un.</span>}
                      </p>
                      {!r ? (
                        <p className="text-xs" style={{ color: "var(--accent-alert)" }}>
                          Não cabe na janela permitida — ajuste as horas.
                        </p>
                      ) : r.jaOtimo ? (
                        <p className="text-xs text-dim">Horário atual ({r.habitual.inicio}–{r.habitual.fim}) já é o mais barato.</p>
                      ) : (
                        <p className="text-xs">
                          <b style={{ color: "var(--accent-good)" }}>{r.melhor.inicio}–{r.melhor.fim}</b>
                          <span className="text-dim">
                            {" "}
                            em vez de {r.habitual.inicio}–{r.habitual.fim} · −{r.economiaPct.toFixed(1)}% · {brl(r.economiaRs)}/dia
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  {r && !r.jaOtimo && (
                    <button
                      type="button"
                      onClick={() => alternarAgenda(item.id)}
                      disabled={alterado}
                      title={alterado ? "Salve as alterações antes de agendar" : undefined}
                      className="px-3 py-1.5 rounded-card text-sm font-medium border disabled:opacity-40"
                      style={
                        item.agendado
                          ? { borderColor: "var(--accent-good)", color: "var(--accent-good)" }
                          : { background: "var(--accent-brand)", borderColor: "var(--accent-brand)", color: "#fff" }
                      }
                    >
                      {item.agendado ? `✓ Agendado ${r.melhor.inicio}` : `Agendar ${r.melhor.inicio}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs text-dim mt-3">
          Agendar registra o plano do dia no painel. O acionamento automático dos equipamentos depende de integração com a
          automação da unidade (evolução futura).
        </p>
      </section>
    </div>
  );
}

const INPUT = "w-full bg-panel2 border border-border rounded-card px-3 py-2 text-sm text-text";

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-dim mb-1">{rotulo}</span>
      {children}
    </label>
  );
}

function HoraSelect({ valor, onChange, min = 0, max = 23 }: { valor: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <select value={valor} onChange={(e) => onChange(Number(e.target.value))} className={INPUT}>
      {Array.from({ length: max - min + 1 }, (_, k) => min + k).map((h) => (
        <option key={h} value={h}>
          {hh(h)}
        </option>
      ))}
    </select>
  );
}

function Resumo({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className="bg-panel border border-border rounded-card p-4">
      <p className="text-xs text-dim font-mono mb-1">{rotulo}</p>
      <p className="font-display text-xl" style={destaque ? { color: "var(--accent-good)" } : undefined}>
        {valor}
      </p>
    </div>
  );
}
