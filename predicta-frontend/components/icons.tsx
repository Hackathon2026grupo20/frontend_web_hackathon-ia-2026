// Ícones em linha, próprios e inline (sem biblioteca de ícones) — usados nos cards de Produto e
// nos quatro passos de "Como funciona". Todos herdam a cor via currentColor.
import type { SVGProps } from "react";

function Base(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export function ForecastIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M3 21 L9 13 L14 17 L20 7 L25 10" />
      <circle cx="20" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <path d="M3 24 H25" opacity={0.4} />
    </Base>
  );
}

export function TariffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M4 14 L13 4 H22 V13 L13 24 Z" />
      <circle cx="17.5" cy="9.5" r="2" />
    </Base>
  );
}

export function PublicDataIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <ellipse cx="14" cy="6" rx="9" ry="3" />
      <path d="M5 6 V22 C5 23.7 9 25 14 25 C19 25 23 23.7 23 22 V6" />
      <path d="M5 14 C5 15.7 9 17 14 17 C19 17 23 15.7 23 14" />
    </Base>
  );
}

export function ModelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="6" cy="8" r="2.2" />
      <circle cx="6" cy="20" r="2.2" />
      <circle cx="22" cy="14" r="2.6" />
      <path d="M8 8 L19.5 13" />
      <path d="M8 20 L19.5 15" />
    </Base>
  );
}

export function PressureIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M4 20 A10 10 0 0 1 24 20" />
      <path d="M14 20 L19 11" />
      <circle cx="14" cy="20" r="1.4" fill="currentColor" stroke="none" />
    </Base>
  );
}

// Medidor de energia com conferência — ilustra "Método transparente" enquanto não há foto.
export function MeterCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <rect x="4" y="5" width="20" height="18" rx="2.5" />
      <path d="M8 13 A6 6 0 0 1 20 13" />
      <path d="M14 13 L17.5 9.5" />
      <path d="M9 19 L12 22 L19 15" />
    </Base>
  );
}

// Pino de localização sobre uma malha — ilustra "Confiança de localização".
export function LocationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M14 25 C14 25 6 17 6 11 A8 8 0 0 1 22 11 C22 17 14 25 14 25 Z" />
      <circle cx="14" cy="11" r="2.8" />
      <path d="M3 24 H25" opacity={0.4} />
    </Base>
  );
}

export function DecisionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M14 4 V13" />
      <path d="M14 13 L6 24" />
      <path d="M14 13 L22 24" />
      <circle cx="14" cy="4" r="1.8" fill="currentColor" stroke="none" />
    </Base>
  );
}
