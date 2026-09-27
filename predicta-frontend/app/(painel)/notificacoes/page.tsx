"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCliente } from "@/components/ClienteProvider";
import { useNotificacoes } from "@/components/useNotificacoes";
import { ORDEM_PLANOS, PLANOS, type PlanoId } from "@/lib/plans";
import {
  CANAIS,
  LIMITES,
  TIPOS,
  horariosDeEntrega,
  labelIntervalo,
  type Canal,
  type PreferenciasNotificacao,
  type TipoNotificacao,
} from "@/lib/notificacoes";

const TODOS_INTERVALOS = [1, 3, 6, 12, 24];

// Menor plano que libera algo, segundo os limites de notificação
function planoQueLibera(teste: (id: PlanoId) => boolean) {
  const id = ORDEM_PLANOS.find(teste) ?? "grande";
  return PLANOS[id];
}

export default function Notificacoes() {
  const { plano, prefs, setPrefs, resultado } = useCliente();
  const { entregas } = useNotificacoes();
  const limites = LIMITES[plano.id];
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (!salvo) return;
    const t = setTimeout(() => setSalvo(false), 1500);
    return () => clearTimeout(t);
  }, [salvo]);

  function atualizar(parcial: Partial<PreferenciasNotificacao>) {
    setPrefs({ ...prefs, ...parcial });
    setSalvo(true);
  }

  function alternarTipo(t: TipoNotificacao) {
    atualizar({ tipos: prefs.tipos.includes(t) ? prefs.tipos.filter((x) => x !== t) : [...prefs.tipos, t] });
  }

  function alternarCanal(c: Canal) {
    atualizar({ canais: prefs.canais.includes(c) ? prefs.canais.filter((x) => x !== c) : [...prefs.canais, c] });
  }

  const horas = resultado?.simulation.hourly ?? [];
  const horarios = horariosDeEntrega(horas, prefs);
  const totalAvisos = entregas.reduce((s, e) => s + e.avisos.length, 0);
  const planoHorario = planoQueLibera((id) => LIMITES[id].intervaloMinH === 1);
  const tiposLiberados = TIPOS.filter((t) => limites.tipos.includes(t.id));
  const canaisAtivos = CANAIS.filter((c) => prefs.canais.includes(c.id) && limites.canais.includes(c.id));

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs text-dim font-mono mb-1">preferências · plano {plano.nome}</p>
          <h1 className="font-display font-bold text-2xl">Notificações</h1>
          <p className="text-sm text-dim mt-1">Escolha com que frequência, sobre o quê e por onde você quer ser avisado.</p>
        </div>
        <span
          className="text-xs font-mono"
          style={{ color: "var(--accent-good)", opacity: salvo ? 1 : 0, transition: "opacity .3s" }}
        >
          ✓ salvo
        </span>
      </div>

      {/* Estado atual em uma linha: o que está valendo agora, sem precisar ler as 4 seções */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Chip rotulo="Frequência" valor={labelIntervalo(prefs.intervaloH).replace("a cada ", "").replace("1 vez por dia", "1×/dia")} />
        <Chip rotulo="Assuntos" valor={`${prefs.tipos.filter((t) => limites.tipos.includes(t)).length} de ${tiposLiberados.length}`} />
        <Chip rotulo="Canais" valor={canaisAtivos.length ? canaisAtivos.map((c) => c.nome).join(", ") : "nenhum"} />
        <Chip
          rotulo="Silêncio"
          valor={
            limites.silencio && prefs.silencio.ativo
              ? `${String(prefs.silencio.inicio).padStart(2, "0")}h–${String(prefs.silencio.fim).padStart(2, "0")}h`
              : "desligado"
          }
        />
        <Chip rotulo="Hoje" valor={`${totalAvisos} ${totalAvisos === 1 ? "aviso" : "avisos"}`} destaque />
      </div>

      {/* 1 · frequência */}
      <section className="bg-panel border border-border rounded-card p-4">
        <h2 className="font-display text-lg mb-1">1 · Com que frequência</h2>
        <p className="text-sm text-dim mb-4">
          De quanto em quanto tempo os avisos chegam. Seu plano permite a partir de{" "}
          <b className="text-text">{labelIntervalo(limites.intervaloMinH).replace("a cada ", "")}</b>.
        </p>

        <div className="flex gap-2 flex-wrap mb-4">
          {TODOS_INTERVALOS.map((h) => {
            const liberado = h >= limites.intervaloMinH;
            const ativo = prefs.intervaloH === h;
            const libera = planoQueLibera((id) => LIMITES[id].intervaloMinH <= h);
            return (
              <button
                key={h}
                type="button"
                disabled={!liberado}
                onClick={() => atualizar({ intervaloH: h })}
                title={liberado ? undefined : `Disponível no plano ${libera.nome}`}
                className="px-4 py-2 rounded-card text-sm border transition-colors disabled:cursor-not-allowed"
                style={
                  ativo
                    ? { background: "var(--accent-brand)", borderColor: "var(--accent-brand)", color: "#fff" }
                    : liberado
                      ? { borderColor: "var(--border)" }
                      : { borderColor: "var(--border)", opacity: 0.45 }
                }
              >
                {!liberado && "🔒 "}
                {h === 24 ? "1x por dia" : `${h}h`}
              </button>
            );
          })}
        </div>

        <details className="text-sm">
          <summary className="text-xs text-dim cursor-pointer hover:text-text">
            Ajuste fino — hoje: {labelIntervalo(prefs.intervaloH)}
          </summary>
          <div className="mt-2">
            <input
              type="range"
              min={limites.intervaloMinH}
              max={24}
              step={1}
              value={prefs.intervaloH}
              onChange={(e) => atualizar({ intervaloH: Number(e.target.value) })}
              className="w-full accent-[var(--accent-brand)]"
              aria-label="Intervalo entre notificações, em horas"
            />
            <div className="flex justify-between text-[11px] text-dim font-mono">
              <span>{limites.intervaloMinH}h</span>
              <span>24h</span>
            </div>
          </div>
        </details>

        {limites.intervaloMinH > 1 && (
          <p className="text-xs text-dim mt-3">
            🔒 Avisos de hora em hora no plano{" "}
            <Link href="/planos" className="text-brand underline">
              {planoHorario.nome}
            </Link>
            .
          </p>
        )}

        {/* Prévia: o que chega em cada horário, não só a lista de horários */}
        <div className="border-t border-border mt-4 pt-3">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
            <p className="text-xs text-dim font-mono">o que você receberia no dia simulado</p>
            <p className="text-xs text-dim">
              {horarios.length} {horarios.length === 1 ? "janela de envio" : "janelas de envio"} ·{" "}
              {entregas.length} com conteúdo
              {limites.maxPorDia !== Infinity && ` · limite ${limites.maxPorDia} avisos/dia`}
            </p>
          </div>

          {entregas.length === 0 ? (
            <p className="text-sm text-dim">
              Nenhum aviso cairia nas suas escolhas hoje. Ative mais assuntos na seção 2 para ver o efeito.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {entregas.map((e) => (
                <li key={e.slotIdx} className="flex gap-3 border border-border rounded-card px-3 py-2">
                  <span className="text-xs font-mono text-dim mt-0.5 w-10 flex-shrink-0">{e.horario}</span>
                  <div className="min-w-0">
                    {e.avisos.map((a) => (
                      <p key={a.id} className="text-sm leading-snug">
                        {a.titulo}
                      </p>
                    ))}
                    {e.adiadaPorSilencio && <p className="text-[11px] text-dim mt-0.5">adiado pelo horário de silêncio</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 2 · assuntos */}
      <section className="bg-panel border border-border rounded-card p-4">
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
          <h2 className="font-display text-lg">2 · Sobre o que avisar</h2>
          <span className="text-xs text-dim font-mono">
            {prefs.tipos.filter((t) => limites.tipos.includes(t)).length} de {tiposLiberados.length} ativos
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {TIPOS.map((t) => {
            const liberado = limites.tipos.includes(t.id);
            const libera = planoQueLibera((id) => LIMITES[id].tipos.includes(t.id));
            return (
              <Opcao
                key={t.id}
                titulo={t.nome}
                descricao={liberado ? t.descricao : `Disponível no plano ${libera.nome}`}
                marcado={prefs.tipos.includes(t.id)}
                liberado={liberado}
                onChange={() => alternarTipo(t.id)}
              />
            );
          })}
        </div>
      </section>

      {/* 3 · canais */}
      <section className="bg-panel border border-border rounded-card p-4">
        <h2 className="font-display text-lg mb-3">3 · Por onde receber</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {CANAIS.map((c) => {
            const liberado = limites.canais.includes(c.id);
            const libera = planoQueLibera((id) => LIMITES[id].canais.includes(c.id));
            return (
              <Opcao
                key={c.id}
                titulo={c.nome}
                descricao={
                  liberado
                    ? c.id === "app"
                      ? "Aparece no sino 🔔 do topo"
                      : "Envio real ainda não integrado (protótipo)"
                    : `Disponível no plano ${libera.nome}`
                }
                marcado={prefs.canais.includes(c.id)}
                liberado={liberado}
                onChange={() => alternarCanal(c.id)}
              />
            );
          })}
        </div>
      </section>

      {/* 4 · silêncio */}
      <section className="bg-panel border border-border rounded-card p-4">
        <h2 className="font-display text-lg mb-1">4 · Horário de silêncio</h2>
        {limites.silencio ? (
          <>
            <p className="text-sm text-dim mb-4">Avisos que cairiam nesse horário chegam logo depois que ele acabar.</p>
            <div className="flex items-center gap-3 flex-wrap text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={prefs.silencio.ativo}
                  onChange={(e) => atualizar({ silencio: { ...prefs.silencio, ativo: e.target.checked } })}
                  className="accent-[var(--accent-brand)] w-4 h-4"
                />
                Ativar
              </label>
              <span className="text-dim">das</span>
              <HoraSelect
                valor={prefs.silencio.inicio}
                desativado={!prefs.silencio.ativo}
                onChange={(v) => atualizar({ silencio: { ...prefs.silencio, inicio: v } })}
              />
              <span className="text-dim">às</span>
              <HoraSelect
                valor={prefs.silencio.fim}
                desativado={!prefs.silencio.ativo}
                onChange={(v) => atualizar({ silencio: { ...prefs.silencio, fim: v } })}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-dim">
            🔒 Disponível a partir do plano{" "}
            <Link href="/planos" className="text-brand underline">
              {planoQueLibera((id) => LIMITES[id].silencio).nome}
            </Link>
            .
          </p>
        )}
      </section>

      <p className="text-xs text-dim">
        Preferências salvas neste navegador, separadas por plano. Em produção ficam na conta do cliente.
      </p>
    </div>
  );
}

function Chip({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <span className="border border-border rounded-card px-3 py-1.5">
      <span className="text-dim">{rotulo}: </span>
      <b style={destaque ? { color: "var(--accent-good)" } : undefined}>{valor}</b>
    </span>
  );
}

function Opcao({
  titulo,
  descricao,
  marcado,
  liberado,
  onChange,
}: {
  titulo: string;
  descricao: string;
  marcado: boolean;
  liberado: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 border rounded-card px-3 py-2.5 ${
        liberado ? "cursor-pointer hover:border-brand" : "opacity-50 cursor-not-allowed border-border"
      }`}
      style={liberado && marcado ? { borderColor: "var(--accent-brand)" } : { borderColor: "var(--border)" }}
    >
      <input
        type="checkbox"
        checked={liberado && marcado}
        disabled={!liberado}
        onChange={onChange}
        className="mt-1 accent-[var(--accent-brand)] w-4 h-4"
      />
      <span>
        <span className="block text-sm font-medium">
          {!liberado && "🔒 "}
          {titulo}
        </span>
        <span className="block text-xs text-dim">{descricao}</span>
      </span>
    </label>
  );
}

function HoraSelect({ valor, desativado, onChange }: { valor: number; desativado: boolean; onChange: (v: number) => void }) {
  return (
    <select
      value={valor}
      disabled={desativado}
      onChange={(e) => onChange(Number(e.target.value))}
      className="bg-panel2 border border-border rounded-card px-2 py-1.5 text-text disabled:opacity-50"
    >
      {Array.from({ length: 24 }, (_, h) => (
        <option key={h} value={h}>
          {String(h).padStart(2, "0")}h
        </option>
      ))}
    </select>
  );
}
