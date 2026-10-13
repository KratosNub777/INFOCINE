"use client";

import { AnimatePresence, motion } from "motion/react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { textos } from "@/config/sitio";
import { buscar, cursosDisponibles, generosDisponibles, nombreGenero } from "@/lib/cortos";
import { useInterfaz } from "./Proveedores";
import { Tarjeta } from "./Tarjeta";
import { Icono } from "./Icono";

const sugerencias = [...cursosDisponibles().slice(0, 4), ...generosDisponibles().slice(0, 5).map(nombreGenero)];

/** Buscador en vivo, a pantalla completa. Se abre con la lupa o con “/”. */
export function Buscador() {
  const { buscadorAbierto, cerrarBuscador } = useInterfaz();
  const dialogo = useRef<HTMLDialogElement>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const resultadosRef = useRef<HTMLDivElement>(null);
  const [consulta, setConsulta] = useState("");
  const diferida = useDeferredValue(consulta);
  const resultados = buscar(diferida);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (buscadorAbierto && !d.open) {
      d.showModal();
      entrada.current?.focus();
      entrada.current?.select();
    }
  }, [buscadorAbierto]);

  return (
    <dialog
      ref={dialogo}
      aria-label={textos.buscar}
      onCancel={(e) => {
        e.preventDefault();
        cerrarBuscador();
      }}
      className="fixed inset-0 m-0 h-full w-full overflow-hidden"
    >
      <AnimatePresence onExitComplete={() => dialogo.current?.close()}>
        {buscadorAbierto && (
          <motion.div
            key="buscador"
            className="fixed inset-0 overflow-y-auto overscroll-contain bg-fondo/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial={{ y: -16 }}
              animate={{ y: 0 }}
              exit={{ y: -12 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
              className="mx-auto max-w-[110rem] px-[var(--gutter)] pt-4 pb-28 md:pt-8"
            >
              <form
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  resultadosRef.current?.querySelector<HTMLElement>("[data-nav]")?.focus();
                }}
                className="flex items-center gap-3"
              >
                <label className="flex min-h-14 flex-1 items-center gap-3 rounded-lg bg-superficie px-4 ring-1 ring-borde focus-within:ring-2 focus-within:ring-dorado">
                  <Icono nombre="buscar" className="size-6 shrink-0 text-texto-suave" />
                  <span className="sr-only">{textos.buscar}</span>
                  <input
                    ref={entrada}
                    type="search"
                    value={consulta}
                    onChange={(e) => setConsulta(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        resultadosRef.current?.querySelector<HTMLElement>("[data-nav]")?.focus();
                      }
                    }}
                    placeholder={textos.buscarPlaceholder}
                    enterKeyHint="search"
                    autoComplete="off"
                    spellCheck={false}
                    className="h-14 w-full bg-transparent text-lg text-texto placeholder:text-texto-suave/80 focus:outline-none focus-visible:outline-none"
                  />
                </label>
                <button
                  type="button"
                  data-nav
                  onClick={cerrarBuscador}
                  className="grid size-14 shrink-0 place-items-center rounded-lg text-texto ring-1 ring-borde transition-colors hover:bg-superficie"
                  aria-label={textos.cerrar}
                >
                  <Icono nombre="cerrar" className="size-6" />
                </button>
              </form>

              <p className="mt-3 text-sm text-texto-suave">{textos.buscarAyuda}</p>

              {!diferida.trim() && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {sugerencias.map((s) => (
                    <button
                      key={s}
                      type="button"
                      data-nav
                      onClick={() => {
                        setConsulta(s);
                        entrada.current?.focus();
                      }}
                      className="min-h-10 rounded-full bg-superficie px-4 text-sm font-semibold text-texto ring-1 ring-borde transition-colors hover:bg-superficie-alta"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <p className="sr-only" aria-live="polite">
                {diferida.trim() ? `${resultados.length} resultados` : ""}
              </p>

              {diferida.trim() && resultados.length === 0 && (
                <p className="mt-10 text-center text-cuerpo text-texto-suave">{textos.sinResultados}</p>
              )}

              <div
                ref={resultadosRef}
                className="mt-6 grid grid-cols-2 gap-x-[var(--gap)] gap-y-5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6"
              >
                {resultados.map((c) => (
                  <Tarjeta key={c.id} corto={c} enGrilla />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
