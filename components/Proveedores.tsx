"use client";

import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { FichaModal } from "./FichaModal";
import { Buscador } from "./Buscador";
import { ProveedorCatalogo } from "./ContextoCatalogo";
import type { Corto } from "@/lib/cortos";

type Interfaz = {
  fichaId: string | null;
  abrirFicha: (id: string) => void;
  cerrarFicha: () => void;
  buscadorAbierto: boolean;
  abrirBuscador: () => void;
  cerrarBuscador: () => void;
};

const Contexto = createContext<Interfaz | null>(null);

export function useInterfaz() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useInterfaz debe usarse dentro de <Proveedores>");
  return ctx;
}

export function Proveedores({ cortos, children }: { cortos: Corto[]; children: ReactNode }) {
  const [fichaId, setFichaId] = useState<string | null>(null);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);

  const abrirFicha = useCallback((id: string) => {
    setBuscadorAbierto(false);
    setFichaId(id);
  }, []);
  const cerrarFicha = useCallback(() => setFichaId(null), []);
  const abrirBuscador = useCallback(() => setBuscadorAbierto(true), []);
  const cerrarBuscador = useCallback(() => setBuscadorAbierto(false), []);

  const cerrarTodo = useCallback(() => {
    setFichaId(null);
    setBuscadorAbierto(false);
  }, []);

  const valor = useMemo(
    () => ({ fichaId, abrirFicha, cerrarFicha, buscadorAbierto, abrirBuscador, cerrarBuscador }),
    [fichaId, abrirFicha, cerrarFicha, buscadorAbierto, abrirBuscador, cerrarBuscador],
  );

  useNavegacionEspacial();
  useAtajoBuscar(abrirBuscador);

  return (
    <MotionConfig reducedMotion="user">
      <ProveedorCatalogo cortos={cortos}>
        <Contexto.Provider value={valor}>
          {children}
          <FichaModal />
          <Buscador />
          <Suspense>
            <CerrarAlNavegar alNavegar={cerrarTodo} />
          </Suspense>
        </Contexto.Provider>
      </ProveedorCatalogo>
    </MotionConfig>
  );
}

/** Al ir a otra página (por ejemplo “Ver ahora”), se cierran la ficha y el buscador. */
function CerrarAlNavegar({ alNavegar }: { alNavegar: () => void }) {
  const ruta = usePathname();
  useEffect(() => {
    alNavegar();
  }, [ruta, alNavegar]);
  return null;
}

/** “/” abre el buscador, como en muchas plataformas. */
function useAtajoBuscar(abrir: () => void) {
  useEffect(() => {
    function alPresionar(e: KeyboardEvent) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (document.querySelector("dialog[open]")) return;
      e.preventDefault();
      abrir();
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [abrir]);
}

/**
 * Navegación con flechas para teclado y control remoto de TV.
 * Los elementos con el atributo data-nav forman una grilla: las flechas
 * mueven el foco al elemento más cercano en esa dirección. Enter activa.
 * Dentro de una fila (data-nav-fila) izquierda/derecha no salta de fila.
 */
function useNavegacionEspacial() {
  useEffect(() => {
    const direcciones = { ArrowLeft: "izq", ArrowRight: "der", ArrowUp: "arr", ArrowDown: "aba" } as const;

    function alPresionar(e: KeyboardEvent) {
      const dir = direcciones[e.key as keyof typeof direcciones];
      if (!dir || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const actual = document.activeElement as HTMLElement | null;
      if (!actual?.matches("[data-nav]")) return;

      const dialogo = actual.closest("dialog[open]");
      const ambito: ParentNode = dialogo ?? document;
      const r = actual.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const fila = actual.closest("[data-nav-fila]");
      const horizontal = dir === "izq" || dir === "der";

      let mejor: HTMLElement | null = null;
      let mejorPuntaje = Infinity;
      for (const el of ambito.querySelectorAll<HTMLElement>("[data-nav]")) {
        if (el === actual) continue;
        if (!dialogo && el.closest("dialog")) continue;
        if (horizontal && fila && el.closest("[data-nav-fila]") !== fila) continue;
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        const bx = b.left + b.width / 2;
        const by = b.top + b.height / 2;
        const dx = bx - cx;
        const dy = by - cy;
        let principal: number;
        let secundario: number;
        if (dir === "der") [principal, secundario] = [dx, dy];
        else if (dir === "izq") [principal, secundario] = [-dx, dy];
        else if (dir === "aba") [principal, secundario] = [dy, dx];
        else [principal, secundario] = [-dy, dx];
        if (principal <= 4) continue;
        // Para arriba/abajo preferimos lo que está a la vista en pantalla.
        const fuera = !horizontal && (b.right < 0 || b.left > window.innerWidth) ? 4000 : 0;
        const puntaje = principal + Math.abs(secundario) * (horizontal ? 3 : 0.6) + fuera;
        if (puntaje < mejorPuntaje) [mejor, mejorPuntaje] = [el, puntaje];
      }
      if (!mejor) return;
      e.preventDefault();
      const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      mejor.focus({ preventScroll: true });
      mejor.scrollIntoView({ block: "nearest", inline: "nearest", behavior: suave ? "smooth" : "auto" });
      if (!horizontal) {
        const top = mejor.getBoundingClientRect().top;
        const alto =
          parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--alto-header")) * 16 || 72;
        if (!dialogo && top < alto + 8) window.scrollBy({ top: top - alto - 24, behavior: suave ? "smooth" : "auto" });
      }
    }

    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, []);
}
