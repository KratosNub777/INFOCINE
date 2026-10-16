"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { MINIMO_CONTRASENA, mensajeDeError, validarContrasena, type AccionPendiente } from "@/lib/cuenta";
import { clienteNavegador } from "@/lib/supabase/navegador";
import { Icono } from "./Icono";

/** Supabase deja que no se pida otro correo hasta pasado este tiempo. */
const ESPERA_REENVIO = 60;

const campo =
  "mt-1.5 block w-full rounded-lg bg-fondo px-3 py-3 text-texto ring-1 ring-borde placeholder:text-texto-suave/50 focus:ring-2 focus:ring-dorado focus:outline-none aria-[invalid=true]:ring-rojo-texto";

/**
 * Segundo paso del registro o de “olvidé mi contraseña”: la persona escribe el
 * código que le llegó por correo sin salir de la página.
 */
export function PasoCodigo({
  tipo,
  email,
  accion,
  volver,
  terminar,
}: {
  /** "registro": confirmar la cuenta nueva. "recuperar": elegir una contraseña nueva. */
  tipo: "registro" | "recuperar";
  email: string;
  accion?: AccionPendiente;
  volver: () => void;
  /** Cierra la ventana con un aviso (solo al recuperar; al registrarse la cierra ContextoCuenta). */
  terminar: (mensaje: string) => void;
}) {
  const ids = useId();
  const codigoRef = useRef<HTMLInputElement>(null);
  const contrasenaRef = useRef<HTMLInputElement>(null);
  const [codigo, setCodigo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [errores, setErrores] = useState<{ codigo?: string; contrasena?: string; general?: string }>({});
  const [enviando, setEnviando] = useState(false);
  // Al recuperar, si el código ya se validó pero la contraseña falló, no se vuelve a pedir.
  const [verificado, setVerificado] = useState(false);
  const [espera, setEspera] = useState(ESPERA_REENVIO);
  const [reenviado, setReenviado] = useState(false);

  useEffect(() => {
    codigoRef.current?.focus();
  }, []);

  // Cuenta regresiva para “Reenviar código”.
  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  async function reenviar() {
    setErrores({});
    setReenviado(false);
    const auth = clienteNavegador().auth;
    const { error } =
      tipo === "registro" ? await auth.resend({ type: "signup", email }) : await auth.resetPasswordForEmail(email);
    if (error) setErrores({ general: mensajeDeError(error) });
    else setReenviado(true);
    setEspera(ESPERA_REENVIO);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const nuevos = {
      codigo: verificado || /^\d{6,10}$/.test(codigo) ? undefined : "Escribí el código de números que te llegó.",
      contrasena: tipo === "recuperar" ? (validarContrasena(contrasena, true) ?? undefined) : undefined,
    };
    if (nuevos.codigo || nuevos.contrasena) {
      setErrores(nuevos);
      (nuevos.codigo ? codigoRef : contrasenaRef).current?.focus();
      return;
    }
    setErrores({});
    setEnviando(true);
    const auth = clienteNavegador().auth;

    if (!verificado) {
      const { error } = await auth.verifyOtp({
        email,
        token: codigo,
        type: tipo === "registro" ? "signup" : "recovery",
      });
      if (error) {
        setEnviando(false);
        const vencido = error.code === "otp_expired" || /expired|invalid/i.test(error.message);
        setErrores({
          codigo: vencido ? "El código no es correcto o ya venció. Revisalo o pedí uno nuevo." : undefined,
          general: vencido ? undefined : mensajeDeError(error),
        });
        codigoRef.current?.focus();
        return;
      }
      // Registro: la sesión ya quedó abierta y ContextoCuenta cierra la ventana.
      if (tipo === "registro") return;
      setVerificado(true);
    }

    const { error } = await auth.updateUser({ password: contrasena });
    setEnviando(false);
    if (error) {
      setErrores({ contrasena: mensajeDeError(error) });
      contrasenaRef.current?.focus();
      return;
    }
    terminar("Listo: cambiaste tu contraseña y ya iniciaste sesión.");
  }

  const idCodigoError = `${ids}-codigo-error`;
  const idContrasenaError = `${ids}-contrasena-error`;

  return (
    <>
      <h2 id="ingreso-titulo" className="titular text-4xl text-texto">
        Revisá tu correo
      </h2>
      <p id="ingreso-motivo" className="mt-2 text-sm text-texto-suave">
        Te mandamos un código a <strong className="text-texto">{email}</strong>.{" "}
        {tipo === "registro"
          ? `Escribilo acá para confirmar tu cuenta${accion ? " y se guarda lo que elegiste" : ""}.`
          : "Escribilo acá junto con tu contraseña nueva."}
      </p>

      <form onSubmit={enviar} noValidate className="mt-6">
        {!verificado && (
          <>
            <label htmlFor={`${ids}-codigo`} className="block text-sm font-semibold text-texto">
              Código
            </label>
            <input
              ref={codigoRef}
              id={`${ids}-codigo`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={10}
              placeholder="123456"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
              aria-invalid={Boolean(errores.codigo)}
              aria-describedby={errores.codigo ? idCodigoError : undefined}
              className={`${campo} text-center text-2xl font-bold tracking-[0.4em] tabular-nums`}
            />
            {errores.codigo && (
              <p id={idCodigoError} className="mt-1.5 text-sm font-semibold text-rojo-texto">
                {errores.codigo}
              </p>
            )}
          </>
        )}

        {tipo === "recuperar" && (
          <div className={verificado ? "" : "mt-4"}>
            <label htmlFor={`${ids}-contrasena`} className="block text-sm font-semibold text-texto">
              Contraseña nueva
            </label>
            <div className="relative">
              <input
                ref={contrasenaRef}
                id={`${ids}-contrasena`}
                type={verContrasena ? "text" : "password"}
                autoComplete="new-password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                aria-invalid={Boolean(errores.contrasena)}
                aria-describedby={errores.contrasena ? idContrasenaError : `${ids}-contrasena-ayuda`}
                className={`${campo} pr-12`}
              />
              <button
                type="button"
                onClick={() => setVerContrasena((v) => !v)}
                aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={verContrasena}
                className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-md text-texto-suave hover:text-texto"
              >
                <Icono nombre={verContrasena ? "ojoTachado" : "ojo"} className="size-5" />
              </button>
            </div>
            {errores.contrasena ? (
              <p id={idContrasenaError} className="mt-1.5 text-sm font-semibold text-rojo-texto">
                {errores.contrasena}
              </p>
            ) : (
              <p id={`${ids}-contrasena-ayuda`} className="mt-1.5 text-xs text-texto-suave">
                Mínimo {MINIMO_CONTRASENA} caracteres.
              </p>
            )}
          </div>
        )}

        {errores.general && (
          <p role="alert" className="mt-4 text-sm font-semibold text-rojo-texto">
            {errores.general}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-rojo px-5 font-bold text-white transition-[background-color,transform] hover:bg-rojo-hover active:scale-[0.98] disabled:opacity-60"
        >
          {enviando ? "Un momento…" : tipo === "registro" ? "Confirmar cuenta" : "Guardar contraseña"}
        </button>
      </form>

      {!verificado && (
        <p className="mt-5 text-sm text-texto-suave" aria-live="polite">
          {reenviado && <span className="mb-1 block text-texto">Te mandamos un código nuevo.</span>}
          ¿No te llegó? Mirá en “Spam” o{" "}
          {espera > 0 ? (
            <span>pedí otro en {espera} s.</span>
          ) : (
            <button type="button" onClick={reenviar} className="font-semibold text-dorado hover:underline">
              reenviá el código
            </button>
          )}
        </p>
      )}
      <button type="button" onClick={volver} className="mt-3 text-sm font-semibold text-dorado hover:underline">
        Usar otro correo
      </button>
    </>
  );
}
