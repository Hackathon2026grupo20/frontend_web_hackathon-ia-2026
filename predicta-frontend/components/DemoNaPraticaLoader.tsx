"use client";

import dynamic from "next/dynamic";

// ssr:false precisa de uma fronteira de Client Component — por isso este loader existe
// separado da página (Server Component) que o importa.
const DemoNaPratica = dynamic(() => import("@/components/DemoNaPratica"), {
  ssr: false,
  loading: () => <div className="h-[340px] rounded-card border border-border bg-panel animate-pulse" />,
});

export function DemoNaPraticaLoader() {
  return <DemoNaPratica />;
}
