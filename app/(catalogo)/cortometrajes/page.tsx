import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalogo } from "@/components/Catalogo";
import { Encabezado } from "@/components/Encabezado";
import { EsqueletoGrilla } from "@/components/Esqueletos";
import { sitio } from "@/config/sitio";

export const metadata: Metadata = {
  title: "Cortometrajes",
  description: `Todos los cortometrajes del ${sitio.colegio}, por género, curso y año.`,
  alternates: { canonical: "/cortometrajes" },
};

export default function PaginaCortometrajes() {
  return (
    <>
      <Encabezado titulo="Cortometrajes">Filtrá por género, curso o año.</Encabezado>
      <div className="px-[var(--gutter)] pt-6">
        <Suspense fallback={<EsqueletoGrilla />}>
          <Catalogo />
        </Suspense>
      </div>
    </>
  );
}
