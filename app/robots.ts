import type { MetadataRoute } from "next";
import { sitio } from "@/config/sitio";
import { accesoActivado } from "@/lib/acceso";

export default function robots(): MetadataRoute.Robots {
  // Con código de acceso, el sitio es privado: no se indexa.
  if (accesoActivado()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/acceso", "/admin", "/ver/", "/mi-lista"] },
    sitemap: `${sitio.url}/sitemap.xml`,
  };
}
