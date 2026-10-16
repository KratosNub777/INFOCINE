"use client";

import Link from "next/link";
import { useRef } from "react";
import { useCuenta } from "./ContextoCuenta";
import { Icono } from "./Icono";

/** Cabecera: “Ingresar” o el avatar con su menú (Mi lista, Cerrar sesión). */
export function BotonCuenta() {
  const { estado, usuario, abrirIngreso, salir } = useCuenta();
  const menu = useRef<HTMLDivElement>(null);
  const confirmacion = useRef<HTMLDialogElement>(null);

  if (estado === "desactivado") return null;

  if (!usuario) {
    if (estado === "cargando")
      return <span aria-hidden="true" className="size-11 animate-pulse rounded-full bg-white/10" />;
    return (
      <button
        type="button"
        data-nav
        onClick={() => abrirIngreso()}
        aria-label="Ingresar"
        className="inline-flex size-11 items-center justify-center gap-2 rounded-full text-texto ring-1 ring-texto/30 transition-colors hover:bg-white/10 hover:ring-texto/60 sm:w-auto sm:rounded-md sm:px-4"
      >
        <Icono nombre="usuario" className="size-5" />
        <span className="hidden text-sm font-semibold sm:inline">Ingresar</span>
      </button>
    );
  }

  const datos = usuario.user_metadata as { full_name?: string; name?: string } | undefined;
  const nombre = datos?.full_name || datos?.name || usuario.email || "Tu cuenta";
  const inicial = nombre.trim().charAt(0).toUpperCase() || "?";
  const cerrar = () => menu.current?.hidePopover();

  return (
    <>
      <button
        type="button"
        data-nav
        popoverTarget="menu-cuenta"
        aria-label={`Tu cuenta: ${nombre}`}
        className="grid size-11 place-items-center rounded-full transition-transform hover:scale-105"
      >
        <span className="grid size-9 place-items-center rounded-full bg-rojo text-base font-bold text-white ring-2 ring-texto/20">
          {inicial}
        </span>
      </button>
      <div
        ref={menu}
        id="menu-cuenta"
        popover="auto"
        className="fixed top-[calc(var(--alto-header)-0.25rem)] right-[var(--gutter)] left-auto m-0 w-[min(18rem,calc(100vw-2*var(--gutter)))] rounded-xl bg-superficie p-2 text-texto shadow-2xl shadow-black ring-1 ring-borde"
      >
        <div className="flex items-center gap-3 border-b border-borde px-2 pt-1 pb-3">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-rojo font-bold text-white"
          >
            {inicial}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{nombre}</p>
            {usuario.email && nombre !== usuario.email && (
              <p className="truncate text-xs text-texto-suave">{usuario.email}</p>
            )}
          </div>
        </div>
        <ul className="pt-2">
          <li>
            <Link
              href="/mi-lista"
              onClick={cerrar}
              className="flex min-h-11 items-center gap-3 rounded-md px-3 font-medium transition-colors hover:bg-superficie-alta"
            >
              <Icono nombre="lista" className="size-5" /> Mi lista
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                cerrar();
                confirmacion.current?.showModal();
              }}
              className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 font-medium transition-colors hover:bg-superficie-alta"
            >
              <Icono nombre="salir" className="size-5" /> Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
      {/* Confirmación antes de cerrar sesión (<dialog> nativo: Escape cancela). */}
      <dialog
        ref={confirmacion}
        aria-labelledby="confirmar-salir-titulo"
        aria-describedby="confirmar-salir-texto"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="m-auto w-[min(24rem,calc(100vw-2*var(--gutter)))] rounded-xl bg-superficie p-6 text-texto shadow-2xl shadow-black ring-1 ring-borde backdrop:bg-black/75"
      >
        <h2 id="confirmar-salir-titulo" className="text-lg font-bold">
          ¿Cerrar sesión?
        </h2>
        <p id="confirmar-salir-texto" className="mt-2 text-sm text-texto-suave">
          ¿Estás seguro de que querés cerrar sesión?
        </p>
        <form method="dialog" className="mt-6 flex justify-end gap-3">
          <button
            type="submit"
            autoFocus
            className="min-h-11 rounded-md px-4 font-semibold ring-1 ring-texto/30 transition-colors hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={() => void salir()}
            className="min-h-11 rounded-md bg-rojo px-4 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Cerrar sesión
          </button>
        </form>
      </dialog>
    </>
  );
}
