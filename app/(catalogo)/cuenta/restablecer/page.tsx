import type { Metadata } from "next";
import { Encabezado } from "@/components/Encabezado";
import { FormularioNuevaContrasena } from "@/components/FormularioNuevaContrasena";

export const metadata: Metadata = {
  title: "Nueva contraseña",
  robots: { index: false },
};

/** Destino del enlace “Recuperá tu contraseña”. La sesión se lee en el navegador. */
export default function PaginaRestablecer() {
  return (
    <>
      <Encabezado titulo="Nueva contraseña">Elegí una contraseña nueva para tu cuenta de Infocine.</Encabezado>
      <div className="px-[var(--gutter)] pb-16">
        <FormularioNuevaContrasena />
      </div>
    </>
  );
}
