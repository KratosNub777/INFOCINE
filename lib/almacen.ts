"use client";

/**
 * “Mi lista” y “Seguir viendo” se guardan solo en este navegador
 * (localStorage). No hay cuentas ni se envía nada a ningún servidor.
 */
import { useSyncExternalStore } from "react";

const CLAVE_LISTA = "infocine:mi-lista";
const CLAVE_PROGRESO = "infocine:progreso";
const EVENTO = "infocine:almacen";

export type Progreso = { segundos: number; duracion: number; actualizado: number };
type MapaProgreso = Record<string, Progreso>;

function leer<T>(clave: string, vacio: T): T {
  try {
    const crudo = window.localStorage.getItem(clave);
    return crudo ? (JSON.parse(crudo) as T) : vacio;
  } catch {
    return vacio;
  }
}

function escribir(clave: string, valor: unknown) {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Modo privado o almacenamiento lleno: seguimos sin guardar.
  }
  cache.delete(clave);
  window.dispatchEvent(new Event(EVENTO));
}

// useSyncExternalStore necesita la misma referencia mientras no cambie el dato.
const cache = new Map<string, { crudo: string | null; valor: unknown }>();
function instantanea<T>(clave: string, vacio: T): T {
  let crudo: string | null = null;
  try {
    crudo = window.localStorage.getItem(clave);
  } catch {
    /* sin acceso */
  }
  const previo = cache.get(clave);
  if (previo && previo.crudo === crudo) return previo.valor as T;
  const valor = crudo ? leer(clave, vacio) : vacio;
  cache.set(clave, { crudo, valor });
  return valor;
}

function suscribir(aviso: () => void) {
  const alCambiar = (e: Event) => {
    if (e instanceof StorageEvent) cache.clear();
    aviso();
  };
  window.addEventListener(EVENTO, alCambiar);
  window.addEventListener("storage", alCambiar);
  return () => {
    window.removeEventListener(EVENTO, alCambiar);
    window.removeEventListener("storage", alCambiar);
  };
}

const LISTA_VACIA: string[] = [];
const PROGRESO_VACIO: MapaProgreso = {};

export function useMiLista() {
  const ids = useSyncExternalStore(
    suscribir,
    () => instantanea(CLAVE_LISTA, LISTA_VACIA),
    () => LISTA_VACIA,
  );
  return {
    ids,
    tiene: (id: string) => ids.includes(id),
    alternar: (id: string) => {
      const actual = leer<string[]>(CLAVE_LISTA, []);
      escribir(CLAVE_LISTA, actual.includes(id) ? actual.filter((x) => x !== id) : [id, ...actual]);
    },
  };
}

export function useProgreso() {
  return useSyncExternalStore(
    suscribir,
    () => instantanea(CLAVE_PROGRESO, PROGRESO_VACIO),
    () => PROGRESO_VACIO,
  );
}

export function leerProgreso(id: string): Progreso | undefined {
  return leer<MapaProgreso>(CLAVE_PROGRESO, {})[id];
}

export function guardarProgreso(id: string, segundos: number, duracion: number) {
  if (!duracion || segundos < 1) return;
  const mapa = leer<MapaProgreso>(CLAVE_PROGRESO, {});
  // Al llegar casi al final se considera visto y sale de “Seguir viendo”.
  if (segundos / duracion > 0.95) delete mapa[id];
  else mapa[id] = { segundos: Math.floor(segundos), duracion, actualizado: Date.now() };
  escribir(CLAVE_PROGRESO, mapa);
}

/** IDs para “Seguir viendo”, del más reciente al más viejo. */
export function idsSeguirViendo(mapa: MapaProgreso): { id: string; porcentaje: number }[] {
  return Object.entries(mapa)
    .filter(([, p]) => p.segundos > 3)
    .sort(([, a], [, b]) => b.actualizado - a.actualizado)
    .map(([id, p]) => ({ id, porcentaje: Math.min(100, (p.segundos / p.duracion) * 100) }));
}
