import type { Metadata } from "next";
import { obtenerCatalogo } from "@/lib/datos";
import { Fila } from "@/components/Fila";
import { Encabezado } from "@/components/Encabezado";
import { sitio, textos } from "@/config/sitio";

export const metadata: Metadata = {
  title: "Por año",
  description: `Cortometrajes del ${sitio.colegio} agrupados por año.`,
  alternates: { canonical: "/por-anio" },
};

export default async function PaginaPorAnio() {
  const grupos = (await obtenerCatalogo()).agruparPorAnio();
  return (
    <>
      <Encabezado titulo="Por año">Los cortos de cada año, del más reciente al más antiguo.</Encabezado>
      <div className="mt-6 space-y-[clamp(1.25rem,3vw,2.75rem)]">
        {grupos.map((g, i) => (
          <Fila
            key={g.clave}
            titulo={textos.filas.anio(Number(g.clave))}
            cortos={g.cortos}
            verTodo={`/cortometrajes?anio=${g.clave}`}
            indice={i}
          />
        ))}
      </div>
    </>
  );
}
