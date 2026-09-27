"use client";

import Link from "next/link";
import { useCliente } from "@/components/ClienteProvider";

// Quem está olhando o painel. Ficava aqui o seletor de região — agora a região vem do contrato
// do cliente (/perfil), então este espaço identifica a empresa em vez de pedir uma escolha.
export function ClienteCard() {
  const { usuario, plano } = useCliente();

  return (
    <div className="bg-panel border border-border rounded-card p-4">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-xs text-dim font-mono">Cliente</p>
        <Link href="/perfil" className="text-xs text-brand whitespace-nowrap">
          ver perfil →
        </Link>
      </div>
      <h2 className="font-display font-bold text-lg leading-tight">{usuario.nomeFantasia}</h2>
      <p className="text-xs text-dim mt-1">{usuario.segmento}</p>
      <p className="text-xs text-dim mt-2">
        {usuario.unidade} · {usuario.cidade}/{usuario.uf}
      </p>
      <p className="text-xs text-dim mt-2 pt-2 border-t border-border">
        Plano <span className="font-medium text-text">{plano.nome}</span>
      </p>
    </div>
  );
}
