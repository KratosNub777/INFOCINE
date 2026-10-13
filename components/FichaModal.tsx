"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { textos } from "@/config/sitio";
import { buscarCorto } from "@/lib/cortos";
import { useInterfaz } from "./Proveedores";
import { FichaContenido } from "./FichaContenido";
import { Icono } from "./Icono";

/**
 * Ficha del corto en ventana modal (<dialog> nativo: atrapa el foco,
 * se cierra con Escape y devuelve el foco a la tarjeta).
 */
export function FichaModal() {
  const { fichaId, cerrarFicha } = useInterfaz();
  const dialogo = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const botonCerrar = useRef<HTMLButtonElement>(null);
  const retorno = useRef<HTMLElement | null>(null);
  // Al cerrar, AnimatePresence conserva el último contenido durante la salida.
  const corto = fichaId ? buscarCorto(fichaId) : undefined;

  // Abrir o cambiar de corto
  useEffect(() => {
    const d = dialogo.current;
    if (!d || !fichaId) return;
    if (!d.open) {
      retorno.current = document.activeElement as HTMLElement | null;
      d.showModal();
      botonCerrar.current?.focus();
    }
    panel.current?.scrollTo({ top: 0 });
  }, [fichaId]);

  function alTerminarSalida() {
    const d = dialogo.current;
    if (d?.open && !fichaId) {
      d.close();
      const r = retorno.current;
      if (r && document.contains(r)) r.focus({ preventScroll: true });
    }
  }

  return (
    <dialog
      ref={dialogo}
      aria-labelledby="ficha-titulo"
      onCancel={(e) => {
        e.preventDefault();
        cerrarFicha();
      }}
      className="fixed inset-0 m-0 h-full w-full overflow-hidden bg-transparent backdrop:bg-transparent"
    >
      <AnimatePresence onExitComplete={alTerminarSalida}>
        {corto && (
          <motion.div
            key="fondo"
            className="fixed inset-0 bg-black/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={cerrarFicha}
            aria-hidden="true"
          />
        )}
        {corto && (
          <motion.div
            key="panel"
            ref={panel}
            className="sin-barra fixed inset-0 overflow-y-auto overscroll-contain sm:inset-x-4 sm:top-[4vh] sm:bottom-0"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.12 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) cerrarFicha();
            }}
          >
            <div className="relative mx-auto min-h-full max-w-[min(58rem,100%)] overflow-hidden bg-superficie shadow-2xl shadow-black ring-1 ring-white/10 sm:mb-[4vh] sm:min-h-0 sm:rounded-xl">
              <button
                ref={botonCerrar}
                type="button"
                data-nav
                onClick={cerrarFicha}
                aria-label={textos.cerrar}
                className="absolute top-3 right-3 z-10 grid size-11 place-items-center rounded-full bg-fondo/80 text-texto ring-1 ring-white/20 transition-colors hover:bg-fondo"
              >
                <Icono nombre="cerrar" className="size-6" />
              </button>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={corto.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FichaContenido corto={corto} enModal idTitulo="ficha-titulo" />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
