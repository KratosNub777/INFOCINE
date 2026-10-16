import type { ReactNode } from "react";
import { Encabezado } from "./Encabezado";

/** Formato común de Privacidad y Términos: título, fecha y secciones numeradas. */
export function TextoLegal({
  titulo,
  actualizado,
  children,
}: {
  titulo: string;
  /** Fecha de la última actualización, por ejemplo "16 de octubre de 2026". */
  actualizado: string;
  children: ReactNode;
}) {
  return (
    <>
      <Encabezado titulo={titulo}>Última actualización: {actualizado}.</Encabezado>
      <article className="max-w-3xl space-y-8 px-[var(--gutter)] pt-8 pb-8 text-cuerpo text-texto-suave [&_a]:font-semibold [&_a]:text-dorado [&_a:hover]:underline [&_strong]:text-texto [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </article>
    </>
  );
}

export function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="titular text-2xl text-texto">{titulo}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
