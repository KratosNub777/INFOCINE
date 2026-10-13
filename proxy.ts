import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ACCESO, huellaCodigo } from "@/lib/acceso";
import { supabaseActivo } from "@/lib/supabase/config";
import { sesionDelPanel } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  // 1. Código de acceso opcional (CODIGO_ACCESO). Vacío = sitio público.
  const codigo = process.env.CODIGO_ACCESO?.trim();
  if (codigo) {
    const cookie = request.cookies.get(COOKIE_ACCESO)?.value;
    if (cookie !== (await huellaCodigo(codigo))) {
      const url = request.nextUrl.clone();
      url.pathname = "/acceso";
      url.search = "";
      url.searchParams.set("desde", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
  }

  // 2. Panel de profesores: renovar la sesión y exigir ingreso.
  if (supabaseActivo && request.nextUrl.pathname.startsWith("/admin")) {
    return sesionDelPanel(request);
  }

  return NextResponse.next();
}

export const config = {
  // Todo menos la página de acceso, archivos internos, el escudo y robots.
  matcher: ["/((?!acceso|api/acceso|_next/static|_next/image|logo/|icon|robots\\.txt|manifest\\.webmanifest).*)"],
};
