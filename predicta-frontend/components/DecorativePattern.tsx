// Padrão decorativo em linhas, usado só dentro dos placeholders de imagem (gradiente + SVG)
// quando o arquivo real em public/images/ ainda não existe.
export function DecorativePattern({ color = "#ff9640", opacity = 0.35 }: { color?: string; opacity?: number }) {
  return (
    <svg
      viewBox="0 0 200 120"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <g fill="none" stroke={color} strokeOpacity={opacity} strokeWidth="2" strokeLinecap="round">
        <path d="M0 90 C 30 90, 40 50, 70 50 C 90 50, 90 70, 120 70 C 150 70, 150 20, 200 20" />
        <path d="M0 110 C 40 110, 55 75, 90 75 C 110 75, 110 95, 140 95 C 165 95, 165 55, 200 55" />
        <circle cx="200" cy="20" r="3" fill={color} fillOpacity={opacity} stroke="none" />
      </g>
    </svg>
  );
}
