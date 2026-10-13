/**
 * Da (o quita) permiso de edición a un profesor/a.
 *   npm run agregar-editor -- profe@ejemplo.com
 *   npm run agregar-editor -- profe@ejemplo.com --quitar
 * Después, el profesor entra en /admin/ingresar con su e-mail.
 */
import { clienteAdmin } from "./supabase-admin.mjs";

const email = (process.argv[2] ?? "").trim().toLowerCase();
const quitar = process.argv.includes("--quitar");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Uso: npm run agregar-editor -- correo@ejemplo.com [--quitar]");
  process.exit(1);
}

const supabase = clienteAdmin();

if (quitar) {
  const { error } = await supabase.from("editores").delete().eq("email", email);
  if (error) throw new Error(error.message);
  console.log(`✔ ${email} ya no puede editar.`);
  process.exit(0);
}

const { error } = await supabase.from("editores").upsert({ email });
if (error) throw new Error(`No se pudo agregar a editores: ${error.message}`);

// Crea la cuenta (sin mandar e-mail). Si ya existía, no pasa nada.
const { error: errorCuenta } = await supabase.auth.admin.createUser({ email, email_confirm: true });
if (errorCuenta && errorCuenta.code !== "email_exists" && errorCuenta.status !== 422) {
  throw new Error(`No se pudo crear la cuenta: ${errorCuenta.message}`);
}

console.log(`✔ ${email} ya puede entrar en /admin/ingresar con su e-mail.`);
