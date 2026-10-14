"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { Corto } from "@/lib/cortos";
import { Tarjeta } from "./Tarjeta";
import { Icono } from "./Icono";

/**
 * Fila horizontal de cortos: scroll táctil en celular y flechas en computadora.
 * Entra con un desvanecimiento escalonado cuando aparece en pantalla.
 */
export function Fila({
  titulo,
  cortos,
  variante = "h",
  progresos,
  verTodo,
  indice = 0,
}: {
  titulo: string;
  cortos: Corto[];
  /** "ranking": portadas verticales con un número grande al costado (Top N). */
  variante?: "h" | "v" | "ranking";
  progresos?: Record<string, number>;
  verTodo?: string;
  /** Posición de la fila en la página (para escalonar la entrada). */
  indice?: number;
}) {
  const idTitulo = useId();
  const carril = useRef<HTMLDivElement>(null);
  const [puedeIzq, setPuedeIzq] = useState(false);
  const [puedeDer, setPuedeDer] = useState(false);

  const medir = useCallback(() => {
    const el = carril.current;
    if (!el) return;
    setPuedeIzq(el.scrollLeft > 8);
    setPuedeDer(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    medir();
    const el = carril.current;
    if (!el) return;
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, [medir, cortos.length]);

  function desplazar(sentido: 1 | -1) {
    const el = carril.current;
    if (!el) return;
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: sentido * el.clientWidth * 0.85, behavior: suave ? "smooth" : "auto" });
  }

  if (!cortos.length) return null;

  return (
    <motion.section
      aria-labelledby={idTitulo}
      className="group/fila relative"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1], delay: Math.min(indice, 4) * 0.07 }}
    >
      <div className="flex items-baseline gap-3 px-[var(--gutter)]">
        <h2 id={idTitulo} className="titular text-fila text-texto">
          {titulo}
        </h2>
        {verTodo && (
          <Link
            href={verTodo}
            className="text-sm font-semibold text-dorado opacity-90 transition-opacity hover:opacity-100 hover:underline"
          >
            Ver todo<span className="sr-only">: {titulo}</span>
          </Link>
        )}
      </div>

      <div className="relative">
        <div
          ref={carril}
          onScroll={medir}
          data-nav-fila
          style={{ "--n": cortos.length } as CSSProperties}
          className="sin-barra flex snap-x snap-mandatory [&>[data-tarjeta]]:snap-start scroll-px-[var(--gutter)] gap-[var(--gap)] overflow-x-auto overscroll-x-contain px-[var(--gutter)] pt-3 pb-3"
        >
          {cortos.map((c, i) =>
            variante === "ranking" ? (
              <ItemRanking key={c.id} corto={c} puesto={i + 1} />
            ) : (
              <Tarjeta key={c.id} corto={c} variante={variante} progreso={progresos?.[c.id]} />
            ),
          )}
        </div>

        <BotonFlecha lado="izq" visible={puedeIzq} onClick={() => desplazar(-1)} titulo={titulo} />
        <BotonFlecha lado="der" visible={puedeDer} onClick={() => desplazar(1)} titulo={titulo} />
      </div>
    </motion.section>
  );
}

/** Portada vertical con el número del puesto detrás, como en un Top 10. */
function ItemRanking({ corto, puesto }: { corto: Corto; puesto: number }) {
  const digitos = String(puesto).length;
  return (
    <div className="item-ranking relative" data-tarjeta style={{ "--digitos": digitos } as CSSProperties}>
      <svg
        aria-hidden="true"
        className="item-ranking-numero pointer-events-none absolute inset-y-0 left-0 h-full overflow-visible"
        viewBox={`0 0 ${NUM_ANCHO * digitos} ${NUM_ALTO}`}
        preserveAspectRatio="xMaxYMax meet"
      >
        <text
          x={NUM_ANCHO * digitos}
          y={NUM_ALTO}
          textAnchor="end"
          className="titular"
          fontSize={NUM_ALTO * 1.3}
          fill="var(--c-fondo)"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={5}
          strokeLinejoin="round"
          paintOrder="stroke"
        >
          {puesto}
        </text>
      </svg>
      <div className="item-ranking-tarjeta absolute inset-y-0 right-0">
        <Tarjeta corto={corto} variante="v" enGrilla />
      </div>
    </div>
  );
}

// Medidas del número (unidades relativas a un ancho de portada de 100).
const NUM_ANCHO = 85;
const NUM_ALTO = 150;

function BotonFlecha({
  lado,
  visible,
  onClick,
  titulo,
}: {
  lado: "izq" | "der";
  visible: boolean;
  onClick: () => void;
  titulo: string;
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onClick}
      aria-label={`${lado === "izq" ? "Anteriores" : "Siguientes"} en ${titulo}`}
      className={`absolute top-3 bottom-3 z-30 hidden w-[calc(var(--gutter)-0.25rem)] place-items-center bg-fondo/60 text-texto opacity-0 transition-opacity duration-200 [@media(hover:hover)_and_(pointer:fine)]:grid ${
        lado === "izq" ? "left-0 rounded-r-md" : "right-0 rounded-l-md"
      } ${visible ? "group-hover/fila:opacity-100 hover:bg-fondo/80" : "pointer-events-none"}`}
    >
      <Icono
        nombre={lado === "izq" ? "izquierda" : "derecha"}
        className="size-8 transition-transform hover:scale-125"
      />
    </button>
  );
}
