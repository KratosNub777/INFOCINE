import type { MetadataRoute } from "next";
import { colores, sitio } from "@/config/sitio";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${sitio.nombre} · ${sitio.colegio}`,
    short_name: sitio.nombre,
    description: sitio.descripcion,
    lang: sitio.idioma,
    start_url: "/",
    display: "standalone",
    background_color: colores.fondo,
    theme_color: colores.fondo,
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
