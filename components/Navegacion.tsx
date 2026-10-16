"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { generos, navegacion, textos } from "@/config/sitio";
import { BotonCuenta } from "./BotonCuenta";
import { useCatalogo } from "./ContextoCatalogo";
import { useInterfaz } from "./Proveedores";
import { Icono, type NombreIcono } from "./Icono";

function activa(ruta: string | null, href: string) {
  if (!ruta) return false;
  return href === "/" ? ruta === "/" : ruta.startsWith(href);
}

/* ───────────── Header fijo ───────────── */

export function Header({ marca }: { marca: ReactNode }) {
  const { abrirBuscador } = useInterfaz();
  const [opaco, setOpaco] = useState(false);

  useEffect(() => {
    const medir = () => setOpaco(window.scrollY > 24);
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    return () => window.removeEventListener("scroll", medir);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-[var(--alto-header)]">
      {/* Capas de fondo: solo cambia la opacidad */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent" />
      <div
        aria-hidden="true"
        className={`absolute inset-0 border-b border-white/5 bg-fondo/92 shadow-lg shadow-black/30 backdrop-blur-md transition-opacity duration-300 ${opaco ? "opacity-100" : "opacity-0"}`}
      />
      <div className="relative flex h-full items-center gap-4 px-[var(--gutter)] lg:gap-8">
        {marca}
        <nav aria-label="Principal" className="hidden md:block">
          <Suspense fallback={<EnlacesHeader ruta={null} />}>
            <EnlacesHeaderActivos />
          </Suspense>
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            data-nav
            onClick={abrirBuscador}
            aria-label={`${textos.buscar} (atajo: /)`}
            className="grid size-11 place-items-center rounded-full text-texto transition-colors hover:bg-white/10"
          >
            <Icono nombre="buscar" className="size-6" />
          </button>
          <MenuFiltros />
          <BotonCuenta />
        </div>
      </div>
    </header>
  );
}

function EnlacesHeaderActivos() {
  return <EnlacesHeader ruta={usePathname()} />;
}

function EnlacesHeader({ ruta }: { ruta: string | null }) {
  return (
    <ul className="flex items-center gap-1 lg:gap-2">
      {navegacion.map((item) => {
        const es = activa(ruta, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              data-nav
              aria-current={es ? "page" : undefined}
              className={`relative rounded-md px-2.5 py-2 text-[0.95rem] font-semibold transition-colors lg:px-3 ${
                es ? "text-texto" : "text-texto-suave hover:text-texto"
              }`}
            >
              {item.etiqueta}
              <span
                aria-hidden="true"
                className={`absolute inset-x-2.5 -bottom-0.5 h-0.5 origin-center rounded-full bg-rojo transition-transform duration-300 lg:inset-x-3 ${es ? "scale-x-100" : "scale-x-0"}`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* ───────────── Menú de filtros ───────────── */

function MenuFiltros() {
  const catalogo = useCatalogo();
  const panel = useRef<HTMLDivElement>(null);
  const cerrar = () => panel.current?.hidePopover();
  const grupos: { titulo: string; items: { etiqueta: string; href: string }[] }[] = [
    {
      titulo: "Género",
      items: catalogo.generosDisponibles().map((g) => ({ etiqueta: generos[g], href: `/cortometrajes?genero=${g}` })),
    },
    {
      titulo: "Año",
      items: catalogo.aniosDisponibles().map((a) => ({ etiqueta: String(a), href: `/cortometrajes?anio=${a}` })),
    },
  ];

  return (
    <>
      <button
        type="button"
        data-nav
        popoverTarget="menu-filtros"
        aria-label={textos.filtros}
        className="inline-flex size-11 items-center justify-center gap-1.5 rounded-full text-texto transition-colors hover:bg-white/10 sm:w-auto sm:px-3"
      >
        <Icono nombre="filtros" className="size-6" />
        <span className="hidden text-sm font-semibold sm:inline">{textos.filtros}</span>
      </button>
      <div
        ref={panel}
        id="menu-filtros"
        popover="auto"
        className="fixed top-[calc(var(--alto-header)-0.25rem)] right-[var(--gutter)] left-auto m-0 max-h-[75svh] w-[min(24rem,calc(100vw-2*var(--gutter)))] overflow-y-auto rounded-xl bg-superficie p-4 text-texto shadow-2xl shadow-black ring-1 ring-borde"
      >
        <p className="titular text-lg">Explorar por…</p>
        {grupos.map((g) => (
          <div key={g.titulo} className="mt-3">
            <p className="text-xs font-bold tracking-wider text-texto-suave uppercase">{g.titulo}</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {g.items.map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    data-nav
                    onClick={cerrar}
                    className="inline-flex min-h-9 items-center rounded-full bg-superficie-alta px-3 text-sm font-medium ring-1 ring-borde transition-colors hover:bg-azul hover:ring-azul"
                  >
                    {i.etiqueta}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Link
          href="/cortometrajes"
          data-nav
          onClick={cerrar}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-dorado hover:underline"
        >
          Ver todos los cortometrajes <Icono nombre="derecha" className="size-4" />
        </Link>
      </div>
    </>
  );
}

/* ───────────── Navegación inferior (celular) ───────────── */

export function NavInferior() {
  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-fondo/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <Suspense fallback={<EnlacesInferiores ruta={null} />}>
        <EnlacesInferioresActivos />
      </Suspense>
    </nav>
  );
}

function EnlacesInferioresActivos() {
  return <EnlacesInferiores ruta={usePathname()} />;
}

function EnlacesInferiores({ ruta }: { ruta: string | null }) {
  const { abrirBuscador } = useInterfaz();
  const clase = (es: boolean) =>
    `flex h-16 flex-col items-center justify-center gap-1 text-[0.68rem] font-semibold transition-colors ${es ? "text-texto" : "text-texto-suave"}`;
  const items = navegacion;

  return (
    <ul className="grid grid-cols-5">
      {items.slice(0, 3).map((item) => (
        <ItemInferior key={item.href} item={item} es={activa(ruta, item.href)} clase={clase} />
      ))}
      <li>
        <button type="button" onClick={abrirBuscador} className={`${clase(false)} w-full`}>
          <Icono nombre="buscar" className="size-6" />
          {textos.buscar}
        </button>
      </li>
      {items.slice(3).map((item) => (
        <ItemInferior key={item.href} item={item} es={activa(ruta, item.href)} clase={clase} />
      ))}
    </ul>
  );
}

function ItemInferior({
  item,
  es,
  clase,
}: {
  item: (typeof navegacion)[number];
  es: boolean;
  clase: (es: boolean) => string;
}) {
  return (
    <li>
      <Link href={item.href} aria-current={es ? "page" : undefined} className={clase(es)}>
        <span className="relative">
          <Icono nombre={item.icono as NombreIcono} className="size-6" />
          <span
            aria-hidden="true"
            className={`absolute -top-2 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-rojo transition-transform ${es ? "scale-x-100" : "scale-x-0"}`}
          />
        </span>
        {item.etiqueta}
      </Link>
    </li>
  );
}
