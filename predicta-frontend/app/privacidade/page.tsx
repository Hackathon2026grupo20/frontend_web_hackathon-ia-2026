import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { CONTACT_EMAIL, hasContactEmail } from "@/lib/config";
import { BrandMark } from "@/components/BrandMark";

export const metadata: Metadata = {
  title: "Privacidade — Predicta",
  description: "Como a Predicta trata dados ao navegar pelo site.",
};

export default function Privacidade() {
  return (
    <div data-theme="landing" className="min-h-screen bg-bg text-text font-body flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 font-display font-extrabold text-xl">
            <BrandMark className="h-7 w-7 rounded-[8px]" />
            Predicta
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-16 flex-1 w-full">
        <h1 className="font-display font-bold text-2xl md:text-3xl mb-6">Política de Privacidade</h1>

        <div className="flex flex-col gap-6 text-dim leading-relaxed">
          <p>
            A Predicta é um produto em desenvolvimento. Esta página resume, de forma simples, como
            tratamos dados ao navegar por este site.
          </p>

          <section>
            <h2 className="font-display font-bold text-lg text-text mb-2">Coleta de dados neste site</h2>
            <p>
              Esta página não possui formulários de contato nem qualquer coleta ativa de dados
              pessoais. Hoje o site não usa cookies de rastreamento nem ferramentas de análise de
              audiência. Caso isso mude, esta página será atualizada antes da mudança entrar em vigor.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-text mb-2">Dados usados pelo produto</h2>
            <p>
              Os dados técnicos usados pela Predicta para gerar previsões — ONS, Copernicus ERA5-Land e
              ANEEL — são públicos e não identificam pessoas.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-text mb-2">Responsável pelo tratamento</h2>
            <p>[PREENCHER: nome/razão social responsável pelo tratamento de dados, se aplicável.]</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-text mb-2">Contato sobre privacidade</h2>
            <p>
              {hasContactEmail
                ? `Dúvidas ou solicitações sobre privacidade podem ser enviadas para ${CONTACT_EMAIL}.`
                : "O canal de contato para dúvidas ou solicitações sobre privacidade será divulgado em breve, junto com o canal de contato geral."}
            </p>
          </section>

          <p className="text-sm">Última atualização desta política: 10 de novembro de 2026.</p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
