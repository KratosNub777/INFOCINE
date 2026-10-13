import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Icono } from "@/components/Icono";
import { Portada } from "@/components/Portada";
import { PanelSinConfigurar, SinPermiso } from "@/components/admin/Avisos";
import { botonPrincipal } from "@/components/admin/estilos";
import { EsqueletoGrilla } from "@/components/Esqueletos";
import { supabaseActivo } from "@/lib/supabase/config";
import { sesionActual } from "@/lib/supabase/servidor";

type FilaLista = {
  id: string;
  titulo: string;
  curso: string;
  seccion: string;
  anio: number;
  publicado: boolean;
  destacado: boolean;
  imagen_horizontal: string;
  estadisticas: { vistas: number; me_gusta: number } | { vistas: number; me_gusta: number }[] | null;
};

export default function PaginaPanel({ searchParams }: PageProps<"/admin">) {
  if (!supabaseActivo) return <PanelSinConfigurar />;
  return (
    <Suspense fallback={<EsqueletoGrilla cantidad={4} />}>
      <ListaCortos searchParams={searchParams} />
    </Suspense>
  );
}

async function ListaCortos({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  const { supabase, usuario, esEditor } = await sesionActual();
  if (!usuario) redirect("/admin/ingresar");
  if (!esEditor) return <SinPermiso email={usuario.email} />;

  const parametros = await searchParams;
  const { data, error } = await supabase
    .from("cortos")
    .select("id, titulo, curso, seccion, anio, publicado, destacado, imagen_horizontal, estadisticas(vistas, me_gusta)")
    .order("agregado", { ascending: false });
  const cortos = (data ?? []) as FilaLista[];
  const totales = cortos.reduce(
    (t, c) => {
      const e = Array.isArray(c.estadisticas) ? c.estadisticas[0] : c.estadisticas;
      return { vistas: t.vistas + (e?.vistas ?? 0), meGusta: t.meGusta + (e?.me_gusta ?? 0) };
    },
    { vistas: 0, meGusta: 0 },
  );

  return (
    <>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h1 className="titular text-titulo text-texto">Cortometrajes</h1>
          <p className="mt-1 text-sm text-texto-suave">
            {cortos.length} en total · {totales.vistas} vistas · {totales.meGusta} me gusta
          </p>
        </div>
        <Link href="/admin/cortos/nuevo" className={`${botonPrincipal} ml-auto`}>
          <Icono nombre="mas" className="size-5" /> Nuevo corto
        </Link>
      </div>

      {typeof parametros.guardado === "string" && (
        <p role="status" className="mt-6 rounded-lg bg-azul/40 p-3 text-sm text-texto ring-1 ring-azul">
          ✔ Guardado. Los cambios ya se ven en Infocine.
        </p>
      )}
      {parametros.eliminado === "1" && (
        <p role="status" className="mt-6 rounded-lg bg-superficie p-3 text-sm text-texto ring-1 ring-borde">
          El corto se borró.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-6 text-sm font-semibold text-rojo-texto">
          No se pudo leer la lista: {error.message}
        </p>
      )}

      {cortos.length === 0 ? (
        <p className="mt-10 text-cuerpo text-texto-suave">Todavía no hay cortos. Creá el primero con “Nuevo corto”.</p>
      ) : (
        <ul className="mt-8 divide-y divide-borde overflow-hidden rounded-xl bg-superficie ring-1 ring-borde">
          {cortos.map((c) => {
            const e = Array.isArray(c.estadisticas) ? c.estadisticas[0] : c.estadisticas;
            return (
              <li key={c.id} className="flex items-center gap-4 p-3 sm:p-4">
                <span className="relative hidden aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-fondo sm:block">
                  <Portada src={c.imagen_horizontal} alt="" sizes="7rem" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/cortos/${c.id}`}
                    className="titular block truncate text-lg text-texto hover:underline"
                  >
                    {c.titulo}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-texto-suave">
                    <span>
                      {c.curso} {c.seccion} · {c.anio}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-bold ${c.publicado ? "bg-azul text-texto" : "bg-fondo text-texto-suave ring-1 ring-borde"}`}
                    >
                      {c.publicado ? "Publicado" : "Borrador"}
                    </span>
                    {c.destacado && <span className="font-semibold text-dorado">★ Destacado</span>}
                  </p>
                </div>
                <p className="hidden shrink-0 text-right text-xs text-texto-suave tabular-nums md:block">
                  <span className="inline-flex items-center gap-1">
                    <Icono nombre="ojo" className="size-4" /> {e?.vistas ?? 0}
                  </span>
                  <br />
                  <span className="inline-flex items-center gap-1">
                    <Icono nombre="corazon" className="size-4" /> {e?.me_gusta ?? 0}
                  </span>
                </p>
                <Link
                  href={`/admin/cortos/${c.id}`}
                  aria-label={`Editar ${c.titulo}`}
                  className="grid size-10 shrink-0 place-items-center rounded-md text-texto ring-1 ring-borde hover:bg-superficie-alta"
                >
                  <Icono nombre="editar" className="size-5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
