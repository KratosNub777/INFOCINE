import fs from "node:fs";
import path from "node:path";

/**
 * Busca el escudo del colegio en public/logo/.
 * Sirve cualquier imagen (.png, .webp, .jpg, .svg). Si hay varias,
 * prefiere la que tenga “escudo” en el nombre.
 */
function encontrarEscudo(): string | null {
  try {
    const carpeta = path.join(process.cwd(), "public", "logo");
    const imagenes = fs
      .readdirSync(carpeta)
      .filter((f) => /\.(png|webp|jpe?g|svg|avif)$/i.test(f))
      .sort((a, b) => Number(/escudo/i.test(b)) - Number(/escudo/i.test(a)));
    return imagenes[0] ? `/logo/${imagenes[0]}` : null;
  } catch {
    return null;
  }
}

export const rutaEscudo = encontrarEscudo();
