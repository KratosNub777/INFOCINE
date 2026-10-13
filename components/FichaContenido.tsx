"use client";

import Link from "next/link";
import { textos } from "@/config/sitio";
import { cursoYSeccion, formatoDuracion, nombreGenero, type Corto } from "@/lib/cortos";
import { useCatalogo } from "./ContextoCatalogo";
import { Portada } from "./Portada";
import { BotonMiLista } from "./BotonMiLista";
import { BotonMeGusta, ContadorVistas } from "./BotonMeGusta";
import { Tarjeta } from "./Tarjeta";
import { Icono } from "./Icono";
import { EtiquetaDemo, EtiquetaNuevo } from "./Etiquetas";

const t = textos.ficha;

/** Ficha completa de un corto. Se usa en la ventana modal y en /corto/[id]. */
export function FichaContenido({
  corto,
  enModal = false,
  idTitulo,
}: {
  corto: Corto;
  enModal?: boolean;
  idTitulo?: string;
}) {
  const Titulo = enModal ? "h2" : "h1";
  const Subtitulo = enModal ? "h3" : "h2";
  const { esNuevo, relacionados } = useCatalogo();
  const lista = relacionados(corto);
  const equipo: [string, string[] | undefined][] = [
    [t.direccion, corto.equipo.direccion],
    [t.guion, corto.equipo.guion],
    [t.elenco, corto.equipo.elenco],
    [t.edicion, corto.equipo.edicion],
    [t.fotografia, corto.equipo.fotografia],
    [t.sonido, corto.equipo.sonido],
    [t.profesorGuia, [corto.profesorGuia]],
  ];

  return (
    <article>
      {/* Cabecera con imagen */}
      <div
        className={`relative isolate flex items-end overflow-hidden ${enModal ? "aspect-[16/10] sm:aspect-video" : "min-h-[62svh]"}`}
      >
        <div className="absolute inset-0 -z-10">
          <Portada
            src={corto.imagenHorizontal}
            alt={`Imagen de ${corto.titulo}`}
            sizes={enModal ? "(min-width: 900px) 880px, 100vw" : "100vw"}
            prioridad
          />
        </div>
        <div
          className={`absolute inset-0 -z-10 bg-gradient-to-t to-transparent ${enModal ? "from-superficie via-superficie/50" : "from-fondo via-fondo/50"}`}
        />
        <div
          className={`absolute inset-0 -z-10 bg-gradient-to-r via-transparent to-transparent ${enModal ? "from-superficie/80" : "from-fondo/80"}`}
        />

        <div className="w-full p-[clamp(1.25rem,4vw,3rem)] pt-20">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {esNuevo(corto) && <EtiquetaNuevo />}
            {corto.demo && <EtiquetaDemo />}
          </div>
          <Titulo
            id={idTitulo}
            className="titular max-w-3xl text-titulo text-balance text-texto drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
          >
            {corto.titulo}
          </Titulo>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/ver/${corto.id}`}
              data-nav
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-rojo px-6 font-bold text-white transition-[background-color,transform] hover:bg-rojo-hover active:scale-[0.97]"
            >
              <Icono nombre="play" className="size-5" />
              {textos.verAhora}
            </Link>
            <BotonMiLista id={corto.id} titulo={corto.titulo} variante="completo" />
            <BotonMeGusta id={corto.id} titulo={corto.titulo} />
          </div>
        </div>
      </div>

      <div className="grid gap-8 p-[clamp(1.25rem,4vw,3rem)] pt-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-12">
        <div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-texto">
            <span>{corto.anio}</span>
            <span className="rounded border border-texto-suave/50 px-1.5 text-xs text-texto-suave">
              {cursoYSeccion(corto)}
            </span>
            <span className="inline-flex items-center gap-1 text-texto-suave">
              <Icono nombre="reloj" className="size-4" />
              {formatoDuracion(corto.duracion)}
            </span>
            <ContadorVistas id={corto.id} />
          </p>
          <Subtitulo className="sr-only">{t.sinopsis}</Subtitulo>
          <p className="mt-4 text-cuerpo text-texto">{corto.sinopsis}</p>
          {corto.demo && (
            <p className="mt-4 rounded-md border border-dorado/40 bg-dorado/10 px-3 py-2 text-sm text-texto">
              {textos.demoAviso}
            </p>
          )}
          {corto.premios.length > 0 && (
            <div className="mt-6">
              <Subtitulo className="text-sm font-bold tracking-wider text-texto-suave uppercase">{t.premios}</Subtitulo>
              <ul className="mt-2 space-y-1.5">
                {corto.premios.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-dorado">
                    <Icono nombre="premio" className="mt-0.5 size-4 shrink-0" />
                    <span className="text-sm font-semibold">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <Dato etiqueta={t.genero} valor={corto.generos.map(nombreGenero).join(", ")} />
          <Dato etiqueta={t.direccion} valor={corto.equipo.direccion.join(", ")} />
          <Dato etiqueta={t.profesorGuia} valor={corto.profesorGuia} />
        </div>
      </div>

      <div className="grid gap-8 px-[clamp(1.25rem,4vw,3rem)] pb-8 md:grid-cols-2 md:gap-12">
        <section aria-labelledby={`${corto.id}-tecnica`}>
          <Subtitulo id={`${corto.id}-tecnica`} className="titular text-subtitulo text-texto">
            {t.fichaTecnica}
          </Subtitulo>
          <dl className="mt-3 divide-y divide-borde/70 border-y border-borde/70">
            <Fila etiqueta={t.anio} valor={String(corto.anio)} />
            <Fila etiqueta={t.duracion} valor={formatoDuracion(corto.duracion)} />
            <Fila etiqueta={t.curso} valor={corto.curso} />
            <Fila etiqueta={t.seccion} valor={corto.seccion} />
            <Fila etiqueta={t.genero} valor={corto.generos.map(nombreGenero).join(", ")} />
            <Fila etiqueta={t.materia} valor={corto.materia} />
          </dl>
        </section>
        <section aria-labelledby={`${corto.id}-equipo`}>
          <Subtitulo id={`${corto.id}-equipo`} className="titular text-subtitulo text-texto">
            {t.equipo}
          </Subtitulo>
          <dl className="mt-3 divide-y divide-borde/70 border-y border-borde/70">
            {equipo
              .filter(([, nombres]) => nombres && nombres.length > 0)
              .map(([etiqueta, nombres]) => (
                <Fila key={etiqueta} etiqueta={etiqueta} valor={nombres!.join(", ")} />
              ))}
          </dl>
        </section>
      </div>

      {lista.length > 0 && (
        <section aria-labelledby={`${corto.id}-rel`} className="px-[clamp(1.25rem,4vw,3rem)] pb-10">
          <Subtitulo id={`${corto.id}-rel`} className="titular text-subtitulo text-texto">
            {t.relacionados}
          </Subtitulo>
          <div
            className={`mt-4 grid gap-x-[var(--gap)] gap-y-4 ${enModal ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"}`}
          >
            {lista.map((c) => (
              <Tarjeta key={c.id} corto={c} enGrilla />
            ))}
          </div>
        </section>
      )}

      {enModal && (
        <div className="border-t border-borde/70 px-[clamp(1.25rem,4vw,3rem)] py-5">
          <Link
            href={`/corto/${corto.id}`}
            data-nav
            className="inline-flex items-center gap-2 text-sm font-semibold text-dorado hover:underline"
          >
            {t.paginaCompleta}
            <Icono nombre="derecha" className="size-4" />
          </Link>
        </div>
      )}
    </article>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <p>
      <span className="text-texto-suave">{etiqueta}: </span>
      <span className="text-texto">{valor}</span>
    </p>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5 text-sm sm:grid-cols-[10rem_1fr]">
      <dt className="text-texto-suave">{etiqueta}</dt>
      <dd className="text-texto">{valor}</dd>
    </div>
  );
}
