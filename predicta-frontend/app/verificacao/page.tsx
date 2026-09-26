"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ForecastChart } from "@/components/ForecastChart";
import { TariffComparisonChart } from "@/components/TariffComparisonChart";
import { OptimizationSummary } from "@/components/OptimizationSummary";
import { ConsumptionShapeCheck } from "@/components/ConsumptionShapeCheck";
import { LoadShiftBar } from "@/components/LoadShiftBar";
import { ApiError, getCatalogProfiles, runSimulation } from "@/lib/api";
import { REGIONS_DEMO, findRegionPreset } from "@/lib/regions";
import { CUSTOMER_TYPES, FLEXIBLE_PCT_MAX, FLEXIBLE_PCT_MIN, MONTHLY_KWH_MIN, type CustomerType } from "@/lib/simulationChoices";
import type { CatalogProfilesResponse, SimulationRequest, SimulationResponse } from "@/types/api";

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="text-xs bg-panel2 border border-border rounded-card p-3 overflow-x-auto whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <h2 className="font-display font-bold text-lg mb-3">{title}</h2>
      {children}
    </div>
  );
}

export default function Verificacao() {
  const [regionId, setRegionId] = useState(REGIONS_DEMO[0].id);
  const preset = findRegionPreset(regionId);

  // Controles interativos — começam no default do preset, mas o usuário pode variar livremente
  // pra comparar diferentes perfis tarifários e tipos de uso contra o que está no Django.
  const [profileId, setProfileId] = useState(preset.request.profile);
  const [customerType, setCustomerType] = useState<CustomerType>("residential");
  const [monthlyKwh, setMonthlyKwh] = useState(preset.request.monthly_kwh);
  const [flexiblePct, setFlexiblePct] = useState(preset.request.flexible_pct);

  const [catalogo, setCatalogo] = useState<CatalogProfilesResponse | null>(null);
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true);
  const [erroCatalogo, setErroCatalogo] = useState<string | null>(null);

  const [simulacao, setSimulacao] = useState<SimulationResponse | null>(null);
  const [carregandoSim, setCarregandoSim] = useState(true);
  const [erroSim, setErroSim] = useState<string | null>(null);

  // Troca de região: busca o catálogo de perfis dessa distribuidora e reseta os controles pro
  // default do preset (o profile de outra distribuidora não existe aqui).
  useEffect(() => {
    let cancelado = false;
    setCarregandoCatalogo(true);
    setErroCatalogo(null);
    setProfileId(preset.request.profile);
    setCustomerType("residential");
    setMonthlyKwh(preset.request.monthly_kwh);
    setFlexiblePct(preset.request.flexible_pct);

    getCatalogProfiles(preset.request.cnpj, preset.request.region)
      .then((res) => {
        if (!cancelado) setCatalogo(res);
      })
      .catch((e) => {
        if (!cancelado) setErroCatalogo(e instanceof ApiError ? `${e.status}: ${e.message}` : "Falha ao consultar o catálogo.");
      })
      .finally(() => {
        if (!cancelado) setCarregandoCatalogo(false);
      });

    return () => {
      cancelado = true;
    };
  }, [regionId]);

  const request: SimulationRequest = {
    ...preset.request,
    profile: profileId,
    customer_type: customerType,
    monthly_kwh: monthlyKwh,
    flexible_pct: flexiblePct,
  };

  // Roda a simulação sempre que qualquer controle mudar.
  useEffect(() => {
    let cancelado = false;
    setCarregandoSim(true);
    setErroSim(null);
    runSimulation(request)
      .then((res) => {
        if (!cancelado) setSimulacao(res);
      })
      .catch((e) => {
        if (cancelado) return;
        setSimulacao(null);
        setErroSim(e instanceof ApiError ? `${e.status}: ${e.message}` : "Falha ao rodar a simulação.");
      })
      .finally(() => {
        if (!cancelado) setCarregandoSim(false);
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId, profileId, customerType, monthlyKwh, flexiblePct]);

  const perfilSelecionado = catalogo?.profiles.find((p) => p.id === profileId) ?? null;

  return (
    <div data-theme="operacao" className="min-h-screen bg-bg text-text font-body">
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
        <header className="mb-8 flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-dim font-mono mb-1">painel interativo · dados crus da API</p>
            <h1 className="font-display font-extrabold text-2xl">Verificação</h1>
          </div>
          <Link href="/dashboard" className="text-sm text-dim hover:text-text transition-colors">
            ← dashboard
          </Link>
        </header>

        <div className="bg-panel border border-border rounded-card p-5 mb-5 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1.5">Região / distribuidora</label>
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="w-full bg-panel2 border border-border rounded-card px-3 py-2 text-text"
            >
              {REGIONS_DEMO.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1.5">Perfil tarifário</label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              disabled={!catalogo || catalogo.profiles.length === 0}
              className="w-full bg-panel2 border border-border rounded-card px-3 py-2 text-text disabled:opacity-50"
            >
              {catalogo?.profiles.length ? (
                catalogo.profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} — R$ {p.base_total_rs_kwh.toFixed(5)}/kWh
                  </option>
                ))
              ) : (
                <option value={profileId}>{profileId}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1.5">Tipo de uso</label>
            <select
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value as CustomerType)}
              className="w-full bg-panel2 border border-border rounded-card px-3 py-2 text-text"
            >
              {CUSTOMER_TYPES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1.5">Consumo mensal (kWh)</label>
            <input
              type="number"
              min={MONTHLY_KWH_MIN}
              value={monthlyKwh}
              onChange={(e) => setMonthlyKwh(Number(e.target.value) || MONTHLY_KWH_MIN)}
              className="w-full bg-panel2 border border-border rounded-card px-3 py-2 text-text font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm mb-1.5">
              Carga flexível: <b>{flexiblePct}%</b>
            </label>
            <input
              type="range"
              min={FLEXIBLE_PCT_MIN}
              max={FLEXIBLE_PCT_MAX}
              value={flexiblePct}
              onChange={(e) => setFlexiblePct(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {erroCatalogo && (
          <div className="bg-panel border border-alert rounded-card p-5 text-sm text-alert mb-5">{erroCatalogo}</div>
        )}
        {erroSim && (
          <div className="bg-panel border border-alert rounded-card p-5 text-sm text-alert mb-5">{erroSim}</div>
        )}
        {(carregandoCatalogo || carregandoSim) && (
          <div className="bg-panel border border-border rounded-card p-5 text-sm text-dim mb-5">Consultando API…</div>
        )}

        <div className="flex flex-col gap-5">
          <Section title="1 · Request enviado (POST /api/v1/simulations/)">
            <JsonBlock data={request} />
          </Section>

          {catalogo && (
            <Section title="2 · Distribuidora">
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <p>
                  <span className="text-dim">Sigla:</span> <b>{catalogo.distributor.sigla}</b>
                </p>
                <p>
                  <span className="text-dim">Razão social:</span> {catalogo.distributor.razao_social}
                </p>
                <p>
                  <span className="text-dim">CNPJ:</span> <span className="font-mono">{catalogo.distributor.cnpj}</span>
                </p>
                <p>
                  <span className="text-dim">UF / Subsistema:</span> {catalogo.distributor.uf} /{" "}
                  {catalogo.distributor.subsystem_id}
                </p>
              </div>
            </Section>
          )}

          {perfilSelecionado && (
            <Section title="3 · Perfil tarifário selecionado">
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <p>
                  <span className="text-dim">Rótulo:</span> <b>{perfilSelecionado.label}</b>
                </p>
                <p>
                  <span className="text-dim">Subgrupo / Modalidade:</span> {perfilSelecionado.subgroup} /{" "}
                  {perfilSelecionado.modality}
                </p>
                <p>
                  <span className="text-dim">Classe:</span> {perfilSelecionado.customer_class}
                </p>
                <p>
                  <span className="text-dim">Vigência:</span> {perfilSelecionado.valid_from} →{" "}
                  {perfilSelecionado.valid_to}
                </p>
                <p>
                  <span className="text-dim">Tarifa TE:</span> R$ {perfilSelecionado.base_te_rs_kwh.toFixed(5)}/kWh
                </p>
                <p>
                  <span className="text-dim">Tarifa TUSD:</span> R${" "}
                  {perfilSelecionado.base_tusd_rs_kwh.toFixed(5)}/kWh
                </p>
                <p>
                  <span className="text-dim">Tarifa total base:</span>{" "}
                  <b>R$ {perfilSelecionado.base_total_rs_kwh.toFixed(5)}/kWh</b>
                </p>
              </div>
            </Section>
          )}

          {simulacao && (
            <>
              <Section title="4 · Consumo e custo (do retorno da simulação)">
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <p>
                    <span className="text-dim">Tipo de cliente confirmado:</span> {simulacao.customer.customer_type}
                  </p>
                  <p>
                    <span className="text-dim">Origem do perfil de consumo:</span> {simulacao.customer.profile_source}
                  </p>
                  <p>
                    <span className="text-dim">Consumo diário (calculado):</span>{" "}
                    <b>{simulacao.customer.daily_consumption_kwh.toFixed(2)} kWh</b>
                  </p>
                  <p>
                    <span className="text-dim">Janela simulada:</span> {simulacao.window.label}
                  </p>
                  <p>
                    <span className="text-dim">Custo referência (24h):</span> R${" "}
                    {simulacao.reference_cost_24h_rs.toFixed(2)}
                  </p>
                  <p>
                    <span className="text-dim">Custo dinâmico, sem mudar hábitos (24h):</span> R${" "}
                    {simulacao.dynamic_cost_24h_rs.toFixed(2)}
                  </p>
                  <p>
                    <span className="text-dim">Diferença (neutralidade tarifária):</span>{" "}
                    {simulacao.difference_pct.toFixed(2)}%
                  </p>
                </div>
                <p className="text-xs text-dim mt-3">
                  Esse difference_pct é a neutralidade tarifária (dinâmica vs. base, sem otimizar consumo) — fica
                  perto de 0% por design. A economia real de deslocar carga está na seção 5, abaixo.
                </p>
              </Section>

              <ForecastChart
                hourly={simulacao.hourly}
                displayTimezone={simulacao.display_timezone}
                janela={simulacao.window}
              />
              <TariffComparisonChart hourly={simulacao.hourly} differencePct={simulacao.difference_pct} />
              <OptimizationSummary optimization={simulacao.optimization} />
              <ConsumptionShapeCheck hourly={simulacao.hourly} monthlyKwh={monthlyKwh} customerType={customerType} />
              <LoadShiftBar hourly={simulacao.hourly} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
