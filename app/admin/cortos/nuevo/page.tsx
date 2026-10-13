import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormularioCorto } from "@/components/admin/FormularioCorto";
import { PanelSinConfigurar, SinPermiso } from "@/components/admin/Avisos";
import { supabaseActivo } from "@/lib/supabase/config";
import { sesionActual } from "@/lib/supabase/servidor";

export const metadata = { title: "Nuevo corto" };

export default function PaginaNuevo() {
  if (!supabaseActivo) return <PanelSinConfigurar />;
  return (
    <>
      <h1 className="titular mb-6 text-titulo text-texto">Nuevo corto</h1>
      <Suspense>
        <Contenido />
      </Suspense>
    </>
  );
}

async function Contenido() {
  await connection();
  const { usuario, esEditor } = await sesionActual();
  if (!usuario) redirect("/admin/ingresar");
  if (!esEditor) return <SinPermiso email={usuario.email} />;
  // Fecha de hoy en Paraguay (AAAA-MM-DD)
  const hoy = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Asuncion" });
  return <FormularioCorto hoy={hoy} />;
}
