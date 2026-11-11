import Link from "next/link";

const COL_PRODUTO = [
  { href: "/#produto", label: "Produto" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#diferenciais", label: "Diferenciais" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteFooter() {
  return (
    <footer className="text-sm text-dim border-t border-border">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 grid md:grid-cols-[2fr_1fr_1fr] gap-8">
        <div>
          <p className="font-display font-extrabold text-xl text-text mb-2">Predicta</p>
          <p className="text-sm text-dim max-w-xs">Inteligência de demanda para o setor elétrico.</p>
          {/* Redes sociais: [PREENCHER] */}
        </div>

        <div>
          <p className="text-xs font-mono text-dim mb-3">Produto</p>
          <ul className="flex flex-col gap-2">
            {COL_PRODUTO.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-text transition-colors">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-mono text-dim mb-3">Institucional</p>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/privacidade" className="hover:text-text transition-colors">
                Privacidade
              </Link>
            </li>
            <li>Contato: em breve</li>
          </ul>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs">
        <p>Fontes de dados: ONS · Copernicus ERA5-Land · ANEEL</p>
        <p>© 2026 Predicta</p>
      </div>
    </footer>
  );
}
