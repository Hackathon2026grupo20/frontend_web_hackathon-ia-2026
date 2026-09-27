"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCliente } from "@/components/ClienteProvider";
import { ReplayWindowPicker } from "@/components/ReplayWindowPicker";
import {
  distribuidorasDaRegiao,
  listarDistribuidoras,
  rotuloDistribuidora,
  type Distribuidora,
} from "@/lib/distribuidoras";
import { REGIONS_DEMO, findRegionPreset } from "@/lib/regions";
import { consumoDia, energiaFlexivelDia, pctFlexivel } from "@/lib/cargaFlexivel";
import type { CustomerType } from "@/types/api";

const num = (v: number, casas = 1) => v.toLocaleString("pt-BR", { maximumFractionDigits: casas });

const TIPOS: { id: CustomerType; nome: string }[] = [
  { id: "commercial", nome: "Comércio / serviços" },
  { id: "industrial_flat", nome: "Indústria" },
  { id: "residential", nome: "Residencial" },
];

export default function Perfil() {
  const { usuario, plano, distribuidora, setDistribuidora, preset, carga, setCarga, resultado, replayWindows, replayKey, setReplayKey } =
    useCliente();

  const [todas, setTodas] = useState<Distribuidora[]>([]);
  const [consumoKwh, setConsumoKwh] = useState(carga.monthly_kwh);
  const [tipo, setTipo] = useState<CustomerType>(carga.customer_type);

  // O catálogo de distribuidoras só é buscado aqui (é um GeoJSON grande) — o painel não precisa.
  useEffect(() => {
    let cancelado = false;
    listarDistribuidoras()
      .then((ds) => {
        if (!cancelado) setTodas(ds);
      })
      .catch(() => {
        // Sem a lista, os seletores de demonstração ficam vazios; o resto da página não depende dela.
      });
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    setConsumoKwh(carga.monthly_kwh);
    setTipo(carga.customer_type);
  }, [carga.monthly_kwh, carga.customer_type]);

  const daRegiao = distribuidorasDaRegiao(todas, distribuidora.regionId);
  const consumoAlterado = consumoKwh !== carga.monthly_kwh || tipo !== carga.customer_type;

  function trocarRegiao(regionId: string) {
    const lista = distribuidorasDaRegiao(todas, regionId);
    const padrao = findRegionPreset(regionId).cnpj;
    const escolhida = lista.find((d) => d.cnpj === padrao) ?? lista[0];
    setDistribuidora({ cnpj: escolhida?.cnpj ?? padrao, regionId });
  }

  const dist = resultado?.distributor ?? null;
  const regime = resultado?.profile ?? null;

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <div>
        <p className="text-xs text-dim font-mono mb-1">conta · plano {plano.nome}</p>
        <h1 className="font-display font-bold text-2xl">{usuario.nomeFantasia}</h1>
        <p className="text-sm text-dim mt-1">
          Os dados do contrato ficam aqui. O painel não pergunta distribuidora nem região — ele usa o que está nesta
          página.
        </p>
      </div>

      <section className="bg-panel border border-border rounded-card p-4">
        <h2 className="font-display text-lg mb-3">Identificação</h2>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
          <Item rotulo="Razão social" valor={usuario.razaoSocial} />
          <Item rotulo="Nome fantasia" valor={usuario.nomeFantasia} />
          <Item rotulo="CNPJ" valor={`${usuario.cnpj} (fictício)`} mono />
          <Item rotulo="Segmento" valor={usuario.segmento} />
          <Item rotulo="Unidade" valor={usuario.unidade} />
          <Item rotulo="Endereço" valor={`${usuario.endereco} — ${usuario.cidade}/${usuario.uf}`} />
          <Item rotulo="Responsável" valor={`${usuario.responsavel.nome} · ${usuario.responsavel.cargo}`} />
          <Item rotulo="Contato" valor={usuario.responsavel.email} mono />
          <Item rotulo="Cliente desde" valor={usuario.clienteDesde} />
        </dl>
      </section>

      <section className="bg-panel border border-border rounded-card p-4">
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
          <h2 className="font-display text-lg">Contrato de energia</h2>
          <span className="text-xs text-dim font-mono">da API · GET /catalog/profiles/</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border border-border rounded-card p-3">
            <p className="text-xs text-dim font-mono mb-2">Distribuidora</p>
            {dist ? (
              <dl className="grid gap-y-1.5 text-sm">
                <Item rotulo="Sigla" valor={dist.sigla ?? "—"} destaque />
                <Item rotulo="Razão social" valor={dist.razao_social ?? "—"} />
                <Item rotulo="CNPJ" valor={dist.cnpj ?? distribuidora.cnpj} mono />
                <Item rotulo="UF / subsistema" valor={`${dist.uf ?? "—"} · ${dist.subsystem_id ?? distribuidora.regionId}`} />
                {dist.num_unidades_consumidoras !== undefined && (
                  <Item rotulo="Unidades consumidoras" valor={num(dist.num_unidades_consumidoras, 0)} />
                )}
              </dl>
            ) : (
              <p className="text-sm text-dim">Consultando a API…</p>
            )}
          </div>

          <div className="border border-border rounded-card p-3">
            <p className="text-xs text-dim font-mono mb-2">Regime tarifário</p>
            {regime ? (
              <dl className="grid gap-y-1.5 text-sm">
                <Item rotulo="Perfil ANEEL" valor={regime.label} destaque />
                <Item rotulo="Subgrupo / modalidade" valor={`${regime.subgroup} · ${regime.modality}`} />
                <Item rotulo="Classe" valor={regime.customer_class} />
                <Item rotulo="TE + TUSD" valor={`R$ ${regime.base_te_rs_kwh.toFixed(5)} + R$ ${regime.base_tusd_rs_kwh.toFixed(5)}`} mono />
                <Item rotulo="Tarifa-base" valor={`R$ ${regime.base_total_rs_kwh.toFixed(5)}/kWh`} mono destaque />
                <Item rotulo="Vigência" valor={`${regime.valid_from} → ${regime.valid_to}`} mono />
              </dl>
            ) : (
              <p className="text-sm text-dim">
                Sem perfil tarifário vigente para este CNPJ — o backend não tem tarifa processada para esta
                distribuidora.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-panel border border-border rounded-card p-4">
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
          <h2 className="font-display text-lg">Consumo contratado</h2>
          <Link href="/carga" className="text-xs text-brand">
            editar equipamentos flexíveis →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-xl mb-4">
          <label className="block">
            <span className="block text-xs text-dim mb-1">Consumo mensal (kWh)</span>
            <input
              type="number"
              min={1}
              step={100}
              value={consumoKwh}
              onChange={(e) => setConsumoKwh(Math.max(1, Number(e.target.value) || 1))}
              className="w-full bg-panel2 border border-border rounded-card px-3 py-2 text-sm text-text"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-dim mb-1">Tipo de operação</span>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as CustomerType)}
              className="w-full bg-panel2 border border-border rounded-card px-3 py-2 text-sm text-text"
            >
              {TIPOS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </label>
        </div>

        {consumoAlterado && (
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => setCarga({ ...carga, monthly_kwh: consumoKwh, customer_type: tipo })}
              className="px-4 py-2 rounded-card text-sm font-medium text-white"
              style={{ background: "var(--accent-brand)" }}
            >
              Salvar e recalcular
            </button>
            <button
              type="button"
              onClick={() => {
                setConsumoKwh(carga.monthly_kwh);
                setTipo(carga.customer_type);
              }}
              className="text-sm text-dim hover:text-text"
            >
              Descartar
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Mini rotulo="Consumo por dia" valor={`${num(consumoDia(carga), 0)} kWh`} />
          <Mini rotulo="Energia flexível/dia" valor={`${num(energiaFlexivelDia(carga), 0)} kWh`} />
          <Mini rotulo="Parcela flexível" valor={`${num(pctFlexivel(carga))}%`} destaque />
          <Mini rotulo="Equipamentos" valor={`${carga.itens.length}`} />
        </div>
        <p className="text-xs text-dim mt-3">
          A parcela flexível não é digitada: sai da soma dos equipamentos que você marcou como deslocáveis em{" "}
          <Link href="/carga" className="text-brand underline">
            Carga flexível
          </Link>
          . É esse percentual que vai no pedido de simulação e define a economia.
        </p>
      </section>

      <section className="bg-panel border border-border rounded-card p-4">
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
          <h2 className="font-display text-lg">Assinatura</h2>
          <Link href="/planos" className="text-xs text-brand">
            comparar planos →
          </Link>
        </div>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
          <Item rotulo="Plano" valor={`${plano.nome} · ${plano.porte}`} destaque />
          <Item rotulo="Perfil de cliente" valor={plano.publico} />
          <Item rotulo="Unidades" valor={plano.unidades} />
          <Item
            rotulo="Equipamentos flexíveis"
            valor={plano.cargasFlexiveis === Infinity ? "ilimitados" : `até ${plano.cargasFlexiveis}`}
          />
          <Item rotulo="Avisos" valor={plano.canaisAviso} />
        </dl>
      </section>

      <section className="border border-dashed border-border rounded-card p-4">
        <p className="text-xs text-dim font-mono mb-1">só na demonstração</p>
        <h2 className="font-display text-lg mb-1">Trocar o contrato simulado</h2>
        <p className="text-xs text-dim mb-4">
          Em produção a distribuidora vem do cadastro e não é editável pelo cliente. Aqui fica aberto para testar
          outras concessionárias e outros dias do histórico.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <label className="block">
            <span className="block text-xs text-dim mb-1">Subsistema</span>
            <select
              value={distribuidora.regionId}
              onChange={(e) => trocarRegiao(e.target.value)}
              className="w-full bg-panel2 border border-border rounded-card px-3 py-2 text-sm text-text"
            >
              {REGIONS_DEMO.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs text-dim mb-1">
              Distribuidora {daRegiao.length > 0 && <span className="font-mono">({daRegiao.length} na região)</span>}
            </span>
            <select
              value={distribuidora.cnpj}
              onChange={(e) => setDistribuidora({ cnpj: e.target.value, regionId: distribuidora.regionId })}
              disabled={daRegiao.length === 0}
              className="w-full bg-panel2 border border-border rounded-card px-3 py-2 text-sm text-text disabled:opacity-50"
            >
              {daRegiao.length === 0 ? (
                <option value={distribuidora.cnpj}>{preset.distributorLabel} (catálogo não carregado)</option>
              ) : (
                <>
                  <optgroup label="Concessionárias">
                    {daRegiao
                      .filter((d) => d.concessionaria)
                      .map((d) => (
                        <option key={d.cnpj} value={d.cnpj}>
                          {rotuloDistribuidora(d)}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Permissionárias (cooperativas)">
                    {daRegiao
                      .filter((d) => !d.concessionaria)
                      .map((d) => (
                        <option key={d.cnpj} value={d.cnpj}>
                          {rotuloDistribuidora(d)}
                        </option>
                      ))}
                  </optgroup>
                </>
              )}
            </select>
          </label>
        </div>

        <ReplayWindowPicker windows={replayWindows} replayKey={replayKey} onChange={setReplayKey} />
      </section>
    </div>
  );
}

function Item({ rotulo, valor, mono, destaque }: { rotulo: string; valor: string; mono?: boolean; destaque?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-dim">{rotulo}</dt>
      <dd className={`${mono ? "font-mono text-xs" : "text-sm"} ${destaque ? "font-medium" : ""} mt-0.5`}>{valor}</dd>
    </div>
  );
}

function Mini({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className="border border-border rounded-card p-3">
      <p className="text-xs text-dim font-mono mb-1">{rotulo}</p>
      <p className="font-display text-lg" style={destaque ? { color: "var(--accent-good)" } : undefined}>
        {valor}
      </p>
    </div>
  );
}
