"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { MINIMO_CONTRASENA, mensajeDeError, validarContrasena } from "@/lib/cuenta";
import { clienteNavegador } from "@/lib/supabase/navegador";
import { useCuenta } from "./ContextoCuenta";
import { EsqueletoGrilla } from "./Esqueletos";

const campo =
  "mt-1.5 block w-full rounded-lg bg-fondo px-3 py-3 text-texto ring-1 ring-borde focus:ring-2 focus:ring-dorado focus:outline-none aria-[invalid=true]:ring-rojo-texto";
const boton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-rojo px-6 font-bold text-white transition-[background-color,transform] hover:bg-rojo-hover active:scale-[0.98] disabled:opacity-60";

/** Formulario de contraseña nueva (llega con la sesión que abrió el enlace del correo). */
export function FormularioNuevaContrasena() {
  const { estado, usuario, abrirIngreso } = useCuenta();
  const [contrasena, setContrasena] = useState("");
  const [repetida, setRepetida] = useState("");
  const [error, setError] = useState<{ campo?: "contrasena" | "repetida"; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  if (estado === "cargando" && !usuario) return <EsqueletoGrilla cantidad={1} />;

  if (listo) {
    return (
      <div role="status" className="mt-6 max-w-md rounded-2xl bg-superficie p-6 ring-1 ring-borde">
        <p className="titular text-2xl text-texto">¡Contraseña cambiada!</p>
        <p className="mt-2 text-texto-suave">Ya podés usarla para iniciar sesión.</p>
        <Link href="/" className={`${boton} mt-6`}>
          Ir a Infocine
        </Link>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="mt-6 max-w-md rounded-2xl bg-superficie p-6 ring-1 ring-borde">
        <p className="text-texto">
          {estado === "desactivado"
            ? "Las cuentas no están activadas en este sitio."
            : "El enlace venció o ya se usó. Pedí uno nuevo para elegir tu contraseña."}
        </p>
        {estado !== "desactivado" && (
          <button type="button" onClick={() => abrirIngreso({ modo: "recuperar" })} className={`${boton} mt-6`}>
            Pedir un enlace nuevo
          </button>
        )}
      </div>
    );
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const problema = validarContrasena(contrasena, true);
    if (problema) return setError({ campo: "contrasena", texto: problema });
    if (contrasena !== repetida) return setError({ campo: "repetida", texto: "Las dos contraseñas no coinciden." });
    setError(null);
    setEnviando(true);
    const { error: e2 } = await clienteNavegador().auth.updateUser({ password: contrasena });
    setEnviando(false);
    if (e2) setError({ texto: mensajeDeError(e2) });
    else setListo(true);
  }

  return (
    <form onSubmit={enviar} noValidate className="mt-6 max-w-md rounded-2xl bg-superficie p-6 ring-1 ring-borde">
      <p className="text-sm text-texto-suave">
        Cuenta: <strong className="text-texto">{usuario.email}</strong>
      </p>
      <label htmlFor="nueva-contrasena" className="mt-5 block text-sm font-semibold text-texto">
        Contraseña nueva
      </label>
      <input
        id="nueva-contrasena"
        type="password"
        autoComplete="new-password"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        aria-invalid={error?.campo === "contrasena"}
        aria-describedby="nueva-contrasena-ayuda"
        className={campo}
      />
      <p id="nueva-contrasena-ayuda" className="mt-1.5 text-xs text-texto-suave">
        Mínimo {MINIMO_CONTRASENA} caracteres.
      </p>
      <label htmlFor="repetir-contrasena" className="mt-4 block text-sm font-semibold text-texto">
        Repetila
      </label>
      <input
        id="repetir-contrasena"
        type="password"
        autoComplete="new-password"
        value={repetida}
        onChange={(e) => setRepetida(e.target.value)}
        aria-invalid={error?.campo === "repetida"}
        className={campo}
      />
      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-rojo-texto">
          {error.texto}
        </p>
      )}
      <button type="submit" disabled={enviando} className={`${boton} mt-6 w-full`}>
        {enviando ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
