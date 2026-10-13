import type { Metadata } from "next";
import { GrillaMiLista } from "@/components/Catalogo";
import { Encabezado } from "@/components/Encabezado";

export const metadata: Metadata = {
  title: "Mi lista",
  robots: { index: false },
};

export default function PaginaMiLista() {
  return (
    <>
      <Encabezado titulo="Mi lista">Tus cortos guardados en este dispositivo.</Encabezado>
      <div className="px-[var(--gutter)]">
        <GrillaMiLista />
      </div>
    </>
  );
}
