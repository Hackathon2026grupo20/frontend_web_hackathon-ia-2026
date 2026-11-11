// Símbolo da Predicta: curva de demanda com um pico, no roxo da marca sobre navy. Forma
// abstrata própria, sem referência a nenhuma marca existente.
export const BRAND_PURPLE = "#8b8df7";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="9" fill="#0a0f1c" />
      <path
        d="M7 27 C 12 27, 14 15, 19 15 C 23 15, 22 22, 27 22 C 31 22, 31 11, 34 9"
        fill="none"
        stroke={BRAND_PURPLE}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="34" cy="9" r="2.2" fill={BRAND_PURPLE} />
    </svg>
  );
}
