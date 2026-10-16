import { NextResponse, type NextRequest } from "next/server";
import { rutaSegura } from "@/lib/cuenta";
import { abrirSesionDesdeEnlace } from "@/lib/supabase/enlace";

/**
 * Vuelta de “Continuar con Google” y de los enlaces por correo de los
 * espectadores (confirmar cuenta, recuperar contraseña). Abre la sesión y
 * devuelve a la página donde estaba la persona (?siguiente=/corto/…).
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  // Google avisa con ?error= si la persona canceló o el proveedor falló.
  const cancelado = Boolean(url.searchParams.get("error"));
  const ok = !cancelado && (await abrirSesionDesdeEnlace(request));

  const siguiente = rutaSegura(url.searchParams.get("siguiente"));
  // Los espectadores nunca vuelven al panel por este camino.
  const destino = new URL(siguiente.startsWith("/admin") ? "/" : siguiente, url.origin);
  if (!ok) destino.searchParams.set("auth", cancelado ? "cancelado" : "error");
  return NextResponse.redirect(destino);
}
