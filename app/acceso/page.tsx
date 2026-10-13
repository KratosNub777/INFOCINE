import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { textos } from "@/config/sitio";
import { accesoActivado, destinoSeguro } from "@/lib/acceso";
import { Logo } from "@/components/Logo";
import { FirmaColegio } from "@/components/Escudo";
import { Icono } from "@/components/Icono";

export const metadata: Metadata = {
  title: "Acceso",
  robots: { index: false, follow: false },
};

export default function PaginaAcceso({ searchParams }: PageProps<"/acceso">) {
  return (
    <main className="grid min-h-svh place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-superficie/90 p-8 shadow-2xl shadow-black ring-1 ring-borde backdrop-blur">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo tamano="lg" />
          <FirmaColegio tamano={36} />
        </div>
        <Suspense>
          <Formulario searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function Formulario({ searchParams }: Pick<PageProps<"/acceso">, "searchParams">) {
  const parametros = await searchParams;
  const desde = destinoSeguro(typeof parametros.desde === "string" ? parametros.desde : "/");
  const error = parametros.error === "1";

  if (!accesoActivado()) {
    return (
      <div className="mt-8 text-center">
        <p className="text-texto-suave">{textos.acceso.libre}</p>
        <Link
          href="/"
          className="mt-4 inline-flex min-h-12 items-center rounded-md bg-rojo px-6 font-bold text-white hover:bg-rojo-hover"
        >
          Ir a Infocine
        </Link>
      </div>
    );
  }

  return (
    <form action="/api/acceso" method="post" className="mt-8">
      <h1 className="titular text-subtitulo text-texto">{textos.acceso.titulo}</h1>
      <p className="mt-2 text-sm text-texto-suave">{textos.acceso.descripcion}</p>
      <input type="hidden" name="desde" value={desde} />
      <label htmlFor="codigo" className="mt-6 block text-sm font-semibold text-texto">
        {textos.acceso.etiqueta}
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-lg bg-fondo px-3 ring-1 ring-borde focus-within:ring-2 focus-within:ring-dorado">
        <Icono nombre="candado" className="size-5 text-texto-suave" />
        <input
          id="codigo"
          name="codigo"
          type="password"
          required
          autoFocus
          autoComplete="off"
          aria-invalid={error || undefined}
          aria-describedby={error ? "codigo-error" : undefined}
          className="h-12 w-full bg-transparent text-lg text-texto focus:outline-none focus-visible:outline-none"
        />
      </div>
      {error && (
        <p id="codigo-error" role="alert" className="mt-2 text-sm font-semibold text-rojo-texto">
          {textos.acceso.error}
        </p>
      )}
      <button
        type="submit"
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-rojo font-bold text-white transition-colors hover:bg-rojo-hover"
      >
        {textos.acceso.boton}
      </button>
    </form>
  );
}
