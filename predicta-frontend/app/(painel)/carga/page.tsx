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

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (v: number, casas = 1) => v.toLocaleString("pt-BR", { maximumFractionDigits: casas });
const hh = (h: number) => `${String(h).padStart(2, "0")}h`;
// Rótulos de hora da API vêm como "03h" / "19/09 21h" — pega só a hora.
const horaDoLabel = (label: string) => Number(label.slice(-3, -1));

export default function CargaFlexivel() {
  const { plano, carga, setCarga, resultado, carregando } = useCliente();
  const [rascunho, setRascunho] = useState<CargaConfig>(carga);
  const [novo, setNovo] = useState(TAREFAS[0].id);
  const [abertos, setAbertos] = useState<string[]>([]);

  // Quando a carga salva muda (agendamento, edição no perfil), o rascunho acompanha.
  useEffect(() => setRascunho(carga), [carga]);

  const alterado = JSON.stringify(rascunho) !== JSON.stringify(carga);
  const limite = plano.cargasFlexiveis;
  const noLimite = rascunho.itens.length >= limite;
  const upgrade = proximoPlano(plano, (p) => p.cargasFlexiveis > limite);
  const pct = pctFlexivel(rascunho);
  const pctBruto = consumoDia(rascunho) > 0 ? (100 * energiaFlexivelDia(rascunho)) / consumoDia(rascunho) : 0;
  const flexTotal = energiaFlexivelDia(rascunho);

  function mudarItem(id: string, parcial: Partial<ItemCarga>) {
    setRascunho({ ...rascunho, itens: rascunho.itens.map((i) => (i.id === id ? { ...i, ...parcial } : i)) });
  }

  function adicionar() {
    if (noLimite) return;
    const base =
      novo === "personalizado"
        ? {
            ...itemDoCatalogo(TAREFAS[0]),
            icone: "⚙️",
            nome: "Equipamento personalizado",
            potenciaKw: 5,
            horasPorDia: 2,
            janela: [0, 24] as [number, number],
            inicioHabitual: 18,
          }
        : itemDoCatalogo(TAREFAS.find((t) => t.id === novo)!);
    setRascunho({ ...rascunho, itens: [...rascunho.itens, base] });
    setAbertos((a) => [...a, base.id]); // novo item já entra aberto para configurar
  }

  function alternarAgenda(id: string) {
    setCarga({ ...carga, itens: carga.itens.map((i) => (i.id === id ? { ...i, agendado: !i.agendado } : i)) });
  }

  // Agenda calculada sobre a carga SALVA e a simulação atual
  const recs = resultado ? recomendacoesDaCarga(resultado.simulation.hourly, carga.itens) : [];
  const agendados = recs.filter((r) => r.item.agendado && !r.rec.jaOtimo);
  const economiaAgendada = agendados.reduce((s, r) => s + r.rec.economiaRs, 0);
  const potencialTotal = recs.filter((r) => !r.rec.jaOtimo).reduce((s, r) => s + r.rec.economiaRs, 0);

  return (
    <div className="flex flex-col gap-4 max-w-5xl">
      <div>
        <p className="text-xs text-dim font-mono mb-1">sua operação · plano {plano.nome}</p>
        <h1 className="font-display font-bold text-2xl">Carga flexível</h1>
        <p className="text-sm text-dim mt-1">
          Cadastre o que pode rodar em outro horário sem prejudicar a operação. A Predicta calcula a melhor janela do
          dia para cada equipamento e você agenda.
        </p>
      </div>

      {/* Contexto: o consumo total é do cadastro (perfil); aqui se define só a parte flexível dele */}
      <div className="flex items-center justify-between flex-wrap gap-3 border border-border rounded-card px-4 py-3 text-sm">
        <p className="text-dim">
          Consumo do cadastro: <b className="text-text">{num(consumoDia(rascunho), 0)} kWh/dia</b>
          <span className="text-dim"> ({num(rascunho.monthly_kwh, 0)} kWh/mês)</span>
        </p>
        <Link href="/perfil" className="text-xs text-brand">
          alterar consumo no perfil →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Resumo rotulo="Energia flexível/dia" valor={`${num(flexTotal, 0)} kWh`} />
        <Resumo rotulo="Parcela flexível" valor={`${num(pct)}%`} destaque />
        <Resumo rotulo="Equipamentos" valor={`${rascunho.itens.length}${limite === Infinity ? "" : ` de ${limite}`}`} />
        <Resumo
          rotulo="Economia possível"
          valor={resultado ? `${brl(potencialTotal)}/dia` : "—"}
          detalhe={agendados.length ? `${brl(economiaAgendada)} já agendado` : "nada agendado ainda"}
        />
      </div>

      {pctBruto > LIMITE_PCT_FLEXIVEL && (
        <p className="text-xs" style={{ color: "var(--accent-alert)" }}>
          A carga cadastrada passa de {LIMITE_PCT_FLEXIVEL}% do consumo diário ({num(pctBruto)}%). A simulação usa no
          máximo {LIMITE_PCT_FLEXIVEL}% — confira o consumo mensal no perfil ou as potências abaixo.
        </p>
      )}

      {/* 1 · equipamentos */}
      <section className="bg-panel border border-border rounded-card p-4">
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
          <h2 className="font-display text-lg">1 · Equipamentos flexíveis</h2>
          {alterado && (
            <span className="text-xs font-mono" style={{ color: "var(--accent-demand)" }}>
              alterações não salvas
            </span>
          )}
        </div>
        <p className="text-xs text-dim mb-4">
          Cada linha mostra quanto o equipamento pesa na carga flexível do dia. Abra para ajustar potência, duração e a
          janela em que ele pode rodar.
        </p>

        <div className="flex flex-col gap-2">
          {rascunho.itens.map((i) => {
            const aberto = abertos.includes(i.id);
            const kwh = energiaDiaKwh(i);
            const fatia = flexTotal > 0 ? (100 * kwh) / flexTotal : 0;
            const janelaCurta = i.horasPorDia > i.janela[1] - i.janela[0];
            return (
              <div key={i.id} className="border border-border rounded-card">
                {/* Resumo clicável */}
                <div className="flex items-center gap-3 px-3 py-2.5 flex-wrap">
                  <span className="text-lg" aria-hidden>
                    {i.icone}
                  </span>
                  <div className="flex-1 min-w-[12rem]">
                    <p className="text-sm font-medium">
                      {i.nome}
                      {i.quantidade > 1 && <span className="text-dim"> · {i.quantidade} un.</span>}
                    </p>
                    <p className="text-xs text-dim">
                      {num(i.potenciaKw)} kW × {i.horasPorDia}h · pode rodar {hh(i.janela[0])}–{hh(i.janela[1])} · hoje
                      liga às {hh(i.inicioHabitual)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">{num(kwh, 0)} kWh</p>
                    <p className="text-[11px] text-dim">{num(fatia, 0)}% da carga flexível</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAbertos((a) => (aberto ? a.filter((x) => x !== i.id) : [...a, i.id]))}
                    className="text-xs text-dim hover:text-text border border-border rounded-card px-2.5 py-1"
                    aria-expanded={aberto}
                  >
                    {aberto ? "Fechar" : "Editar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRascunho({ ...rascunho, itens: rascunho.itens.filter((x) => x.id !== i.id) })}
                    className="text-dim hover:text-alert text-lg px-1"
                    aria-label={`Remover ${i.nome}`}
                    title="Remover"
                  >
                    ×
                  </button>
                </div>

                <FaixaJanela janela={i.janela} inicio={i.inicioHabitual} duracao={i.horasPorDia} />

                {janelaCurta && (
                  <p className="text-xs px-3 pb-2" style={{ color: "var(--accent-alert)" }}>
                    A janela permitida ({hh(i.janela[0])}–{hh(i.janela[1])}) é menor que o tempo de funcionamento (
                    {i.horasPorDia}h).
                  </p>
                )}

                {aberto && (
                  <div className="px-3 pb-3 pt-1 border-t border-border">
                    <Campo rotulo="Nome">
                      <input
                        value={i.nome}
                        onChange={(e) => mudarItem(i.id, { nome: e.target.value })}
                        className={INPUT}
                        aria-label="Nome do equipamento"
                      />
                    </Campo>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      <Campo rotulo="Potência (kW)" ajuda="de uma unidade">
                        <input
                          type="number"
                          min={0.1}
                          step={0.1}
                          value={i.potenciaKw}
                          onChange={(e) => mudarItem(i.id, { potenciaKw: Math.max(0.1, Number(e.target.value) || 0.1) })}
                          className={INPUT}
                        />
                      </Campo>
                      <Campo rotulo="Quantidade">
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={i.quantidade}
                          onChange={(e) =>
                            mudarItem(i.id, { quantidade: Math.max(1, Math.round(Number(e.target.value) || 1)) })
                          }
                          className={INPUT}
                        />
                      </Campo>
                      <Campo rotulo="Horas por dia" ajuda="funcionamento contínuo">
                        <input
                          type="number"
                          min={1}
                          max={24}
                          step={1}
                          value={i.horasPorDia}
                          onChange={(e) =>
                            mudarItem(i.id, {
                              horasPorDia: Math.min(24, Math.max(1, Math.round(Number(e.target.value) || 1))),
                            })
                          }
                          className={INPUT}
                        />
                      </Campo>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      <Campo rotulo="Pode rodar das" ajuda="restrição da operação">
                        <HoraSelect
                          valor={i.janela[0]}
                          max={23}
                          onChange={(v) => mudarItem(i.id, { janela: [v, Math.max(v + 1, i.janela[1])] })}
                        />
                      </Campo>
                      <Campo rotulo="até">
                        <HoraSelect
                          valor={i.janela[1]}
                          min={1}
                          max={24}
                          onChange={(v) => mudarItem(i.id, { janela: [Math.min(i.janela[0], v - 1), v] })}
                        />
                      </Campo>
                      <Campo rotulo="Hoje liga às" ajuda="horário de hábito, sem otimizar">
                        <HoraSelect valor={i.inicioHabitual} max={23} onChange={(v) => mudarItem(i.id, { inicioHabitual: v })} />
                      </Campo>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {rascunho.itens.length === 0 && (
            <p className="text-sm text-dim py-2">
              Nenhum equipamento flexível cadastrado. Adicione abaixo para a Predicta calcular onde deslocar carga.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-4">
          <select
            value={novo}
            onChange={(e) => setNovo(e.target.value)}
            className={INPUT}
            disabled={noLimite}
            aria-label="Equipamento para adicionar"
          >
            {TAREFAS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icone} {t.nome}
              </option>
            ))}
            <option value="personalizado">⚙️ Personalizado…</option>
          </select>
          <button
            type="button"
            onClick={adicionar}
            disabled={noLimite}
            className="px-4 py-2 rounded-card text-sm border border-border hover:border-brand disabled:opacity-40"
          >
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

        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
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
            <button type="button" onClick={() => setRascunho(carga)} className="text-sm text-dim hover:text-text">
              Descartar
            </button>
          ) : (
            <span className="text-xs text-dim">{carregando ? "recalculando…" : "tudo salvo"}</span>
          )}
        </div>
      </section>

      {/* 2 · agenda */}
      <section className="bg-panel border border-border rounded-card p-4">
        <div className="flex items-end justify-between flex-wrap gap-2 mb-1">
          <h2 className="font-display text-lg">2 · Agenda do dia</h2>
          {economiaAgendada > 0 && (
            <p className="text-sm">
              Agendado: <b style={{ color: "var(--accent-good)" }}>{brl(economiaAgendada)}/dia</b>
              <span className="text-dim"> · ≈ {brl(economiaAgendada * 30)}/mês</span>
            </p>
          )}
        </div>
        <p className="text-xs text-dim mb-4">
          Melhor janela de cada equipamento salvo, pela tarifa dinâmica do dia simulado no painel.
        </p>

        {alterado && (
          <p className="text-xs mb-3" style={{ color: "var(--accent-demand)" }}>
            Salve as alterações acima para atualizar a agenda.
          </p>
        )}
        {!resultado ? (
          <p className="text-sm text-dim">{carregando ? "Carregando simulação…" : "Sem simulação disponível."}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {carga.itens.map((item) => {
              const r = recs.find((x) => x.item.id === item.id)?.rec;
              return (
                <div key={item.id} className="border border-border rounded-card">
                  <div className="flex items-center justify-between gap-3 flex-wrap px-4 py-3">
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
                            Não cabe na janela permitida — ajuste as horas acima.
                          </p>
                        ) : r.jaOtimo ? (
                          <p className="text-xs text-dim">
                            Horário atual ({r.habitual.inicio}–{r.habitual.fim}) já é o mais barato do dia.
                          </p>
                        ) : (
                          <p className="text-xs">
                            <b style={{ color: "var(--accent-good)" }}>
                              {r.melhor.inicio}–{r.melhor.fim}
                            </b>
                            <span className="text-dim">
                              {" "}
                              em vez de {r.habitual.inicio}–{r.habitual.fim} · −{r.economiaPct.toFixed(1)}% ·{" "}
                              {brl(r.economiaRs)}/dia
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
                  {r && (
                    <FaixaJanela
                      janela={item.janela}
                      inicio={item.inicioHabitual}
                      duracao={item.horasPorDia}
                      recomendado={horaDoLabel(r.melhor.inicio)}
                      agendado={item.agendado}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs text-dim mt-3">
          Agendar registra o plano do dia no painel. O acionamento automático dos equipamentos depende de integração
          com a automação da unidade (evolução futura).
        </p>
      </section>
    </div>
  );
}

const INPUT = "w-full bg-panel2 border border-border rounded-card px-3 py-2 text-sm text-text";

// Fita de 24h: mostra a janela permitida, onde o equipamento liga hoje e, na agenda, a janela
// recomendada. Serve para ver de relance se a restrição de operação deixa espaço para deslocar.
function FaixaJanela({
  janela,
  inicio,
  duracao,
  recomendado,
  agendado,
}: {
  janela: [number, number];
  inicio: number;
  duracao: number;
  recomendado?: number;
  agendado?: boolean;
}) {
  const ocupa = (h: number, ini: number) => {
    for (let k = 0; k < duracao; k++) if ((ini + k) % 24 === h) return true;
    return false;
  };
  return (
    <div className="px-3 pb-2.5">
      <div className="flex gap-px" aria-hidden>
        {Array.from({ length: 24 }, (_, h) => {
          const permitido = h >= janela[0] && h < janela[1];
          const noHabitual = ocupa(h, inicio);
          const noMelhor = recomendado !== undefined && ocupa(h, recomendado);
          const cor = noMelhor
            ? "var(--accent-good)"
            : noHabitual
              ? "var(--accent-demand)"
              : permitido
                ? "var(--border)"
                : "transparent";
          return (
            <div
              key={h}
              className="flex-1 rounded-sm"
              style={{ height: 8, background: cor, opacity: noMelhor || noHabitual ? 1 : permitido ? 0.9 : 0.25 }}
              title={`${hh(h)}${permitido ? "" : " · fora da janela permitida"}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-dim font-mono mt-0.5">
        <span>00h</span>
        <span className="flex gap-3">
          <span style={{ color: "var(--accent-demand)" }}>■ hoje</span>
          {recomendado !== undefined && (
            <span style={{ color: "var(--accent-good)" }}>■ {agendado ? "agendado" : "recomendado"}</span>
          )}
          <span className="text-dim">■ janela permitida</span>
        </span>
        <span>23h</span>
      </div>
    </div>
  );
}

function Campo({ rotulo, ajuda, children }: { rotulo: string; ajuda?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-dim mb-1">
        {rotulo}
        {ajuda && <span className="text-dim/70"> · {ajuda}</span>}
      </span>
      {children}
    </label>
  );
}

function HoraSelect({
  valor,
  onChange,
  min = 0,
  max = 23,
}: {
  valor: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
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

function Resumo({ rotulo, valor, detalhe, destaque }: { rotulo: string; valor: string; detalhe?: string; destaque?: boolean }) {
  return (
    <div className="bg-panel border border-border rounded-card p-4">
      <p className="text-xs text-dim font-mono mb-1">{rotulo}</p>
      <p className="font-display text-xl" style={destaque ? { color: "var(--accent-good)" } : undefined}>
        {valor}
      </p>
      {detalhe && <p className="text-[11px] text-dim mt-1">{detalhe}</p>}
    </div>
  );
}
