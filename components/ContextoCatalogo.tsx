"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { crearCatalogo, type Catalogo, type Corto } from "@/lib/cortos";

const Contexto = createContext<Catalogo | null>(null);

/** Comparte el catálogo (de data/cortos.ts o de Supabase) con los componentes del navegador. */
export function ProveedorCatalogo({ cortos, children }: { cortos: Corto[]; children: ReactNode }) {
  const catalogo = useMemo(() => crearCatalogo(cortos), [cortos]);
  return <Contexto.Provider value={catalogo}>{children}</Contexto.Provider>;
}

export function useCatalogo(): Catalogo {
  const catalogo = useContext(Contexto);
  if (!catalogo) throw new Error("useCatalogo debe usarse dentro de <ProveedorCatalogo>");
  return catalogo;
}
