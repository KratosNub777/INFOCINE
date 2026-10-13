import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ACCESO, destinoSeguro, huellaCodigo } from "@/lib/acceso";

export async function POST(request: NextRequest) {
  const datos = await request.formData();
  const ingresado = String(datos.get("codigo") ?? "");
  const desde = destinoSeguro(String(datos.get("desde") ?? "/"));
  const codigo = process.env.CODIGO_ACCESO?.trim();

  if (!codigo) return NextResponse.redirect(new URL(desde, request.url), 303);

  const correcto = (await huellaCodigo(ingresado)) === (await huellaCodigo(codigo));
  if (!correcto) {
    const url = new URL("/acceso", request.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("desde", desde);
    return NextResponse.redirect(url, 303);
  }

  const respuesta = NextResponse.redirect(new URL(desde, request.url), 303);
  respuesta.cookies.set(COOKIE_ACCESO, await huellaCodigo(codigo), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60, // 60 días
  });
  return respuesta;
}
