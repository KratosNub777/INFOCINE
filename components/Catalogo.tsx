"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { generos, textos, type Genero } from "@/config/sitio";
import { Tarjeta } from "./Tarjeta";
import { useCatalogo } from "./ContextoCatalogo";
import { useCuenta } from "./ContextoCuenta";
import { EsqueletoGrilla } from "./Esqueletos";
import { Icono } from "./Icono";

type Filtros = { genero: string; anio: string };

/** Grilla de todos los cortos con filtros por género y año. */
export function Catalogo() {
  // Los filtros viven en la URL (?genero=drama&anio=2025): se pueden compartir.
  const catalogo = useCatalogo();
  const params = useSearchParams();
  const filtros: Filtros = {
    genero: params.get("genero") ?? "",
    anio: params.get("anio") ?? "",
  };

  function cambiar(campo: keyof Filtros, valor: string) {
    const nuevos = { ...filtros, [campo]: filtros[campo] === valor ? "" : valor };
    const url = new URLSearchParams();
    for (const [k, v] of Object.entries(nuevos)) if (v) url.set(k, v);
    const query = url.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }

  const lista = catalogo.recientes.filter(
    (c) =>
      (!filtros.genero || c.generos.includes(filtros.genero as Genero)) &&
      (!filtros.anio || String(c.anio) === filtros.anio),
  );

  return (
    <div>
      <div className="space-y-3">
        <GrupoFiltro
          titulo="Género"
          opciones={catalogo.generosDisponibles().map((g) => ({ valor: g, etiqueta: generos[g] }))}
          actual={filtros.genero}
          alCambiar={(v) => cambiar("genero", v)}
        />
        <GrupoFiltro
          titulo="Año"
          opciones={catalogo.aniosDisponibles().map((a) => ({ valor: String(a), etiqueta: String(a) }))}
          actual={filtros.anio}
          alCambiar={(v) => cambiar("anio", v)}
        />
      </div>

      <p className="mt-6 text-sm text-texto-suave" aria-live="polite">
        {lista.length === 1 ? "1 cortometraje" : `${lista.length} cortometrajes`}
      </p>

      {lista.length === 0 ? (
        <p className="mt-8 text-cuerpo text-texto-suave">{textos.sinResultados}</p>
      ) : (
        <motion.ul
          layout="position"
          className="mt-4 grid grid-cols-2 gap-x-[var(--gap)] gap-y-5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {lista.map((c) => (
              <motion.li
                key={c.id}
                layout="position"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Tarjeta corto={c} enGrilla />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}

function GrupoFiltro({
  titulo,
  opciones,
  actual,
  alCambiar,
}: {
  titulo: string;
  opciones: { valor: string; etiqueta: string }[];
  actual: string;
  alCambiar: (valor: string) => void;
}) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="sr-only">{titulo}</legend>
      <span aria-hidden="true" className="w-16 text-xs font-bold tracking-wider text-texto-suave uppercase">
        {titulo}
      </span>
      <button
        type="button"
        data-nav
        aria-pressed={!actual}
        onClick={() => actual && alCambiar(actual)}
        className={chip(!actual)}
      >
        {textos.todos}
      </button>
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          data-nav
          aria-pressed={actual === o.valor}
          onClick={() => alCambiar(o.valor)}
          className={chip(actual === o.valor)}
        >
          {o.etiqueta}
        </button>
      ))}
    </fieldset>
  );
}

const chip = (activo: boolean) =>
  `min-h-10 rounded-full px-4 text-sm font-semibold ring-1 transition-colors ${
    activo ? "bg-texto text-fondo ring-texto" : "bg-superficie text-texto ring-borde hover:bg-superficie-alta"
  }`;

/** Grilla de “Mi lista” (página dedicada). */
export function GrillaMiLista() {
  const { porId } = useCatalogo();
  const { estado, miLista: ids, abrirIngreso } = useCuenta();
  const cortos = ids.map(porId).filter((c): c is NonNullable<typeof c> => Boolean(c));

  if (estado === "cargando") return <EsqueletoGrilla cantidad={4} />;
  if (estado === "anonimo") {
    return (
      <div className="mt-6 flex max-w-xl flex-col items-start gap-5 rounded-2xl bg-superficie/70 p-6 ring-1 ring-borde sm:p-8">
        <span className="grid size-14 place-items-center rounded-full bg-azul text-texto ring-1 ring-white/10">
          <Icono nombre="lista" className="size-7" />
        </span>
        <div>
          <h2 className="titular text-2xl text-texto">Guardá tus cortos favoritos</h2>
          <p className="mt-2 text-cuerpo text-texto-suave">{textos.miListaSinSesion}</p>
        </div>
        <button
          type="button"
          data-nav
          onClick={() => abrirIngreso()}
          className="inline-flex min-h-12 items-center gap-2 rounded-md bg-rojo px-6 font-bold text-white transition-[background-color,transform] hover:bg-rojo-hover active:scale-[0.97]"
        >
          <Icono nombre="usuario" className="size-5" /> Iniciar sesión
        </button>
      </div>
    );
  }

  if (!cortos.length) {
    return <p className="mt-6 max-w-xl text-cuerpo text-texto-suave">{textos.miListaVacia}</p>;
  }
  return (
    <ul className="mt-6 grid grid-cols-2 gap-x-[var(--gap)] gap-y-5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      <AnimatePresence initial={false}>
        {cortos.map((c) => (
          <motion.li key={c.id} layout="position" exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.25 }}>
            <Tarjeta corto={c} enGrilla />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
