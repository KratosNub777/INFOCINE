/** Código de acceso opcional (variable de entorno CODIGO_ACCESO). */
export const COOKIE_ACCESO = "infocine_acceso";

export function accesoActivado(): boolean {
  return Boolean(process.env.CODIGO_ACCESO?.trim());
}

/** Guardamos en la cookie una huella del código, nunca el código en sí. */
export async function huellaCodigo(codigo: string): Promise<string> {
  const datos = new TextEncoder().encode(`infocine::${codigo.trim()}`);
  const hash = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Evita redirecciones a otros sitios: solo rutas internas. */
export function destinoSeguro(desde: string | null | undefined): string {
  if (!desde || !desde.startsWith("/") || desde.startsWith("//") || desde.startsWith("/\\")) return "/";
  return desde;
}
