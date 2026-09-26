"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCliente } from "@/components/ClienteProvider";
import { ORDEM_PLANOS, PLANOS, type PlanoId } from "@/lib/plans";
import { USE_MOCK } from "@/lib/simulation";
import { NotificationBell } from "@/components/NotificationBell";

const ABAS = [
  { href: "/dashboard", label: "Painel" },
  { href: "/carga", label: "Carga flexível" },
  { href: "/economia", label: "Economia" },
  { href: "/recomendacoes", label: "Recomendações" },
  { href: "/notificacoes", label: "Notificações" },
  { href: "/planos", label: "Planos" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { plano, setPlano } = useCliente();
  const [agora, setAgora] = useState<Date | null>(null);

  useEffect(() => {
    setAgora(new Date());
    const id = setInterval(() => setAgora(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div data-theme="operacao" className="min-h-screen bg-bg text-text font-body">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
        <header className="mb-6 flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-dim font-mono mb-1">
              {USE_MOCK ? "dados de exemplo (sem API)" : "dados da API Predicta"}
            </p>
            <Link href="/dashboard" className="font-display font-extrabold text-2xl">
              Predicta
            </Link>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {agora && (
              <p className="text-xs text-dim font-mono capitalize hidden md:block">
                {agora.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" })} ·{" "}
                {agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
            {/* Troca de plano só para demonstração — em produção vem do contrato do cliente */}
            <label className="flex items-center gap-2 border border-border rounded-card px-3 py-1.5 text-sm">
              <span className="text-dim text-xs font-mono">plano</span>
              <select
                value={plano.id}
                onChange={(e) => setPlano(e.target.value as PlanoId)}
                className="bg-transparent text-text font-medium outline-none"
                aria-label="Plano do cliente (demonstração)"
              >
                {ORDEM_PLANOS.map((id) => (
                  <option key={id} value={id} className="bg-panel2">
                    {PLANOS[id].nome} · {PLANOS[id].porte}
                  </option>
                ))}
              </select>
            </label>
            <NotificationBell />
          </div>
        </header>

        <nav className="flex gap-1 border-b border-border mb-6 overflow-x-auto" aria-label="Seções">
          {ABAS.map((a) => {
            const ativa = pathname === a.href;
            return (
              <Link
                key={a.href}
                href={a.href}
                className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  ativa ? "border-brand text-text font-medium" : "border-transparent text-dim hover:text-text"
                }`}
              >
                {a.label}
              </Link>
            );
          })}
        </nav>

        {children}

        <footer className="text-xs text-dim text-center pt-8 mt-8 border-t border-border">
          Predicta · Hackathon COPPE IA 2026 · tarifa dinâmica experimental, não é fatura regulada
        </footer>
      </div>
    </div>
  );
}

// Estados comuns de carregamento/erro/aviso de mock, usados por todas as páginas do painel.
export function EstadoSimulacao() {
  const { carregando, erro } = useCliente();
  return (
    <>
      {USE_MOCK && (
        <div className="bg-panel border border-border rounded-card p-4 text-xs text-dim mb-5">
          Modo de exemplo (NEXT_PUBLIC_USE_MOCK=1): curvas sintéticas geradas no navegador, sem chamada à API.
          Servem só para visualizar a interface.
        </div>
      )}
      {carregando && (
        <div className="bg-panel border border-border rounded-card p-5 text-sm text-dim mb-5">Carregando simulação…</div>
      )}
      {erro && !carregando && (
        <div className="bg-panel border border-alert rounded-card p-5 text-sm text-alert mb-5">{erro}</div>
      )}
    </>
  );
}
