import Image from "next/image";
import { rutaEscudo } from "@/lib/escudo";
import { sitio } from "@/config/sitio";

/**
 * Escudo oficial del colegio, tomado de public/logo/.
 * Si todavía no se copió el archivo, se muestra un espacio reservado neutro
 * (no se dibuja ni se inventa el escudo).
 */
export function Escudo({ tamano = 36, className = "" }: { tamano?: number; className?: string }) {
  if (!rutaEscudo) {
    return (
      <span
        className={`inline-grid shrink-0 place-items-center rounded-full border border-dashed border-texto-suave/60 text-[0.5rem] font-semibold uppercase tracking-wider text-texto-suave ${className}`}
        style={{ width: tamano, height: tamano }}
        title="Falta el escudo: copiá la imagen en public/logo/"
        aria-hidden="true"
      >
        {tamano >= 44 ? "Escudo" : ""}
      </span>
    );
  }
  return (
    <Image
      src={rutaEscudo}
      alt={`Escudo del ${sitio.colegio}`}
      width={tamano}
      height={tamano}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: tamano, height: tamano }}
      unoptimized={rutaEscudo.endsWith(".svg")}
    />
  );
}

/** Escudo + “Colegio Técnico Nacional · Asunción”. */
export function FirmaColegio({ tamano = 32, className = "" }: { tamano?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-texto-suave ${className}`}>
      <Escudo tamano={tamano} />
      <span className="text-[0.7rem] leading-tight font-medium tracking-wide uppercase">
        {sitio.colegio} · {sitio.ciudad}
      </span>
    </span>
  );
}
