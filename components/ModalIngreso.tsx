"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { textos } from "@/config/sitio";
import {
  MINIMO_CONTRASENA,
  mensajeDeError,
  urlDeRetorno,
  validarContrasena,
  validarEmail,
  type AccionPendiente,
} from "@/lib/cuenta";
import { clienteNavegador } from "@/lib/supabase/navegador";
import { Icono } from "./Icono";
import { PasoCodigo } from "./PasoCodigo";

export type ModoIngreso = "ingresar" | "registrarse" | "recuperar";

type Props = {
  ingreso: { modo: ModoIngreso; accion?: AccionPendiente; aviso?: string } | null;
  cambiarModo: (modo: ModoIngreso) => void;
  cerrar: () => void;
  /** Cierra con un aviso (por ejemplo, después de cambiar la contraseña). */
  terminar: (mensaje: string) => void;
};

const titulos: Record<ModoIngreso, string> = {
  ingresar: "Iniciá sesión",
  registrarse: "Creá tu cuenta",
  recuperar: "Recuperá tu contraseña",
};

function motivo(accion?: AccionPendiente) {
  if (accion?.tipo === "me-gusta") return "Para dar “Me gusta” necesitás una cuenta. Es gratis y tarda un minuto.";
  if (accion?.tipo === "mi-lista")
    return "Para guardar cortos en Mi lista necesitás una cuenta. Es gratis y tarda un minuto.";
  return "Guardá tus cortos y tus “me gusta” en todos tus dispositivos.";
}

/**
 * Ventana de inicio de sesión y registro (<dialog> nativo: atrapa el foco,
 * se cierra con Escape y devuelve el foco al botón que la abrió).
 */
export function ModalIngreso({ ingreso, cambiarModo, cerrar, terminar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const retorno = useRef<HTMLElement | null>(null);
  const abierto = Boolean(ingreso);

  useEffect(() => {
    const d = dialogo.current;
    if (!d || !abierto || d.open) return;
    retorno.current = document.activeElement as HTMLElement | null;
    d.showModal();
  }, [abierto]);

  function alTerminarSalida() {
    const d = dialogo.current;
    if (d?.open && !abierto) {
      d.close();
      const r = retorno.current;
      if (r && document.contains(r)) r.focus({ preventScroll: true });
    }
  }

  return (
    <dialog
      ref={dialogo}
      aria-labelledby="ingreso-titulo"
      aria-describedby="ingreso-motivo"
      onCancel={(e) => {
        e.preventDefault();
        cerrar();
      }}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-transparent backdrop:bg-transparent"
    >
      <AnimatePresence onExitComplete={alTerminarSalida}>
        {ingreso && (
          <motion.div
            key="fondo"
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          />
        )}
        {ingreso && (
          <motion.div
            key="panel"
            className="fixed inset-0 flex items-end justify-center overflow-y-auto overscroll-contain sm:items-center sm:p-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) cerrar();
            }}
          >
            <div className="relative w-full max-w-md rounded-t-2xl bg-superficie p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl shadow-black ring-1 ring-white/10 sm:rounded-2xl sm:p-8">
              <button
                type="button"
                onClick={cerrar}
                aria-label={textos.cerrar}
                className="absolute top-3 right-3 grid size-11 place-items-center rounded-full text-texto-suave transition-colors hover:bg-white/10 hover:text-texto"
              >
                <Icono nombre="cerrar" className="size-6" />
              </button>
              {/* Se desmonta al cerrar: cada apertura empieza con el formulario limpio. */}
              <Contenido ingreso={ingreso} cambiarModo={cambiarModo} terminar={terminar} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}

function Contenido({
  ingreso,
  cambiarModo,
  terminar,
}: {
  ingreso: NonNullable<Props["ingreso"]>;
  cambiarModo: (modo: ModoIngreso) => void;
  terminar: (mensaje: string) => void;
}) {
  const { modo, accion, aviso } = ingreso;
  const ids = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const contrasenaRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [errores, setErrores] = useState<{ email?: string; contrasena?: string; general?: string }>({});
  const [enviando, setEnviando] = useState<"correo" | "google" | null>(null);
  const [listo, setListo] = useState<"confirmar" | "recuperar" | null>(null);

  // Al abrir o cambiar de pestaña, el foco va al correo.
  useEffect(() => {
    emailRef.current?.focus();
  }, [modo]);

  function irA(nuevo: ModoIngreso) {
    setErrores({});
    setListo(null);
    cambiarModo(nuevo);
  }

  async function conGoogle() {
    setErrores({});
    setEnviando("google");
    const { error } = await clienteNavegador().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: urlDeRetorno() },
    });
    // Si sale bien, el navegador ya se está yendo a Google.
    if (error) {
      setEnviando(null);
      setErrores({ general: mensajeDeError(error) });
    }
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const correo = email.trim().toLowerCase();
    const nuevos = {
      email: validarEmail(correo) ?? undefined,
      contrasena:
        modo === "recuperar" ? undefined : (validarContrasena(contrasena, modo === "registrarse") ?? undefined),
    };
    if (nuevos.email || nuevos.contrasena) {
      setErrores(nuevos);
      (nuevos.email ? emailRef : contrasenaRef).current?.focus();
      return;
    }
    setErrores({});
    setEnviando("correo");
    const auth = clienteNavegador().auth;

    if (modo === "ingresar") {
      const { error } = await auth.signInWithPassword({ email: correo, password: contrasena });
      // Si sale bien, ContextoCuenta detecta la sesión y cierra esta ventana.
      if (error?.code === "email_not_confirmed") {
        // Se registró pero nunca confirmó: le mandamos un código nuevo.
        await auth.resend({ type: "signup", email: correo });
        setListo("confirmar");
      } else if (error) setErrores({ general: mensajeDeError(error) });
    } else if (modo === "registrarse") {
      const { data, error } = await auth.signUp({
        email: correo,
        password: contrasena,
        options: { emailRedirectTo: urlDeRetorno() },
      });
      if (error) setErrores({ general: mensajeDeError(error) });
      // Con confirmación por correo activada, un e-mail ya registrado vuelve sin identidades.
      else if (data.user && !data.user.identities?.length)
        setErrores({ general: mensajeDeError({ code: "user_already_exists" }) });
      else if (!data.session) setListo("confirmar");
    } else {
      const { error } = await auth.resetPasswordForEmail(correo, {
        redirectTo: urlDeRetorno("/cuenta/restablecer"),
      });
      if (error) setErrores({ general: mensajeDeError(error) });
      else setListo("recuperar");
    }
    setEnviando(null);
  }

  if (listo) {
    return (
      <PasoCodigo
        tipo={listo === "confirmar" ? "registro" : "recuperar"}
        email={email.trim().toLowerCase()}
        accion={accion}
        volver={() => {
          setErrores({});
          setListo(null);
        }}
        terminar={terminar}
      />
    );
  }

  const idEmailError = `${ids}-email-error`;
  const idContrasenaError = `${ids}-contrasena-error`;
  const idContrasenaAyuda = `${ids}-contrasena-ayuda`;
  const campo =
    "mt-1.5 block w-full rounded-lg bg-fondo px-3 py-3 text-texto ring-1 ring-borde placeholder:text-texto-suave/70 focus:ring-2 focus:ring-dorado focus:outline-none aria-[invalid=true]:ring-rojo-texto";

  return (
    <>
      <h2 id="ingreso-titulo" className="titular pr-10 text-3xl text-texto">
        {titulos[modo]}
      </h2>
      <p id="ingreso-motivo" className="mt-2 text-sm text-texto-suave">
        {modo === "recuperar"
          ? "Escribí el correo de tu cuenta y te mandamos un enlace para elegir una contraseña nueva."
          : motivo(accion)}
      </p>

      {aviso && (
        <p role="alert" className="mt-4 rounded-lg bg-rojo/15 p-3 text-sm font-semibold text-texto ring-1 ring-rojo/50">
          {aviso}
        </p>
      )}

      {modo !== "recuperar" && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg bg-fondo p-1 ring-1 ring-borde">
            {(["ingresar", "registrarse"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => m !== modo && irA(m)}
                aria-pressed={m === modo}
                className="relative min-h-10 rounded-md text-sm font-semibold transition-colors aria-pressed:text-texto not-aria-pressed:text-texto-suave not-aria-pressed:hover:text-texto"
              >
                {m === modo && (
                  <motion.span
                    layoutId="pestana-ingreso"
                    className="absolute inset-0 rounded-md bg-superficie-alta ring-1 ring-borde"
                    transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                  />
                )}
                <span className="relative">{m === "ingresar" ? "Iniciar sesión" : "Crear cuenta"}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={conGoogle}
            disabled={enviando !== null}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-texto px-4 font-semibold text-fondo transition-[background-color,transform] hover:bg-white active:scale-[0.98] disabled:opacity-60"
          >
            <LogoGoogle />
            {enviando === "google" ? "Abriendo Google…" : "Continuar con Google"}
          </button>

          <p className="my-5 flex items-center gap-3 text-xs font-semibold tracking-wider text-texto-suave uppercase">
            <span className="h-px flex-1 bg-borde" aria-hidden="true" />o con tu correo
            <span className="h-px flex-1 bg-borde" aria-hidden="true" />
          </p>
        </>
      )}

      <form onSubmit={enviar} noValidate className={modo === "recuperar" ? "mt-6" : ""}>
        <label htmlFor={`${ids}-email`} className="block text-sm font-semibold text-texto">
          Correo electrónico
        </label>
        <input
          ref={emailRef}
          id={`${ids}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(errores.email)}
          aria-describedby={errores.email ? idEmailError : undefined}
          className={campo}
        />
        {errores.email && (
          <p id={idEmailError} className="mt-1.5 text-sm font-semibold text-rojo-texto">
            {errores.email}
          </p>
        )}

        {modo !== "recuperar" && (
          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={`${ids}-contrasena`} className="block text-sm font-semibold text-texto">
                Contraseña
              </label>
              {modo === "ingresar" && (
                <button
                  type="button"
                  onClick={() => irA("recuperar")}
                  className="text-sm font-semibold text-dorado hover:underline"
                >
                  ¿La olvidaste?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                ref={contrasenaRef}
                id={`${ids}-contrasena`}
                type={verContrasena ? "text" : "password"}
                autoComplete={modo === "registrarse" ? "new-password" : "current-password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                aria-invalid={Boolean(errores.contrasena)}
                aria-describedby={
                  [errores.contrasena && idContrasenaError, modo === "registrarse" && idContrasenaAyuda]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
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
            {errores.contrasena && (
              <p id={idContrasenaError} className="mt-1.5 text-sm font-semibold text-rojo-texto">
                {errores.contrasena}
              </p>
            )}
            {modo === "registrarse" && (
              <p id={idContrasenaAyuda} className="mt-1.5 text-xs text-texto-suave">
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
          disabled={enviando !== null}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-rojo px-5 font-bold text-white transition-[background-color,transform] hover:bg-rojo-hover active:scale-[0.98] disabled:opacity-60"
        >
          {enviando === "correo"
            ? "Un momento…"
            : modo === "ingresar"
              ? "Iniciar sesión"
              : modo === "registrarse"
                ? "Crear cuenta"
                : "Enviarme el enlace"}
        </button>
      </form>

      {modo === "recuperar" && (
        <button
          type="button"
          onClick={() => irA("ingresar")}
          className="mt-5 text-sm font-semibold text-dorado hover:underline"
        >
          Volver a iniciar sesión
        </button>
      )}
      {modo === "registrarse" && (
        <p className="mt-4 text-xs text-texto-suave">
          Solo usamos tu correo para tu cuenta: guardar Mi lista y tus “me gusta”. Al crearla aceptás las{" "}
          <a href="/terminos" target="_blank" className="font-semibold text-dorado hover:underline">
            condiciones del servicio
          </a>{" "}
          y la{" "}
          <a href="/privacidad" target="_blank" className="font-semibold text-dorado hover:underline">
            política de privacidad
          </a>
          .
        </p>
      )}
    </>
  );
}

function LogoGoogle() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.39-2.28v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4.01-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77Z"
      />
    </svg>
  );
}
