"use client";

import { useMeGusta } from "@/lib/almacen";
import { enviarMeGusta, useEstadisticas } from "@/lib/estadisticas";
import { supabaseActivo } from "@/lib/supabase/config";
import { Icono } from "./Icono";

const numero = new Intl.NumberFormat("es-PY");

/** “Me gusta” anónimo (fase 2). No se muestra si Supabase no está configurado. */
export function BotonMeGusta({ id, titulo }: { id: string; titulo: string }) {
  const { tiene, marcar } = useMeGusta();
  const [stats, setStats] = useEstadisticas(id);
  if (!supabaseActivo) return null;
  const marcado = tiene(id);

  async function alternar() {
    const sumar = !marcado;
    marcar(id, sumar);
    // Se actualiza al instante y después se confirma con el servidor.
    setStats((s) => (s ? { ...s, meGusta: Math.max(0, s.meGusta + (sumar ? 1 : -1)) } : s));
    const total = await enviarMeGusta(id, sumar);
    if (total !== null) setStats((s) => (s ? { ...s, meGusta: total } : { vistas: 0, meGusta: total }));
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
