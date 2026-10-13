import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { clienteServidor } from "@/lib/supabase/servidor";

/** Destino del enlace que llega por e-mail: abre la sesión y entra al panel. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const codigo = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const tipo = url.searchParams.get("type") as EmailOtpType | null;
  const supabase = await clienteServidor();

  let ok = false;
  if (codigo) {
    ok = !(await supabase.auth.exchangeCodeForSession(codigo)).error;
  } else if (tokenHash && tipo) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo })).error;
  }

  const destino = url.clone();
  destino.search = "";
  destino.pathname = ok ? "/admin" : "/admin/ingresar";
  if (!ok) destino.searchParams.set("error", "enlace");
  return NextResponse.redirect(destino);
}
