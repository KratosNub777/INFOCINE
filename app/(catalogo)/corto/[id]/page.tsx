import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sitio } from "@/config/sitio";
import { buscarCorto, cursoYSeccion, formatoDuracion, todosLosCortos } from "@/lib/cortos";
import { FichaContenido } from "@/components/FichaContenido";

export function generateStaticParams() {
  return todosLosCortos().map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/corto/[id]">): Promise<Metadata> {
  const { id } = await params;
  const corto = buscarCorto(id);
  if (!corto) return { title: "Corto no encontrado" };
  const descripcion = `${corto.sinopsis} · ${cursoYSeccion(corto)}, ${corto.anio}, ${formatoDuracion(corto.duracion)}.`;
  return {
    title: corto.titulo,
    description: descripcion,
    alternates: { canonical: `/corto/${corto.id}` },
    openGraph: {
      type: "video.other",
      locale: "es_PY",
      siteName: sitio.nombre,
      title: `${corto.titulo} · ${sitio.nombre}`,
      description: descripcion,
      url: `/corto/${corto.id}`,
    },
  };
}

export default async function PaginaCorto({ params }: PageProps<"/corto/[id]">) {
  const { id } = await params;
  const corto = buscarCorto(id);
  if (!corto) notFound();
  return (
    <div className="pt-[var(--alto-header)]">
      <FichaContenido corto={corto} />
    </div>
  );
}
