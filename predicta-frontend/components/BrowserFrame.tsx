// Moldura de navegador só decorativa — a "URL" é um rótulo visual, não um link.
export function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border border-white/10 bg-[#0e1526] shadow-2xl"
      style={{ boxShadow: "0 20px 60px -20px rgba(0,0,0,0.6), 0 0 40px -10px var(--accent-brand-glow)" }}
    >
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-3 text-[11px] font-mono text-white/40 bg-white/5 rounded-card px-2.5 py-1">
          app.predicta
        </span>
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}
