import { cacheLife, cacheTag } from "next/cache";
import { cortos as cortosLocales } from "@/data/cortos";
import { crearCatalogo, type Corto } from "@/lib/cortos";
import { supabaseActivo } from "@/lib/supabase/config";
import { clientePublico } from "@/lib/supabase/publico";
import { filaACorto, type FilaCorto } from "@/lib/supabase/filas";

/** Etiqueta de caché: el panel la invalida al guardar un corto. */
export const ETIQUETA_CORTOS = "cortos";

/**
 * De dónde salen los cortos:
 * - Sin Supabase configurado: data/cortos.ts (fase 1).
 * - Con Supabase: la tabla public.cortos (solo los publicados).
 */
export async function obtenerCortos(): Promise<Corto[]> {
  if (!supabaseActivo) return cortosLocales;
  return cortosDeSupabase();
}

export async function obtenerCatalogo() {
  return crearCatalogo(await obtenerCortos());
}

async function cortosDeSupabase(): Promise<Corto[]> {
  "use cache";
  cacheTag(ETIQUETA_CORTOS);
  cacheLife("hours");
  const { data, error } = await clientePublico()
    .from("cortos")
    .select("*")
    .eq("publicado", true)
    .order("agregado", { ascending: false });
  if (error) throw new Error(`No se pudo leer el catálogo de Supabase: ${error.message}`);
  return (data as FilaCorto[]).map(filaACorto);
}

/** Para generateStaticParams: Next.js necesita al menos un id para prerenderizar la ruta. */
export async function idsDeCortos(): Promise<{ id: string }[]> {
  const cortos = await obtenerCortos();
  return cortos.length ? cortos.map((c) => ({ id: c.id })) : [{ id: "sin-cortos" }];
}

/** URL absoluta de una imagen (las de Storage ya vienen completas). */
export function urlAbsoluta(ruta: string, base: string): string {
  return /^https?:\/\//.test(ruta) ? ruta : `${base}${ruta}`;
}
