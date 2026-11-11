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
