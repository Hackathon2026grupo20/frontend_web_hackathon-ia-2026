import { ClienteProvider } from "@/components/ClienteProvider";
import { AppShell } from "@/components/AppShell";

// Área do cliente: plano, região e simulação compartilhados entre Painel, Economia,
// Recomendações e Planos.
export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClienteProvider>
      <AppShell>{children}</AppShell>
    </ClienteProvider>
  );
}
