"use client";

import { useState } from "react";

const LINKS = [
  { href: "#produto", label: "Produto" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#faq", label: "FAQ" },
];

function ContatoButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      className={`rounded-card border border-border px-4 py-2 text-sm font-medium text-dim opacity-70 cursor-not-allowed ${className ?? ""}`}
    >
      Contato · em breve
    </button>
  );
}

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

        <div className="hidden md:block">
          <ContatoButton />
        </div>

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
          <ContatoButton className="mt-2 w-full" />
        </nav>
      )}
    </header>
  );
}
