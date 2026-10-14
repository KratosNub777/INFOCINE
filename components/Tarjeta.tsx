"use client";

import Link from "next/link";
import { textos } from "@/config/sitio";
import { formatoDuracion, type Corto } from "@/lib/cortos";
import { useCatalogo } from "./ContextoCatalogo";
import { useInterfaz } from "./Proveedores";
import { Portada } from "./Portada";
import { BotonMiLista } from "./BotonMiLista";
import { EtiquetaDemo, EtiquetaNuevo } from "./Etiquetas";
import { Icono } from "./Icono";

/**
 * Tarjeta de un corto. Al pasar el mouse (o con foco de teclado) se agranda
 * y muestra título, duración, año y botones. Tocar/Enter abre la ficha.
 */
export function Tarjeta({
  corto,
  variante = "h",
  progreso,
  enGrilla = false,
}: {
  corto: Corto;
  variante?: "h" | "v";
  /** Porcentaje visto (0–100) para “Seguir viendo”. */
  progreso?: number;
  /** En grillas ocupa todo el ancho de la celda. */
  enGrilla?: boolean;
}) {
  const { abrirFicha } = useInterfaz();
  const { esNuevo } = useCatalogo();
  const vertical = variante === "v";
  const meta = `${formatoDuracion(corto.duracion)} · ${corto.anio}`;
  const premiado = corto.premios.length > 0;

  return (
    <div
      className={`group/tarjeta relative ${enGrilla ? "w-full" : vertical ? "tarjeta-v" : "tarjeta-h"}`}
      data-tarjeta
    >
      <div className="relative origin-center rounded-md transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/tarjeta:z-20 group-hover/tarjeta:scale-[1.08] group-has-[:focus-visible]/tarjeta:z-20 group-has-[:focus-visible]/tarjeta:scale-[1.08] motion-reduce:transform-none">
        <button
          type="button"
          data-nav
          onClick={() => abrirFicha(corto.id)}
          aria-label={`${corto.titulo}${corto.demo ? " (demo)" : ""}${esNuevo(corto) ? ", nuevo" : ""}${premiado ? ", premiado" : ""}. ${meta}. ${textos.masInformacion}`}
          className={`relative block w-full overflow-hidden rounded-md bg-superficie shadow-xl shadow-black/60 ring-1 ring-white/10 transition-shadow group-hover/tarjeta:ring-white/40 ${vertical ? "aspect-[2/3]" : "aspect-video"}`}
        >
          <Portada
            src={vertical ? corto.portada : corto.imagenHorizontal}
            alt={`Portada de ${corto.titulo}`}
            sizes={
              enGrilla
                ? "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                : vertical
                  ? "(min-width: 1400px) 12vw, (min-width: 768px) 18vw, 34vw"
                  : "(min-width: 1400px) 20vw, (min-width: 768px) 30vw, 60vw"
            }
          />
          <span
            className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent transition-opacity duration-300 group-hover/tarjeta:opacity-100 group-has-[:focus-visible]/tarjeta:opacity-100 ${vertical ? "opacity-0" : "opacity-80"}`}
          />
          {progreso !== undefined && (
            <span className="pointer-events-none absolute inset-x-2 bottom-2 h-1 overflow-hidden rounded-full bg-white/30">
              <span
                className="block h-full origin-left rounded-full bg-rojo"
                style={{ transform: `scaleX(${Math.max(0.02, progreso / 100)})` }}
              />
            </span>
          )}
        </button>

        {/* Etiquetas (fuera del botón: su texto ya está en el nombre accesible) */}
        <span aria-hidden="true" className="pointer-events-none absolute top-2 left-2 flex gap-1.5">
          {esNuevo(corto) && <EtiquetaNuevo />}
          {corto.demo && !vertical && <EtiquetaDemo />}
        </span>
        {premiado && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-fondo/75 text-dorado"
          >
            <Icono nombre="premio" className="size-4" />
          </span>
        )}

        {/* Título (siempre visible en horizontales) */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 px-2.5 transition-[transform,opacity] duration-300 ${
            progreso !== undefined ? "pb-5" : "pb-2"
          } ${vertical ? "opacity-0 group-hover/tarjeta:opacity-100 group-has-[:focus-visible]/tarjeta:opacity-100" : ""} group-hover/tarjeta:-translate-y-[3.1rem] group-has-[:focus-visible]/tarjeta:-translate-y-[3.1rem]`}
          aria-hidden="true"
        >
          <p className="titular line-clamp-2 text-[clamp(1.05rem,0.9rem+0.6vw,1.85rem)] leading-tight text-texto drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {corto.titulo}
          </p>
        </div>

        {/* Detalles al pasar el mouse */}
        <div className="absolute inset-x-0 bottom-0 flex h-[3.1rem] translate-y-1 items-center gap-1.5 px-2.5 pb-1 opacity-0 transition-[transform,opacity] duration-300 group-hover/tarjeta:translate-y-0 group-hover/tarjeta:opacity-100 group-has-[:focus-visible]/tarjeta:translate-y-0 group-has-[:focus-visible]/tarjeta:opacity-100 pointer-events-none group-hover/tarjeta:pointer-events-auto">
          <Link
            href={`/ver/${corto.id}`}
            aria-label={`${textos.reproducir}: ${corto.titulo}`}
            title={textos.reproducir}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-texto text-fondo transition-transform hover:scale-110"
          >
            <Icono nombre="play" className="size-4 translate-x-px" />
          </Link>
          <BotonMiLista id={corto.id} titulo={corto.titulo} />
          <button
            type="button"
            onClick={() => abrirFicha(corto.id)}
            aria-label={`${textos.masInformacion}: ${corto.titulo}`}
            title={textos.masInformacion}
            className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-texto/60 bg-fondo/70 text-texto transition-colors hover:border-texto"
          >
            <Icono nombre="abajo" className="size-5" />
          </button>
          <p className="ml-auto truncate text-right text-[0.7rem] leading-tight font-medium text-texto/90">
            {formatoDuracion(corto.duracion)}
            <br />
            {corto.anio}
          </p>
        </div>
      </div>
    </div>
  );
}
