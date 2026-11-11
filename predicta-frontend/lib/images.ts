import fs from "fs";
import path from "path";

// Imagens que a landing espera em public/images/. Quando um arquivo não existe, os componentes
// que o usam caem num placeholder em gradiente + SVG decorativo (ver components/Picture.tsx).
export const EXPECTED_IMAGES = ["hero.jpg", "transmissao.jpg", "eolica.jpg", "solar.jpg", "cidade-noite.jpg"] as const;
export type ImageName = (typeof EXPECTED_IMAGES)[number];

const IMAGES_DIR = path.join(process.cwd(), "public", "images");

export function imageExists(filename: string): boolean {
  try {
    return fs.existsSync(path.join(IMAGES_DIR, filename));
  } catch {
    return false;
  }
}

export const MISSING_IMAGES: string[] = EXPECTED_IMAGES.filter((f) => !imageExists(f));
