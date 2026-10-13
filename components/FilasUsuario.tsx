"use client";

import { textos } from "@/config/sitio";
import { idsSeguirViendo, useMiLista, useProgreso } from "@/lib/almacen";
import { buscarCorto, type Corto } from "@/lib/cortos";
import { Fila } from "./Fila";

const existe = (c: Corto | undefined): c is Corto => Boolean(c);

/** “Seguir viendo”: se arma con lo guardado en este navegador. */
export function FilaSeguirViendo() {
  const progreso = useProgreso();
  const items = idsSeguirViendo(progreso);
  const cortos = items.map((i) => buscarCorto(i.id)).filter(existe);
  const porcentajes = Object.fromEntries(items.map((i) => [i.id, i.porcentaje]));
  return <Fila titulo={textos.filas.seguirViendo} cortos={cortos} progresos={porcentajes} />;
}

export function FilaMiLista() {
  const { ids } = useMiLista();
  const cortos = ids.map(buscarCorto).filter(existe);
  return <Fila titulo={textos.filas.miLista} cortos={cortos} verTodo="/mi-lista" />;
}
