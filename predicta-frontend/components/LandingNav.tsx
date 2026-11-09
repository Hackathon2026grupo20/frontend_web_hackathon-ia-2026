"use client";

import { useState } from "react";

const LINKS = [
  { href: "#problema", label: "Problema" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#na-pratica", label: "Veja na prática" },
  { href: "#reconhecimento", label: "Reconhecimento" },
  { href: "#proximos-passos", label: "Próximos passos" },
  { href: "#equipe", label: "Equipe" },
  { href: "#contato", label: "Contato" },
];

export function LandingNav() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-bg/95 backdrop-blur border-b border-border">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <a href="#top" className="font-display font-extrabold text-2xl">
          Predicta
        </a>

        <nav className="hidden md:flex items-center gap-6" aria-label="Seções da página">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-dim hover:text-text transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          className="md:hidden p-2 -mr-2 text-text"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
        >
          {aberto ? "✕" : "☰"}
        </button>
      </div>

      {aberto && (
        <nav className="md:hidden border-t border-border px-4 py-3 flex flex-col gap-1" aria-label="Seções da página">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setAberto(false)}
              className="py-2.5 text-sm text-dim hover:text-text transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
