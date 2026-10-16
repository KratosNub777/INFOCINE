import { NextResponse, type NextRequest } from "next/server";
import { abrirSesionDesdeEnlace } from "@/lib/supabase/enlace";

/** Destino del enlace que llega por e-mail: abre la sesión y entra al panel. */
export async function GET(request: NextRequest) {
  const ok = await abrirSesionDesdeEnlace(request);

  const destino = request.nextUrl.clone();
  destino.search = "";
  destino.pathname = ok ? "/admin" : "/admin/ingresar";
  if (!ok) destino.searchParams.set("error", "enlace");
  return NextResponse.redirect(destino);
}
