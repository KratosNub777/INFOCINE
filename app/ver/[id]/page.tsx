import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buscarCorto, siguienteCorto, todosLosCortos } from "@/lib/cortos";
import { Reproductor } from "@/components/Reproductor";

export function generateStaticParams() {
  return todosLosCortos().map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/ver/[id]">): Promise<Metadata> {
  const { id } = await params;
  const corto = buscarCorto(id);
  return {
    title: corto ? `Ver “${corto.titulo}”` : "Reproductor",
    alternates: corto ? { canonical: `/corto/${corto.id}` } : undefined,
    robots: { index: false, follow: true },
  };
}

export default async function PaginaVer({ params }: PageProps<"/ver/[id]">) {
  const { id } = await params;
  const corto = buscarCorto(id);
  if (!corto) notFound();
  return <Reproductor corto={corto} siguiente={siguienteCorto(corto)} />;
}
