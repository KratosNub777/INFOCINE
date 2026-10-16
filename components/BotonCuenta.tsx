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
        className="fixed inset-0 m-0 h-full w-full"
      >
        <div
          className="grid h-full w-full place-items-center bg-black/70 px-[var(--gutter)] backdrop-blur-sm transition-opacity duration-200 starting:opacity-0"
          onClick={(e) => {
            if (e.target === e.currentTarget) confirmacion.current?.close();
          }}
        >
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-superficie px-6 pt-8 pb-6 text-center text-texto shadow-2xl shadow-black ring-1 ring-white/10 transition-[opacity,translate,scale] duration-300 ease-out motion-reduce:transition-none starting:translate-y-4 starting:scale-95 starting:opacity-0">
            {/* Resplandor rojo detrás del icono */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -top-24 mx-auto size-48 rounded-full bg-rojo/25 blur-3xl"
            />
            <span
              aria-hidden="true"
              className="relative mx-auto grid size-14 place-items-center rounded-full bg-rojo/15 text-rojo ring-1 ring-rojo/40"
            >
              <Icono nombre="salir" className="size-7" />
            </span>
            <h2 id="confirmar-salir-titulo" className="relative mt-5 text-xl font-bold">
              ¿Cerrar sesión?
            </h2>
            <p id="confirmar-salir-texto" className="relative mt-2 text-sm leading-relaxed text-texto-suave">
              ¿Estás seguro de que querés cerrar sesión
              {usuario.email ? (
                <>
                  {" "}
                  de <span className="font-semibold break-all text-texto">{usuario.email}</span>
                </>
              ) : null}
              ? Tu lista te va a estar esperando cuando vuelvas.
            </p>
            <form method="dialog" className="relative mt-7 grid grid-cols-2 gap-3">
              <button
                type="submit"
                autoFocus
                className="min-h-11 rounded-lg bg-white/5 px-4 font-semibold ring-1 ring-white/15 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={() => void salir()}
                className="min-h-11 rounded-lg bg-rojo px-4 font-semibold text-white shadow-lg shadow-rojo/30 transition-[filter,translate] hover:brightness-110 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texto"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
