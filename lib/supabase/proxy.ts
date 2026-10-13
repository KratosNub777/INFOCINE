import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseClave, supabaseUrl } from "./config";

/** Páginas del panel que se ven sin sesión. */
const PUBLICAS = ["/admin/ingresar", "/admin/auth/"];

/**
 * Renueva la sesión del profesor en cada pedido al panel y, si no hay
 * sesión, lo manda a /admin/ingresar.
 */
export async function sesionDelPanel(request: NextRequest) {
  let respuesta = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseClave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(lista, encabezados) {
        for (const { name, value } of lista) request.cookies.set(name, value);
        respuesta = NextResponse.next({ request });
        for (const { name, value, options } of lista) respuesta.cookies.set(name, value, options);
        for (const [clave, valor] of Object.entries(encabezados ?? {})) respuesta.headers.set(clave, valor);
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const ruta = request.nextUrl.pathname;
  if (!data.user && !PUBLICAS.some((p) => ruta.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/ingresar";
    url.search = "";
    const redireccion = NextResponse.redirect(url);
    for (const c of respuesta.cookies.getAll()) redireccion.cookies.set(c);
    return redireccion;
  }
  return respuesta;
}
