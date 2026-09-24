"use client";

import { useState } from "react";
import Link from "next/link";

export default function SolicitarDemo() {
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Sem envio real — só captura intenção pra demonstração.
    setEnviado(true);
  }

  return (
    <div data-theme="landing" className="min-h-screen bg-bg text-text font-body flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display font-extrabold text-xl block text-center mb-8">
          Predicta
        </Link>

        {enviado ? (
          <div className="bg-panel border border-border rounded-card p-6 text-center">
            <h1 className="font-display font-bold text-xl mb-2" style={{ color: "var(--accent-good)" }}>
              Pedido recebido
            </h1>
            <p className="text-sm text-dim mb-5">
              Isso é só um protótipo — nenhum dado foi enviado de verdade. Em produção, a equipe
              entraria em contato em até 1 dia útil.
            </p>
            <Link href="/login" className="text-sm font-medium" style={{ color: "var(--accent-brand)" }}>
              Ver o produto agora →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-panel border border-border rounded-card p-6">
            <h1 className="font-display font-bold text-xl mb-1">Solicitar demonstração</h1>
            <p className="text-sm text-dim mb-6">
              Protótipo — este formulário não envia dado nenhum de verdade.
            </p>
            <label className="block text-sm mb-1.5">Nome</label>
            <input required className="w-full bg-panel2 border border-border rounded-card px-3 py-2 mb-4 text-text" />
            <label className="block text-sm mb-1.5">Empresa</label>
            <input required className="w-full bg-panel2 border border-border rounded-card px-3 py-2 mb-4 text-text" />
            <label className="block text-sm mb-1.5">E-mail corporativo</label>
            <input type="email" required className="w-full bg-panel2 border border-border rounded-card px-3 py-2 mb-6 text-text" />
            <button
              type="submit"
              className="w-full py-2.5 rounded-card font-medium text-white"
              style={{ background: "var(--accent-brand)" }}
            >
              Enviar pedido
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
