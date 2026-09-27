"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCliente } from "@/components/ClienteProvider";
import { ORDEM_PLANOS, PLANOS, type PlanoId } from "@/lib/plans";
import { NotificationBell } from "@/components/NotificationBell";

const ABAS = [
  { href: "/dashboard", label: "Painel" },
  { href: "/carga", label: "Carga flexível" },
  { href: "/economia", label: "Economia" },
  { href: "/recomendacoes", label: "Recomendações" },
  { href: "/notificacoes", label: "Notificações" },
  { href: "/perfil", label: "Perfil" },
  { href: "/planos", label: "Planos" },
  // /verificacao existe e funciona, mas fica fora do menu de propósito: é tela de conferência
  // técnica dos números da API, acessada só por URL direta.
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { plano, setPlano, usuario } = useCliente();
  const [agora, setAgora] = useState<Date | null>(null);

  useEffect(() => {
    setAgora(new Date());
    const id = setInterval(() => setAgora(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div data-theme="operacao" className="min-h-screen bg-bg text-text font-body">
      <div className="max-w-7xl mx-auto px-4 py-4 md:px-8">
        <header className="mb-4 flex items-start justify-between flex-wrap gap-3">
          <div>
            <Link href="/dashboard" className="font-display font-extrabold text-2xl">
              Predicta
            </Link>
            <p className="text-xs text-dim mt-0.5">
              <Link href="/perfil" className="hover:text-text transition-colors">
                {usuario.nomeFantasia} · {usuario.unidade}
              </Link>
            </p>
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

        <nav className="flex gap-1 border-b border-border mb-4 overflow-x-auto" aria-label="Seções">
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

        <footer className="text-xs text-dim text-center pt-4 mt-4 border-t border-border">
          Predicta · Hackathon COPPE IA 2026 · tarifa dinâmica experimental, não é fatura regulada
        </footer>
      </div>
    </div>
  );
}

// Estados comuns de carregamento e erro, usados por todas as páginas do painel.
export function EstadoSimulacao() {
  const { carregando, erro } = useCliente();
  return (
    <>
      {carregando && (
        <div className="bg-panel border border-border rounded-card p-5 text-sm text-dim mb-5">Carregando simulação…</div>
      )}
      {erro && !carregando && (
        <div className="bg-panel border border-alert rounded-card p-5 text-sm text-alert mb-5">{erro}</div>
      )}
    </>
  );
}
