/**
 * Cuentas de espectadores: validación de formularios, mensajes de error
 * en español y la acción que quedó esperando a que la persona inicie sesión.
 */

export type AccionPendiente = { tipo: "me-gusta" | "mi-lista"; id: string };

const CLAVE_PENDIENTE = "infocine:accion-pendiente";
/** Pasado este tiempo (por ejemplo, si nunca confirmó el correo) se descarta. */
const VIGENCIA_MS = 60 * 60 * 1000;

export const MINIMO_CONTRASENA = 8;

/**
 * Se guarda en localStorage porque “Continuar con Google” y el enlace de
 * confirmación salen de la página (y el enlace puede abrirse en otra pestaña).
 */
export function guardarPendiente(accion: AccionPendiente | null) {
  try {
    if (accion) localStorage.setItem(CLAVE_PENDIENTE, JSON.stringify({ ...accion, cuando: Date.now() }));
    else localStorage.removeItem(CLAVE_PENDIENTE);
  } catch {
    // Sin almacenamiento: la acción solo se recuerda mientras siga abierta la página.
  }
}

/** Devuelve la acción pendiente (si sigue vigente) y la borra. */
export function tomarPendiente(): AccionPendiente | null {
  try {
    const crudo = localStorage.getItem(CLAVE_PENDIENTE);
    localStorage.removeItem(CLAVE_PENDIENTE);
    if (!crudo) return null;
    const a = JSON.parse(crudo) as Partial<AccionPendiente> & { cuando?: number };
    if ((a.tipo !== "me-gusta" && a.tipo !== "mi-lista") || typeof a.id !== "string") return null;
    if (!a.cuando || Date.now() - a.cuando > VIGENCIA_MS) return null;
    return { tipo: a.tipo, id: a.id };
  } catch {
    return null;
  }
}

/** Dirección a la que vuelve la persona después de un enlace por correo o de Google. */
export function urlDeRetorno(siguiente = window.location.pathname + window.location.search) {
  const url = new URL("/auth/confirmar", window.location.origin);
  url.searchParams.set("siguiente", siguiente);
  return url.toString();
}

/** Solo rutas internas (“/algo”), para no redirigir a otros sitios. */
export function rutaSegura(valor: string | null | undefined, porDefecto = "/") {
  if (!valor || !valor.startsWith("/") || valor.startsWith("//") || valor.startsWith("/\\")) return porDefecto;
  return valor;
}

export function validarEmail(email: string) {
  if (!email) return "Escribí tu correo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "Ese correo no parece válido. Revisalo.";
  return null;
}

export function validarContrasena(contrasena: string, nueva: boolean) {
  if (!contrasena) return "Escribí tu contraseña.";
  if (nueva && contrasena.length < MINIMO_CONTRASENA)
    return `La contraseña necesita al menos ${MINIMO_CONTRASENA} caracteres.`;
  return null;
}

/** Traduce los errores de Supabase Auth a mensajes claros. */
export function mensajeDeError(error: { code?: string; status?: number; message?: string } | null) {
  if (!error) return "";
  switch (error.code) {
    case "invalid_credentials":
      return "El correo o la contraseña no son correctos.";
    case "email_not_confirmed":
      return "Todavía no confirmaste tu correo. Buscá el enlace que te mandamos (mirá también en Spam).";
    case "user_already_exists":
    case "email_exists":
      return "Ya hay una cuenta con ese correo. Iniciá sesión o recuperá tu contraseña.";
    case "weak_password":
      return `Elegí una contraseña más segura (al menos ${MINIMO_CONTRASENA} caracteres, con letras y números).`;
    case "same_password":
      return "La contraseña nueva tiene que ser distinta de la anterior.";
    case "email_address_invalid":
      return "Ese correo no parece válido. Revisalo.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "Por ahora no se pueden crear cuentas nuevas.";
    case "provider_disabled":
      return "Ese método de ingreso no está activado todavía.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Hiciste muchos intentos seguidos. Esperá un minuto y probá de nuevo.";
    case "session_expired":
    case "session_not_found":
    case "refresh_token_not_found":
      return "Tu sesión venció. Volvé a iniciar sesión.";
  }
  if (error.status === 429) return "Hiciste muchos intentos seguidos. Esperá un minuto y probá de nuevo.";
  if (error.message?.toLowerCase().includes("fetch")) return "No hay conexión. Revisá tu internet y probá de nuevo.";
  return "No pudimos completar el pedido. Probá de nuevo en un momento.";
}
