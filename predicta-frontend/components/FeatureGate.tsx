"use client";

import Link from "next/link";
import { useCliente } from "@/components/ClienteProvider";
import { LABEL_RECURSO, planoMinimo, temRecurso, type Recurso } from "@/lib/plans";

// Mostra o conteúdo se o plano atual tiver o recurso; senão, um cartão com cadeado e upgrade.
export function FeatureGate({ recurso, children }: { recurso: Recurso; children: React.ReactNode }) {
  const { plano } = useCliente();
  if (temRecurso(plano, recurso)) return <>{children}</>;
  return <Bloqueado recurso={recurso} />;
}

export function Bloqueado({ recurso, texto }: { recurso: Recurso; texto?: string }) {
  const min = planoMinimo(recurso);
  return (
    <div className="border border-dashed border-border rounded-card p-5 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="text-xs text-dim font-mono mb-1">🔒 disponível a partir do plano {min.nome}</p>
        <p className="font-display text-base">{texto ?? LABEL_RECURSO[recurso]}</p>
      </div>
      <Link
        href="/planos"
        className="px-4 py-2 rounded-card text-sm font-medium text-white"
        style={{ background: "var(--accent-brand)" }}
      >
        Fazer upgrade para {min.nome}
      </Link>
    </div>
  );
}
