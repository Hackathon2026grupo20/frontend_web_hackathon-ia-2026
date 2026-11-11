// Curva discreta entre blocos de fundo diferentes. `fill` deve ser a cor do bloco que vem
// DEPOIS da curva (ela "flutua" sobre o bloco anterior).
export function WaveDivider({ fill, flip }: { fill: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      className={`block w-full h-8 md:h-12 ${flip ? "-scale-y-100" : ""}`}
      aria-hidden="true"
    >
      <path d="M0 48 C 360 0, 1080 0, 1440 48 L1440 48 L0 48 Z" fill={fill} />
    </svg>
  );
}
