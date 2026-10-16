import type { EmailOtpType } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { clienteServidor } from "./servidor";

/**
 * Abre la sesión con lo que trae un enlace de Supabase Auth: `?code=` (PKCE:
 * Google, confirmación de cuenta, recuperar contraseña) o `?token_hash=&type=`.
 * Devuelve true si la sesión quedó abierta (las cookies se guardan solas).
 */
export async function abrirSesionDesdeEnlace(request: NextRequest) {
  const url = request.nextUrl;
  const codigo = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const tipo = url.searchParams.get("type") as EmailOtpType | null;
  const supabase = await clienteServidor();

  if (codigo) return !(await supabase.auth.exchangeCodeForSession(codigo)).error;
  if (tokenHash && tipo) return !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo })).error;
  return false;
}
