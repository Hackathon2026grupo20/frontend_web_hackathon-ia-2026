"use client";

import Link from "next/link";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { EstadoSimulacao } from "@/components/AppShell";
import { useCliente } from "@/components/ClienteProvider";
import { FeatureGate } from "@/components/FeatureGate";
import { calcularEquivalencias } from "@/lib/equipamentos";
import { proximoPlano } from "@/lib/plans";
import { dataLocal, horaLocal } from "@/lib/format";
import { baixarRelatorioCsv } from "@/lib/relatorio";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (v: number, casas = 1) => v.toLocaleString("pt-BR", { maximumFractionDigits: casas });

export default function Economia() {
  const { plano, perfil, resultado, carregando, erro } = useCliente();
  const sim = resultado?.simulation;

  if (!sim || carregando || erro) return <EstadoSimulacao />;

  const opt = sim.optimization;
  const economiaDia = opt.potential_savings_24h_rs ?? 0;
  const economiaMes = opt.potential_savings_month_rs ?? economiaDia * 30.4375;
  const economiaPct = opt.potential_savings_pct ?? 0;
  const deslocadoKwh = opt.actually_shifted_kwh ?? 0;
  const flexivelKwh = opt.flexible_energy_kwh ?? 0;

  // kW médio aliviado nas horas em que o consumo foi reduzido
  const reducoes = sim.hourly
    .map((h) => h.consumption_kwh - h.optimized_consumption_kwh)
    .filter((r) => r > 1e-6);
  const kwAliviado = reducoes.length ? reducoes.reduce((s, r) => s + r, 0) / reducoes.length : 0;

  // Dicionário: quanta energia a economia do mês "compra" na tarifa-base
  const kwhEquivalente = economiaMes / sim.reference_tariff_mean_rs_kwh;
  const equivalencias = calcularEquivalencias(kwhEquivalente);
  const visiveis = equivalencias.slice(0, plano.equivalencias);
  const ocultas = equivalencias.length - visiveis.length;
  const upgrade = proximoPlano(plano, (p) => p.equivalencias > plano.equivalencias);

  const periodo = sim.hourly.length ? dataLocal(sim.hourly[0]) : "";
  const curva = sim.hourly.map((h) => ({
    hora: horaLocal(h),
    original: Number(h.consumption_kwh.toFixed(2)),
    otimizado: Number(h.optimized_consumption_kwh.toFixed(2)),
  }));

  return (
    <div className="flex flex-col gap-5">
      <EstadoSimulacao />

      <div>
        <p className="text-xs text-dim font-mono mb-1">
          janela simulada {periodo} · {num(perfil.monthly_kwh, 0)} kWh/mês · {num(perfil.flexible_pct)}% flexível ·{" "}
          <Link href="/carga" className="text-brand">
            editar carga
          </Link>
        </p>
        <h1 className="font-display font-bold text-2xl">Sua economia</h1>
        <p className="text-sm text-dim mt-1">
          Quanto você economiza deslocando a parte flexível do consumo para as horas mais baratas — sem consumir menos
          energia no total.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi rotulo="Economia no dia" valor={brl(economiaDia)} detalhe={`${num(economiaPct, 2)}% da conta do dia`} destaque />
        <Kpi rotulo="Projeção no mês" valor={brl(economiaMes)} detalhe="30 dias no mesmo padrão" destaque />
        <Kpi rotulo="Energia deslocada" valor={`${num(deslocadoKwh)} kWh`} detalhe={`de ${num(flexivelKwh)} kWh flexíveis/dia`} />
        <Kpi rotulo="Alívio no pico" valor={`${num(kwAliviado)} kW`} detalhe={`média em ${reducoes.length}h com carga reduzida`} />
      </div>

      <section className="bg-panel border border-border rounded-card p-5">
        <p className="text-xs text-dim font-mono mb-1">Dicionário da economia</p>
        <h2 className="font-display text-lg mb-1">Sua economia no mês equivale a…</h2>
        <p className="text-xs text-dim mb-4">
          {brl(economiaMes)} ÷ {brl(sim.reference_tariff_mean_rs_kwh)}/kWh (tarifa-base) ≈ {num(kwhEquivalente, 0)} kWh.
          Consumos de referência aproximados.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {visiveis.map((e) => (
            <div key={e.id} className="border border-border rounded-card p-4">
              <p className="text-2xl mb-2" aria-hidden>
                {e.icone}
              </p>
              <p className="font-display text-xl" style={{ color: "var(--accent-good)" }}>
                {e.unidade(e.quantidade)}
              </p>
              <p className="text-xs text-dim mt-1">{e.descricao}</p>
            </div>
          ))}
        </div>
        {ocultas > 0 && upgrade && (
          <p className="text-xs text-dim mt-3">
            🔒 Mais {ocultas} equivalências no{" "}
            <Link href="/planos" className="text-brand underline">
              plano {upgrade.nome}
            </Link>
            .
          </p>
        )}
      </section>

      <FeatureGate recurso="economiaDetalhada">
        <section className="bg-panel border border-border rounded-card p-5">
          <p className="text-xs text-dim font-mono mb-1">Detalhamento</p>
          <h2 className="font-display text-lg mb-4">Consumo original × otimizado (kWh por hora)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={curva} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="hora" tick={{ fontSize: 11, fill: "var(--text-dim)" }} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-dim)" }} />
              <Tooltip contentStyle={{ background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area dataKey="original" name="hábitos atuais" stroke="var(--text-dim)" fill="var(--text-dim)" fillOpacity={0.08} strokeDasharray="4 3" isAnimationActive={false} />
              <Area dataKey="otimizado" name="com deslocamento" stroke="var(--accent-good)" fill="var(--accent-good)" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
            <Custo rotulo="Tarifa-base (hábitos atuais)" valor={sim.reference_cost_24h_rs} />
            <Custo rotulo="Tarifa dinâmica (hábitos atuais)" valor={opt.original_dynamic_cost_24h_rs ?? sim.dynamic_cost_24h_rs} />
            <Custo rotulo="Tarifa dinâmica (com deslocamento)" valor={opt.optimized_dynamic_cost_24h_rs ?? sim.dynamic_cost_24h_rs} destaque />
          </div>
        </section>
      </FeatureGate>

      <FeatureGate recurso="exportarRelatorio">
        <section className="bg-panel border border-border rounded-card p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-dim font-mono mb-1">Relatório</p>
            <h2 className="font-display text-lg">Exportar as 24 horas (CSV)</h2>
            <p className="text-xs text-dim">Tarifa, consumo original e otimizado por hora, para o seu time de energia.</p>
          </div>
          <button
            onClick={() => baixarRelatorioCsv(sim, plano.nome)}
            className="px-4 py-2 rounded-card text-sm font-medium text-white"
            style={{ background: "var(--accent-brand)" }}
          >
            Baixar CSV
          </button>
        </section>
      </FeatureGate>

      <p className="text-xs text-dim">
        Estimativa sobre curva de consumo típica do plano e TE + TUSD volumétricas; não inclui tributos, bandeiras nem
        demanda contratada. Com medição real da sua unidade, os números passam a ser os seus.
      </p>
    </div>
  );
}

function Kpi({ rotulo, valor, detalhe, destaque }: { rotulo: string; valor: string; detalhe: string; destaque?: boolean }) {
  return (
    <div className="bg-panel border border-border rounded-card p-4">
      <p className="text-xs text-dim font-mono mb-1">{rotulo}</p>
      <p className="font-display text-2xl" style={destaque ? { color: "var(--accent-good)" } : undefined}>
        {valor}
      </p>
      <p className="text-xs text-dim mt-1">{detalhe}</p>
    </div>
  );
}

function Custo({ rotulo, valor, destaque }: { rotulo: string; valor: number; destaque?: boolean }) {
  return (
    <div className="border border-border rounded-card px-3 py-2">
      <p className="text-xs text-dim">{rotulo}</p>
      <p className="font-mono" style={destaque ? { color: "var(--accent-good)" } : undefined}>
        {brl(valor)}
      </p>
    </div>
  );
}
