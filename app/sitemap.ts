import type { MetadataRoute } from "next";
import { sitio } from "@/config/sitio";
import { accesoActivado } from "@/lib/acceso";
import { porReciente } from "@/lib/cortos";

export default function sitemap(): MetadataRoute.Sitemap {
  if (accesoActivado()) return [];
  const cortos = porReciente();
  const ultima = cortos[0]?.agregado;
  return [
    { url: `${sitio.url}/`, lastModified: ultima, changeFrequency: "weekly", priority: 1 },
    { url: `${sitio.url}/cortometrajes`, lastModified: ultima, changeFrequency: "weekly", priority: 0.8 },
    { url: `${sitio.url}/por-curso`, lastModified: ultima, changeFrequency: "weekly", priority: 0.6 },
    ...cortos.map((c) => ({
      url: `${sitio.url}/corto/${c.id}`,
      lastModified: c.agregado,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: [`${sitio.url}${c.portada}`],
    })),
  ];
}
