import type { Metadata } from "next";
import { agruparPorCurso } from "@/lib/cortos";
import { Fila } from "@/components/Fila";
import { Encabezado } from "@/components/Encabezado";
import { sitio } from "@/config/sitio";

export const metadata: Metadata = {
  title: "Por curso",
  description: `Cortometrajes del ${sitio.colegio} agrupados por curso y sección.`,
  alternates: { canonical: "/por-curso" },
};

export default function PaginaPorCurso() {
  const grupos = agruparPorCurso();
  return (
    <>
      <Encabezado titulo="Por curso y sección">Los cortos de cada curso, del más reciente al más antiguo.</Encabezado>
      <div className="mt-6 space-y-[clamp(1.25rem,3vw,2.75rem)]">
        {grupos.map((g, i) => (
          <Fila
            key={g.clave}
            titulo={g.titulo}
            cortos={g.cortos}
            verTodo={`/cortometrajes?curso=${encodeURIComponent(g.clave)}`}
            indice={i}
          />
        ))}
      </div>
    </>
  );
}
