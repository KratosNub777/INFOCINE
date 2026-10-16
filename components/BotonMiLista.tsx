"use client";

import { textos } from "@/config/sitio";
import { useMiLista } from "./ContextoCuenta";
import { Icono } from "./Icono";

export function BotonMiLista({
  id,
  titulo,
  variante = "icono",
  className = "",
}: {
  id: string;
  titulo: string;
  variante?: "icono" | "completo";
  className?: string;
}) {
  const { tiene, alternar } = useMiLista();
  const guardado = tiene(id);
  const etiqueta = `${guardado ? textos.quitarMiLista : textos.agregarMiLista}: ${titulo}`;

  // Dos íconos superpuestos que se cruzan con escala y opacidad (CSS, liviano).
  const icono = (
    <span className="relative grid size-5 place-items-center" aria-hidden="true">
      <Icono
        nombre="mas"
        className={`absolute size-5 transition-[transform,opacity] duration-300 ${guardado ? "scale-50 -rotate-45 opacity-0" : "scale-100 opacity-100"}`}
      />
      <Icono
        nombre="check"
        className={`absolute size-5 transition-[transform,opacity] duration-300 ${guardado ? "scale-100 opacity-100" : "scale-50 rotate-45 opacity-0"}`}
      />
    </span>
  );

  if (variante === "completo") {
    return (
      <button
        type="button"
        data-nav
        onClick={() => alternar(id)}
        aria-pressed={guardado}
        aria-label={etiqueta}
        className={`inline-flex min-h-12 items-center gap-2 rounded-md bg-superficie-alta/80 px-5 font-semibold text-texto ring-1 ring-texto/25 backdrop-blur transition-colors hover:bg-superficie-alta hover:ring-texto/60 ${className}`}
      >
        {icono}
        <span aria-hidden="true">{guardado ? textos.enMiLista : textos.miLista}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        alternar(id);
      }}
      aria-pressed={guardado}
      aria-label={etiqueta}
      title={guardado ? textos.quitarMiLista : textos.agregarMiLista}
      className={`grid size-9 place-items-center rounded-full border-2 border-texto/60 bg-fondo/70 text-texto transition-colors hover:border-texto ${className}`}
    >
      {icono}
    </button>
  );
}
