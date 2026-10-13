"use client";

import { motion } from "motion/react";
import { useEffect, type ReactNode } from "react";

// En la primera carga no se anima: el contenido se pinta de inmediato
// (mejor LCP). Desde la segunda página en adelante, entra con un fundido.
let primeraCarga = true;

/** Entrada suave al cambiar de página (catálogo ↔ ficha ↔ reproductor). */
export function Transicion({ children }: { children: ReactNode }) {
  const animar = !primeraCarga;
  useEffect(() => {
    primeraCarga = false;
  }, []);
  return (
    <motion.div
      initial={animar ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
