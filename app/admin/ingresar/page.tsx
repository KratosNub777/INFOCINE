import { Suspense } from "react";
import { FormularioIngreso } from "@/components/admin/FormularioIngreso";
import { PanelSinConfigurar } from "@/components/admin/Avisos";
import { supabaseActivo } from "@/lib/supabase/config";

export const metadata = { title: "Ingresar al panel" };

export default function PaginaIngresar({ searchParams }: PageProps<"/admin/ingresar">) {
  if (!supabaseActivo) return <PanelSinConfigurar />;
  return (
    <div className="mx-auto mt-6 max-w-md rounded-2xl bg-superficie p-8 ring-1 ring-borde">
      <h1 className="titular text-titulo text-texto">Ingresar</h1>
      <p className="mt-2 text-sm text-texto-suave">Para profesores que cargan y editan los cortometrajes.</p>
      <Suspense fallback={<FormularioIngreso errorEnlace={false} />}>
        <Formulario searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Formulario({ searchParams }: Pick<PageProps<"/admin/ingresar">, "searchParams">) {
  const { error } = await searchParams;
  return <FormularioIngreso errorEnlace={error === "enlace"} />;
}
