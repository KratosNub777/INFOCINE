"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sitio, textos } from "@/config/sitio";
import { cursoYSeccion, formatoDuracion, nombreGenero, type Corto } from "@/lib/cortos";
import { useInterfaz } from "./Proveedores";
import { Portada } from "./Portada";
import { Icono } from "./Icono";
import { EtiquetaDemo, EtiquetaPremio } from "./Etiquetas";

const SUAVE = [0.2, 0.8, 0.2, 1] as const;

/** Carrusel principal: rota entre los destacados con un fundido suave. */
export function Hero({ cortos }: { cortos: Corto[] }) {
  const { abrirFicha } = useInterfaz();
  const reducido = useReducedMotion();
  const [activo, setActivo] = useState(0);
  const [pausadoUsuario, setPausadoUsuario] = useState<boolean | null>(null);
  const [enFoco, setEnFoco] = useState(false);
  // Con “reducir movimiento” arranca en pausa; siempre se puede cambiar con el botón.
  const pausado = pausadoUsuario ?? Boolean(reducido);
  const corriendo = !pausado && !enFoco && cortos.length > 1;

  useEffect(() => {
    if (!corriendo) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") setActivo((i) => (i + 1) % cortos.length);
    }, sitio.segundosHero * 1000);
    return () => window.clearInterval(t);
  }, [corriendo, cortos.length]);

  const corto = cortos[activo];
  if (!corto) return null;

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Cortos destacados"
      className="relative isolate flex h-[78svh] max-h-[60rem] min-h-[32rem] w-full items-end overflow-hidden"
      onMouseEnter={() => setEnFoco(true)}
      onMouseLeave={() => setEnFoco(false)}
      onFocusCapture={() => setEnFoco(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setEnFoco(false);
      }}
    >
      {/* Fondos apilados: solo cambia la opacidad */}
      {cortos.map((c, i) => (
        <motion.div
          key={c.id}
          className="absolute inset-0 -z-20"
          initial={false}
          animate={{ opacity: i === activo ? 1 : 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          aria-hidden={i !== activo}
        >
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ scale: i === activo ? 1 : 1.08 }}
            transition={
              i === activo ? { duration: sitio.segundosHero + 2, ease: "linear" } : { duration: 0, delay: 1.3 }
            }
          >
            <Portada
              src={c.imagenHorizontal}
              alt={i === activo ? `Imagen de ${c.titulo}` : ""}
              sizes="100vw"
              prioridad={i === 0}
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Degradados para que el texto se lea siempre */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_15%_100%,color-mix(in_oklab,var(--c-azul)_45%,transparent),transparent)]" />
      <LuzDeCine />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-fondo via-fondo/60 to-transparent md:via-fondo/40" />
      <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-fondo/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-fondo via-fondo/70 to-transparent" />

      <div className="w-full px-[var(--gutter)] pb-[clamp(3.5rem,8vh,6rem)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={corto.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: SUAVE }}
            className="max-w-[min(40rem,100%)] lg:max-w-[46rem]"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] text-dorado uppercase">
                <Icono nombre="premio" className="size-3.5" />
                {textos.destacado}
              </span>
              {corto.demo && <EtiquetaDemo />}
            </div>
            <h2 className="titular text-hero text-balance text-texto drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
              {corto.titulo}
            </h2>
            <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-medium text-texto/90 md:text-base">
              <span>{corto.anio}</span>
              <Separador />
              <span>{cursoYSeccion(corto)}</span>
              <Separador />
              <span>{formatoDuracion(corto.duracion)}</span>
              <Separador />
              <span>{corto.generos.map(nombreGenero).join(", ")}</span>
            </p>
            {corto.premios[0] && <EtiquetaPremio texto={corto.premios[0]} className="mt-2" />}
            <p className="mt-3 line-clamp-3 max-w-[36rem] text-cuerpo text-texto-suave md:line-clamp-4">
              {corto.sinopsis}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
              <Link
                href={`/ver/${corto.id}`}
                data-nav
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-rojo px-5 text-base sm:px-6 font-bold text-white shadow-lg shadow-rojo/25 transition-[background-color,transform] hover:bg-rojo-hover active:scale-[0.97] md:text-lg"
              >
                <Icono nombre="play" className="size-5" />
                {textos.verAhora}
              </Link>
              <button
                type="button"
                data-nav
                onClick={() => abrirFicha(corto.id)}
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-texto/20 px-5 text-base sm:px-6 font-bold text-texto backdrop-blur transition-[background-color,transform] hover:bg-texto/30 active:scale-[0.97] md:text-lg"
              >
                <Icono nombre="info" className="size-5" />
                <span className="hidden min-[420px]:inline">{textos.masInformacion}</span>
                <span className="min-[420px]:hidden">Más info</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {cortos.length > 1 && (
          <div className="mt-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPausadoUsuario(!pausado)}
              aria-label={pausado ? "Reanudar el carrusel" : "Pausar el carrusel"}
              className="grid size-9 place-items-center rounded-full text-texto/80 ring-1 ring-texto/30 transition-colors hover:text-texto hover:ring-texto/70"
            >
              <Icono nombre={pausado ? "play" : "pausa"} className="size-3.5" />
            </button>
            {cortos.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActivo(i)}
                aria-label={`Ver destacado ${i + 1}: ${c.titulo}`}
                aria-current={i === activo ? "true" : undefined}
                className="group/punto grid h-9 w-10 place-items-center"
              >
                <span className="relative block h-1 w-full overflow-hidden rounded-full bg-texto/25">
                  {i === activo && (
                    <motion.span
                      key={`${c.id}-${corriendo}`}
                      className="absolute inset-0 origin-left bg-texto"
                      initial={{ scaleX: corriendo ? 0 : 1 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: corriendo ? sitio.segundosHero : 0, ease: "linear" }}
                    />
                  )}
                </span>
              </button>
            ))}
            <span className="sr-only" aria-live={corriendo ? "off" : "polite"}>
              {`Destacado ${activo + 1} de ${cortos.length}: ${corto.titulo}`}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function Separador() {
  return <span aria-hidden="true" className="size-1 rounded-full bg-texto-suave/70" />;
}

/** Haz de luz de proyector que titila suavemente. */
function LuzDeCine() {
  const reducido = useReducedMotion();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden mix-blend-screen">
      <motion.div
        className="absolute -top-1/3 -left-1/4 h-[160%] w-[90%] origin-top-left bg-[conic-gradient(from_118deg_at_0%_0%,transparent_0deg,rgba(255,236,200,0.16)_14deg,rgba(255,236,200,0.05)_28deg,transparent_40deg)] blur-2xl"
        animate={reducido ? undefined : { rotate: [-2, 2.5, -2], opacity: [0.75, 1, 0.8, 0.95, 0.75] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
