import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { CONTACT_EMAIL, hasContactEmail } from "@/lib/config";

const COL_PRODUTO = [
  { href: "/#produto", label: "Produto" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#diferenciais", label: "Diferenciais" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteFooter() {
  return (
    <footer data-theme="operacao" className="text-sm text-white/60 bg-bg">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BrandMark className="h-8 w-8 rounded-[9px]" />
            <span className="font-display font-extrabold text-xl text-white">Predicta Energy</span>
          </div>
          <p className="text-sm text-white/50 max-w-xs">Inteligência de demanda para o setor elétrico.</p>
          {/* Redes sociais: [PREENCHER] */}
        </div>

        <div>
          <p className="text-xs font-mono text-white/40 mb-3">Produto</p>
          <ul className="flex flex-col gap-2">
            {COL_PRODUTO.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-white transition-colors">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-mono text-white/40 mb-3">Institucional</p>
          <ul className="flex flex-col gap-2">
            <li>
              {hasContactEmail ? (
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors">
                  {CONTACT_EMAIL}
                </a>
              ) : (
                "Contato: em breve"
              )}
            </li>
            <li>Fontes de dados: ONS · Copernicus ERA5-Land · ANEEL</li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-mono text-white/40 mb-3">Legal</p>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/privacidade" className="hover:text-white transition-colors">
                Privacidade
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 border-t border-white/10 text-xs">
        <p>© 2026 Predicta Energy</p>
      </div>
    </footer>
  );
}
