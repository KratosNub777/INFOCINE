"use client";

import { MotionConfig } from "motion/react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Interfaz = {
  fichaId: string | null;
  abrirFicha: (id: string) => void;
  cerrarFicha: () => void;
  buscadorAbierto: boolean;
  abrirBuscador: () => void;
  cerrarBuscador: () => void;
};

const Contexto = createContext<Interfaz | null>(null);

export function useInterfaz() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useInterfaz debe usarse dentro de <Proveedores>");
  return ctx;
}

export function Proveedores({ children }: { children: ReactNode }) {
  const [fichaId, setFichaId] = useState<string | null>(null);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);

  const abrirFicha = useCallback((id: string) => {
    setBuscadorAbierto(false);
    setFichaId(id);
  }, []);
  const cerrarFicha = useCallback(() => setFichaId(null), []);
  const abrirBuscador = useCallback(() => setBuscadorAbierto(true), []);
  const cerrarBuscador = useCallback(() => setBuscadorAbierto(false), []);

  const valor = useMemo(
    () => ({ fichaId, abrirFicha, cerrarFicha, buscadorAbierto, abrirBuscador, cerrarBuscador }),
    [fichaId, abrirFicha, cerrarFicha, buscadorAbierto, abrirBuscador, cerrarBuscador],
  );

  return (
    <MotionConfig reducedMotion="user">
      <Contexto.Provider value={valor}>
        {children}
      </Contexto.Provider>
    </MotionConfig>
  );
}
