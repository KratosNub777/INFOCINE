import type { ReactNode } from "react";

/** Título de página para las secciones internas (deja lugar al header fijo). */
export function Encabezado({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="px-[var(--gutter)] pt-[calc(var(--alto-header)+1.5rem)] md:pt-[calc(var(--alto-header)+2.5rem)]">
      <h1 className="titular text-titulo text-texto">{titulo}</h1>
      {children && <div className="mt-2 max-w-2xl text-cuerpo text-texto-suave">{children}</div>}
    </div>
  );
}
