"use client";

import { useActionState } from "react";
import { ingresar, type EstadoIngreso } from "@/app/admin/acciones";
import { Icono } from "@/components/Icono";
import { ayuda, botonPrincipal, campo, etiqueta } from "./estilos";

export function FormularioIngreso({ errorEnlace, sinPermiso }: { errorEnlace: boolean; sinPermiso: boolean }) {
  const [estado, accion, enviando] = useActionState<EstadoIngreso, FormData>(ingresar, {});

  if (estado.enviado) {
    return (
      <div role="status" className="mt-8 rounded-lg bg-azul/40 p-4 text-sm text-texto ring-1 ring-azul">
        <p className="font-semibold">Revisá tu correo 📬</p>
        <p className="mt-1 text-texto-suave">
          Si tu e-mail está autorizado como profesor/a, te llegó un enlace para entrar. Puede tardar un minuto; mirá
          también en “Spam”.
        </p>
      </div>
    );
  }

  return (
    <form action={accion} className="mt-8">
      {errorEnlace && (
        <p role="alert" className="mb-4 text-sm font-semibold text-rojo-texto">
          El enlace venció o ya se usó. Pedí uno nuevo.
        </p>
      )}
      {sinPermiso && (
        <p role="alert" className="mb-4 text-sm font-semibold text-rojo-texto">
          Tu cuenta de Infocine no tiene permiso de profesor/a. Entrá con tu e-mail de profesor/a o pedile a quien
          administra Infocine que te agregue.
        </p>
      )}
      <label htmlFor="email" className={etiqueta}>
        Tu e-mail de profesor/a
      </label>
      <input id="email" name="email" type="email" required autoComplete="email" className={campo} />
      <p className={ayuda}>Te mandamos un enlace para entrar, sin contraseña.</p>
      {estado.error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-rojo-texto">
          {estado.error}
        </p>
      )}
      <button type="submit" disabled={enviando} className={`${botonPrincipal} mt-6 w-full`}>
        <Icono nombre="candado" className="size-5" />
        {enviando ? "Enviando…" : "Enviarme el enlace"}
      </button>
    </form>
  );
}
