"use client";

import { useEffect, useState } from "react";
import { supabaseActivo } from "@/lib/supabase/config";

export type Estadisticas = { vistas: number; meGusta: number };

/**
 * Vistas y “me gusta” de un corto (solo si la fase 2 está activa).
 * Cambiar `revision` vuelve a pedirlas (por ejemplo, después de un “me gusta”).
 */
export function useEstadisticas(id: string, revision = 0) {
  const [datos, setDatos] = useState<Estadisticas | null>(null);
  useEffect(() => {
    if (!supabaseActivo) return;
    let vigente = true;
    fetch(`/api/estadisticas?id=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Estadisticas | null) => {
        if (vigente && d) setDatos(d);
      })
      .catch(() => {});
    return () => {
      vigente = false;
    };
  }, [id, revision]);
  return [datos, setDatos] as const;
}

/** Cuenta una vista por corto y por sesión del navegador. */
export function registrarVista(id: string) {
  if (!supabaseActivo) return;
  const clave = `infocine:vista:${id}`;
  try {
    if (sessionStorage.getItem(clave)) return;
    sessionStorage.setItem(clave, "1");
  } catch {
    // Sin sessionStorage igual se cuenta.
  }
  fetch("/api/estadisticas", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, accion: "vista" }),
    keepalive: true,
  }).catch(() => {});
}

export async function enviarMeGusta(id: string, sumar: boolean): Promise<number | null> {
  try {
    const r = await fetch("/api/estadisticas", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, accion: sumar ? "me-gusta" : "quitar-me-gusta" }),
    });
    const d = (await r.json()) as { meGusta?: number };
    return typeof d.meGusta === "number" ? d.meGusta : null;
  } catch {
    return null;
  }
}
