import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { Icono } from "@/components/Icono";
import { supabaseActivo } from "@/lib/supabase/config";
import { sesionActual } from "@/lib/supabase/servidor";
import { salir } from "./acciones";

export const metadata: Metadata = {
  title: "Panel de profesores",
  robots: { index: false, follow: false },
};

export default function LayoutPanel({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-fondo/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-[var(--gutter)]">
          <Link href="/admin" className="flex items-center gap-3 rounded-md">
            <Logo />
            <span className="hidden text-sm font-semibold text-texto-suave sm:inline">Panel de profesores</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" className="rounded-md px-3 py-2 text-sm font-semibold text-texto-suave hover:text-texto">
              Ver sitio
            </Link>
            <Suspense>
              <Usuario />
            </Suspense>
          </div>
        </div>
      </header>
      <main id="contenido" className="mx-auto max-w-6xl px-[var(--gutter)] py-8 pb-24">
        {children}
      </main>
    </div>
  );
}

async function Usuario() {
  if (!supabaseActivo) return null;
  const { usuario } = await sesionActual();
  if (!usuario) return null;
  return (
    <form action={salir} className="flex items-center gap-2">
      <span className="hidden max-w-48 truncate text-sm text-texto-suave md:inline">{usuario.email}</span>
      <button
        type="submit"
        className="inline-flex min-h-10 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-texto ring-1 ring-borde hover:bg-superficie"
      >
        <Icono nombre="salir" className="size-4" /> Salir
      </button>
    </form>
  );
}
