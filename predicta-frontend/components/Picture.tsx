import Image from "next/image";
import { imageExists } from "@/lib/images";
import { DecorativePattern } from "@/components/DecorativePattern";

interface PictureProps {
  src: string; // nome do arquivo dentro de public/images/
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  gradientClassName?: string;
  patternColor?: string;
}

// Usa a imagem real em public/images/ quando ela existe; senão cai num placeholder em
// gradiente + SVG decorativo, mantendo o mesmo espaço e alt — pra trocar depois sem tocar em código.
export function Picture({
  src,
  alt,
  className,
  priority,
  fill,
  width,
  height,
  sizes,
  gradientClassName = "bg-gradient-to-br from-[#0a0f1c] via-[#141b2e] to-[#1a2138]",
  patternColor = "#ff9640",
}: PictureProps) {
  if (imageExists(src)) {
    if (fill) {
      return (
        <Image
          src={`/images/${src}`}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes ?? "100vw"}
          className={className}
        />
      );
    }
    return (
      <Image
        src={`/images/${src}`}
        alt={alt}
        width={width ?? 800}
        height={height ?? 600}
        priority={priority}
        sizes={sizes}
        className={className}
      />
    );
  }

  const decorative = alt === "";
  return (
    <div
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : alt}
      aria-hidden={decorative ? "true" : undefined}
      className={`overflow-hidden ${gradientClassName} ${fill ? "absolute inset-0" : `relative ${className ?? ""}`}`}
    >
      <DecorativePattern color={patternColor} />
    </div>
  );
}
