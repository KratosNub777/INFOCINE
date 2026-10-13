import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ACCESO, huellaCodigo } from "@/lib/acceso";

/**
 * Código de acceso opcional. Si la variable de entorno CODIGO_ACCESO
 * tiene un valor, se pide ese código antes de entrar. Si está vacía,
 * el sitio es público.
 */
export async function proxy(request: NextRequest) {
  const codigo = process.env.CODIGO_ACCESO?.trim();
  if (!codigo) return NextResponse.next();

  const cookie = request.cookies.get(COOKIE_ACCESO)?.value;
  if (cookie && cookie === (await huellaCodigo(codigo))) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/acceso";
  url.search = "";
  url.searchParams.set("desde", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  // Todo menos la página de acceso, archivos internos, el escudo y robots.
  matcher: ["/((?!acceso|api/acceso|_next/static|_next/image|logo/|icon|robots\\.txt|manifest\\.webmanifest).*)"],
};
