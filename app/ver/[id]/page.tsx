import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { idsDeCortos, obtenerCatalogo } from "@/lib/datos";
import { Reproductor } from "@/components/Reproductor";

export function generateStaticParams() {
  return idsDeCortos();
}

export async function generateMetadata({ params }: PageProps<"/ver/[id]">): Promise<Metadata> {
  const { id } = await params;
  const corto = (await obtenerCatalogo()).porId(id);
  return {
    title: corto ? `Ver “${corto.titulo}”` : "Reproductor",
    alternates: corto ? { canonical: `/corto/${corto.id}` } : undefined,
    robots: { index: false, follow: true },
  };
}

export default async function PaginaVer({ params }: PageProps<"/ver/[id]">) {
  const { id } = await params;
  const catalogo = await obtenerCatalogo();
  const corto = catalogo.porId(id);
  if (!corto) notFound();
  return <Reproductor corto={corto} recomendados={catalogo.recomendados(corto)} />;
}
