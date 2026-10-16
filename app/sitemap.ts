import type { MetadataRoute } from "next";
import { sitio } from "@/config/sitio";
import { accesoActivado } from "@/lib/acceso";
import { obtenerCatalogo, urlAbsoluta } from "@/lib/datos";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (accesoActivado()) return [];
  const cortos = (await obtenerCatalogo()).recientes;
  const ultima = cortos[0]?.agregado;
  return [
    { url: `${sitio.url}/`, lastModified: ultima, changeFrequency: "weekly", priority: 1 },
    { url: `${sitio.url}/cortometrajes`, lastModified: ultima, changeFrequency: "weekly", priority: 0.8 },
    { url: `${sitio.url}/por-anio`, lastModified: ultima, changeFrequency: "weekly", priority: 0.6 },
    { url: `${sitio.url}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${sitio.url}/terminos`, changeFrequency: "yearly", priority: 0.2 },
    ...cortos.map((c) => ({
      url: `${sitio.url}/corto/${c.id}`,
      lastModified: c.agregado,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: [urlAbsoluta(c.portada, sitio.url)],
    })),
  ];
}
