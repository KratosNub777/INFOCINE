import { textos } from "@/config/sitio";
import { Icono } from "./Icono";

export function EtiquetaDemo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border border-texto/70 bg-fondo/70 px-1.5 py-0.5 text-[0.65rem] font-bold tracking-[0.18em] text-texto ${className}`}
      title="Corto de ejemplo"
    >
      {textos.demo}
    </span>
  );
}

export function EtiquetaNuevo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm bg-rojo px-1.5 py-0.5 text-[0.65rem] font-bold tracking-wider text-white uppercase ${className}`}
    >
      {textos.nuevo}
    </span>
  );
}

export function EtiquetaPremio({ texto, className = "" }: { texto?: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-dorado ${className}`}>
      <Icono nombre="premio" className="size-3.5 shrink-0" />
      {texto && <span className="text-xs font-semibold">{texto}</span>}
    </span>
  );
}
