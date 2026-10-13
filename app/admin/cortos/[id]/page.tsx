import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { FormularioCorto } from "@/components/admin/FormularioCorto";
import { PanelSinConfigurar, SinPermiso } from "@/components/admin/Avisos";
import { supabaseActivo } from "@/lib/supabase/config";
import { filaACorto, type FilaCorto } from "@/lib/supabase/filas";
import { sesionActual } from "@/lib/supabase/servidor";

export const metadata = { title: "Editar corto" };

export default function PaginaEditar({ params }: PageProps<"/admin/cortos/[id]">) {
  if (!supabaseActivo) return <PanelSinConfigurar />;
  return (
    <Suspense>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }: Pick<PageProps<"/admin/cortos/[id]">, "params">) {
  await connection();
  const { id } = await params;
  const { supabase, usuario, esEditor } = await sesionActual();
  if (!usuario) redirect("/admin/ingresar");
  if (!esEditor) return <SinPermiso email={usuario.email} />;

  const { data } = await supabase.from("cortos").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const fila = data as FilaCorto;
  const hoy = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Asuncion" });
  return (
    <>
      <h1 className="titular mb-6 text-titulo text-texto">Editar “{fila.titulo}”</h1>
      <FormularioCorto corto={{ ...filaACorto(fila), publicado: fila.publicado }} hoy={hoy} />
    </>
  );
}
