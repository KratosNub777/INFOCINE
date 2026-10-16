"use client";

import { useEstadisticas } from "@/lib/estadisticas";
import { supabaseActivo } from "@/lib/supabase/config";
import { useMeGusta } from "./ContextoCuenta";
import { Icono } from "./Icono";

const numero = new Intl.NumberFormat("es-PY");

/**
 * “Me gusta” de la cuenta (fase 2). Sin sesión, abre el ingreso y el “me gusta”
 * se guarda solo al entrar. No se muestra si Supabase no está configurado.
 */
export function BotonMeGusta({ id, titulo }: { id: string; titulo: string }) {
  const { tiene, alternar: alternarCuenta, revision } = useMeGusta();
  // Se vuelve a leer el total cada vez que se confirma un “me gusta”.
  const [stats, setStats] = useEstadisticas(id, revision);
  if (!supabaseActivo) return null;
  const marcado = tiene(id);

  function alternar() {
    if (!alternarCuenta(id)) return;
    // Se actualiza al instante; el total real llega al confirmar.
    const paso = marcado ? -1 : 1;
    setStats((s) => (s ? { ...s, meGusta: Math.max(0, s.meGusta + paso) } : s));
  }

  return (
    <button
      type="button"
      data-nav
      onClick={alternar}
      aria-pressed={marcado}
      aria-label={`${marcado ? "Quitar me gusta" : "Me gusta"}: ${titulo}`}
      className="inline-flex min-h-12 items-center gap-2 rounded-md bg-superficie-alta/80 px-4 font-semibold text-texto ring-1 ring-texto/25 backdrop-blur transition-colors hover:bg-superficie-alta hover:ring-texto/60"
    >
      <Icono
        nombre={marcado ? "corazonLleno" : "corazon"}
        className={`size-5 transition-transform duration-300 ${marcado ? "scale-110 text-rojo-texto" : ""}`}
      />
      <span aria-hidden="true" className="tabular-nums">
        {stats ? numero.format(stats.meGusta) : "Me gusta"}
      </span>
    </button>
  );
}

/** “123 vistas” (fase 2). */
export function ContadorVistas({ id }: { id: string }) {
  const [stats] = useEstadisticas(id);
  if (!supabaseActivo || !stats) return null;
  return (
    <span className="inline-flex items-center gap-1 text-texto-suave">
      <Icono nombre="ojo" className="size-4" />
      {numero.format(stats.vistas)} {stats.vistas === 1 ? "vista" : "vistas"}
    </span>
  );
}
