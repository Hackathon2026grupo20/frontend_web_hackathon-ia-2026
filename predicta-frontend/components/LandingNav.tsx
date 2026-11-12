"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { CONTACT_EMAIL, hasContactEmail } from "@/lib/config";

const LINKS = [
  { href: "#produto", label: "Produto" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#faq", label: "FAQ" },
];

function ContatoButton({ light, className }: { light: boolean; className?: string }) {
  if (hasContactEmail) {
    return (
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className={`rounded-card px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02] ${className ?? ""}`}
        style={{ background: "var(--accent-brand)" }}
      >
        Fale com a gente
      </a>
    );
  }
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      className={`rounded-card border px-4 py-2 text-sm font-medium opacity-70 cursor-not-allowed ${
        light ? "border-white/30 text-white/80" : "border-border text-dim"
      } ${className ?? ""}`}
    >
      Contato · em breve
    </button>
  );
}

export function LandingNav() {
  const [aberto, setAberto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const light = !scrolled;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-20 transition-colors duration-300 ${
        scrolled ? "bg-bg/95 backdrop-blur border-b border-border" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 font-display font-extrabold text-xl">
          <BrandMark className="h-8 w-8 rounded-[9px]" />
          <span className={light ? "text-white" : "text-text"}>Predicta Energy</span>
        </a>

        <nav className="hidden md:flex items-center gap-6" aria-label="Seções da página">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors ${
                light ? "text-white/75 hover:text-white" : "text-dim hover:text-text"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <ContatoButton light={light} />
        </div>

        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          className={`md:hidden p-2 -mr-2 ${light ? "text-white" : "text-text"}`}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
        >
          {aberto ? "✕" : "☰"}
        </button>
      </div>

      {aberto && (
        <nav
          className={`md:hidden border-t px-4 py-3 flex flex-col gap-1 ${
            light ? "border-white/10 bg-[#0a0f1c]" : "border-border bg-bg"
          }`}
          aria-label="Seções da página"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setAberto(false)}
              className={`py-2.5 text-sm transition-colors ${
                light ? "text-white/75 hover:text-white" : "text-dim hover:text-text"
              }`}
            >
              {l.label}
            </a>
          ))}
          <ContatoButton light={light} className="mt-2 w-full text-center" />
        </nav>
      )}
    </header>
  );
}
