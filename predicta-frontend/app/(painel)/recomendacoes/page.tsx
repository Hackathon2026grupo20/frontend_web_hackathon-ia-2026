"use client";

import Link from "next/link";
import { EstadoSimulacao } from "@/components/AppShell";
import { useCliente } from "@/components/ClienteProvider";
import { FeatureGate } from "@/components/FeatureGate";
import { dataLocal, horaLocal } from "@/lib/format";
import { recomendacoesDaCarga, recomendarPreClimatizacao } from "@/lib/recomendacoes";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Recomendacoes() {
  const { perfil, carga, resultado, carregando, erro } = useCliente();
  const sim = resultado?.simulation;

  if (!sim || carregando || erro) return <EstadoSimulacao />;

  const tipo = perfil.customer_type;
  // Recomendações sobre os equipamentos que o próprio cliente cadastrou em Carga flexível
  const visiveis = recomendacoesDaCarga(sim.hourly, carga.itens)
    .map((x) => x.rec)
    .sort((a, b) => b.economiaRs - a.economiaRs);
  const pre = recomendarPreClimatizacao(sim.hourly, tipo);

  // 3 horas mais baratas e mais caras do dia
  const ordenadas = [...sim.hourly].sort((a, b) => a.dynamic_rs_kwh - b.dynamic_rs_kwh);
  const baratas = ordenadas.slice(0, 3);
  const caras = ordenadas.slice(-3).reverse();
  const base = sim.reference_tariff_mean_rs_kwh;
  const pct = (t: number) => `${t >= base ? "+" : ""}${(100 * (t / base - 1)).toFixed(1)}%`;

  return (
    <div className="flex flex-col gap-5">
      <EstadoSimulacao />

      <div>
        <p className="text-xs text-dim font-mono mb-1">janela simulada {dataLocal(sim.hourly[0])}</p>
        <h1 className="font-display font-bold text-2xl">Recomendações de horário</h1>
        <p className="text-sm text-dim mt-1">
          Com base na tarifa dinâmica hora a hora: quando ligar cada equipamento para pagar menos pela mesma energia.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <HorasChips titulo="Horas mais baratas" cor="var(--accent-good)" horas={baratas.map((h) => ({ hora: horaLocal(h), pct: pct(h.dynamic_rs_kwh) }))} />
        <HorasChips titulo="Horas mais caras" cor="var(--accent-alert)" horas={caras.map((h) => ({ hora: horaLocal(h), pct: pct(h.dynamic_rs_kwh) }))} />
      </div>

      <FeatureGate recurso="preClimatizacao">
        <section className="bg-panel border border-border rounded-card p-5">
          <p className="text-xs text-dim font-mono mb-1">Pré-climatização</p>
          {pre ? (
            <>
              <h2 className="font-display text-lg mb-1">
                ❄️ Ligue o {pre.equipamento} às <span style={{ color: "var(--accent-good)" }}>{pre.ligarAs}</span> em vez
                de às <span style={{ color: "var(--accent-alert)" }}>{pre.emVezDe}</span>
              </h2>
              <p className="text-sm text-dim">
                A tarifa às {pre.ligarAs} está {pre.diferencaPct.toFixed(0)}% mais barata do que às {pre.emVezDe}. Resfrie o
                ambiente antes e reduza a potência quando o pico chegar — o conforto é o mesmo e cada hora de uso adiantada
                economiza cerca de {brl(pre.economiaPorHoraRs)}.
              </p>
            </>
          ) : (
            <p className="text-sm text-dim">Hoje a tarifa não sobe o bastante no horário comercial para compensar pré-climatizar.</p>
          )}
        </section>
      </FeatureGate>

      <section className="flex flex-col gap-3">
        <div>
          <p className="text-xs text-dim font-mono mb-1">Sua carga flexível</p>
          <h2 className="font-display text-lg">Melhor horário para cada equipamento</h2>
          <p className="text-xs text-dim">
            Com base nos equipamentos que você cadastrou.{" "}
            <Link href="/carga" className="text-brand">
              Editar e agendar →
            </Link>
          </p>
        </div>
        {visiveis.length === 0 && (
          <p className="text-sm text-dim">
            Nenhum equipamento flexível cadastrado.{" "}
            <Link href="/carga" className="text-brand underline">
              Cadastrar carga flexível
            </Link>
          </p>
        )}
        {visiveis.map((r) => (
          <div key={r.tarefa.id} className="bg-panel border border-border rounded-card p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden>
                {r.tarefa.icone}
              </span>
              <div>
                <p className="font-medium">{r.tarefa.nome}</p>
                <p className="text-xs text-dim">
                  {r.tarefa.duracaoH}h a ~{r.tarefa.potenciaKw.toLocaleString("pt-BR")} kW
                </p>
                {r.jaOtimo ? (
                  <p className="text-sm mt-1">
                    Seu horário habitual ({r.habitual.inicio}–{r.habitual.fim}) já está entre os mais baratos. 👍
                  </p>
                ) : (
                  <p className="text-sm mt-1">
                    Faça entre <b style={{ color: "var(--accent-good)" }}>{r.melhor.inicio}–{r.melhor.fim}</b>
                    <span className="text-dim"> em vez de {r.habitual.inicio}–{r.habitual.fim}</span>
                  </p>
                )}
              </div>
            </div>
            {!r.jaOtimo && (
              <div className="text-right">
                <p className="font-display text-lg" style={{ color: "var(--accent-good)" }}>
                  −{r.economiaPct.toFixed(1)}%
                </p>
                <p className="text-xs text-dim">
                  {brl(r.economiaRs)}/dia · ≈ {brl(r.economiaRs * 30)}/mês
                </p>
              </div>
            )}
          </div>
        ))}
      </section>

      <p className="text-xs text-dim">
        Economia calculada sobre a tarifa dinâmica simulada; o
        valor real depende dos equipamentos e da operação da sua unidade.
      </p>
    </div>
  );
}

function HorasChips({ titulo, cor, horas }: { titulo: string; cor: string; horas: { hora: string; pct: string }[] }) {
  return (
    <div className="bg-panel border border-border rounded-card p-4">
      <p className="text-xs text-dim font-mono mb-2">{titulo}</p>
      <div className="flex gap-2 flex-wrap">
        {horas.map((h) => (
          <span key={h.hora} className="border border-border rounded-card px-3 py-1.5 text-sm">
            <b>{h.hora}</b> <span style={{ color: cor }}>{h.pct}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
