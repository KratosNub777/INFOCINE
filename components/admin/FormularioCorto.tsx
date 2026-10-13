"use client";

import Link from "next/link";
import { startTransition, useActionState, useRef, useState, type ReactNode } from "react";
import { eliminarCorto, guardarCorto, type EstadoGuardado } from "@/app/admin/acciones";
import { generos } from "@/config/sitio";
import type { Corto } from "@/data/cortos";
import { aSlug, idYoutube } from "@/lib/cortos";
import { Icono } from "@/components/Icono";
import { SubirImagen } from "./SubirImagen";
import { ayuda, botonPrincipal, botonSecundario, campo, etiqueta } from "./estilos";

type Inicial = Partial<Corto> & { publicado?: boolean };

/** Formulario para crear o editar un corto desde el panel. */
export function FormularioCorto({ corto, hoy }: { corto?: Inicial; hoy: string }) {
  const editando = Boolean(corto?.id);
  const [estado, accion, guardando] = useActionState<EstadoGuardado, FormData>(guardarCorto, {});
  const [titulo, setTitulo] = useState(corto?.titulo ?? "");
  const [youtube, setYoutube] = useState(corto?.youtube ?? "");
  const idFijo = useRef(corto?.id);
  // Carpeta de las imágenes: el id del corto (o el que tendrá según el título).
  const carpeta = () => idFijo.current || aSlug(titulo) || "sin-titulo";
  const video = idYoutube(youtube);
  const lineas = (v?: string[]) => (v ?? []).join("\n");

  return (
    <>
      <form
        // Se envía a mano para que, si hay un error, no se borre lo que se escribió.
        onSubmit={(e) => {
          e.preventDefault();
          const datos = new FormData(e.currentTarget);
          startTransition(() => accion(datos));
        }}
        className="space-y-8"
      >
        {editando && <input type="hidden" name="idOriginal" value={corto!.id} />}

        <Seccion titulo="Datos del corto">
          <div className="sm:col-span-2">
            <label htmlFor="titulo" className={etiqueta}>
              Título *
            </label>
            <input
              id="titulo"
              name="titulo"
              required
              maxLength={120}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={campo}
            />
            <p className={ayuda}>
              Dirección:{" "}
              <span className="font-mono text-texto">/corto/{editando ? corto!.id : aSlug(titulo) || "…"}</span>
              {editando && " (no cambia al editar)"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="sinopsis" className={etiqueta}>
              Sinopsis
            </label>
            <textarea
              id="sinopsis"
              name="sinopsis"
              rows={4}
              maxLength={1200}
              defaultValue={corto?.sinopsis}
              className={campo}
            />
          </div>
          <Campo nombre="anio" texto="Año *" tipo="number" valor={String(corto?.anio ?? hoy.slice(0, 4))} />
          <Campo
            nombre="duracion"
            texto="Duración (minutos) *"
            tipo="number"
            valor={corto?.duracion ? String(corto.duracion) : ""}
          />
          <div className="sm:col-span-2">
            <Campo nombre="materia" texto="Materia o proyecto" valor={corto?.materia} ejemplo="Lenguaje Audiovisual" />
          </div>
          <fieldset className="sm:col-span-2">
            <legend className={etiqueta}>Géneros</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(generos).map(([clave, nombre]) => (
                <label
                  key={clave}
                  className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full bg-fondo px-3 text-sm ring-1 ring-borde has-[:checked]:bg-azul has-[:checked]:ring-azul has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-dorado"
                >
                  <input
                    type="checkbox"
                    name="generos"
                    value={clave}
                    defaultChecked={corto?.generos?.includes(clave as keyof typeof generos)}
                    className="accent-dorado"
                  />
                  {nombre}
                </label>
              ))}
            </div>
          </fieldset>
        </Seccion>

        <Seccion titulo="Equipo" descripcion="Un nombre por línea. Solo los nombres: sin datos de contacto.">
          <Lista nombre="direccion" texto="Dirección" valor={lineas(corto?.equipo?.direccion)} />
          <Lista nombre="guion" texto="Guion" valor={lineas(corto?.equipo?.guion)} />
          <Lista nombre="elenco" texto="Elenco" valor={lineas(corto?.equipo?.elenco)} />
          <Lista nombre="edicion" texto="Edición" valor={lineas(corto?.equipo?.edicion)} />
          <Lista nombre="fotografia" texto="Fotografía" valor={lineas(corto?.equipo?.fotografia)} />
          <Lista nombre="sonido" texto="Sonido" valor={lineas(corto?.equipo?.sonido)} />
          <div className="sm:col-span-2">
            <Campo nombre="profesorGuia" texto="Profesor/a guía" valor={corto?.profesorGuia} />
          </div>
        </Seccion>

        <Seccion titulo="Imágenes">
          <SubirImagen nombre="portada" formato="vertical" valorInicial={corto?.portada ?? ""} carpeta={carpeta} />
          <SubirImagen
            nombre="imagenHorizontal"
            formato="horizontal"
            valorInicial={corto?.imagenHorizontal ?? ""}
            carpeta={carpeta}
          />
        </Seccion>

        <Seccion titulo="Video">
          <div className="sm:col-span-2">
            <label htmlFor="youtube" className={etiqueta}>
              Enlace de YouTube (no listado)
            </label>
            <input
              id="youtube"
              name="youtube"
              type="url"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="https://youtu.be/…"
              className={campo}
            />
            <p className={ayuda} aria-live="polite">
              {!youtube
                ? "Podés dejarlo vacío y agregarlo después."
                : video
                  ? `✔ Video encontrado (${video}).`
                  : "✘ No parece un enlace de YouTube."}
            </p>
          </div>
        </Seccion>

        <Seccion titulo="Publicación">
          <div className="space-y-3 sm:col-span-2">
            <Casilla nombre="publicado" texto="Publicado (visible en Infocine)" marcado={corto?.publicado ?? false} />
            <Casilla
              nombre="destacado"
              texto="Destacado en el carrusel de Inicio"
              marcado={corto?.destacado ?? false}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="premios" className={etiqueta}>
              Premios o menciones
            </label>
            <textarea
              id="premios"
              name="premios"
              rows={2}
              defaultValue={lineas(corto?.premios)}
              placeholder="Uno por línea, ej. Mejor corto · Muestra 2026"
              className={campo}
            />
          </div>
          <Campo nombre="agregado" texto="Fecha en que se agrega" tipo="date" valor={corto?.agregado ?? hoy} />
        </Seccion>

        {estado.error && (
          <p
            role="alert"
            className="rounded-lg bg-rojo/15 p-3 text-sm font-semibold text-rojo-texto ring-1 ring-rojo/40"
          >
            {estado.error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-borde pt-6">
          <button type="submit" disabled={guardando} className={botonPrincipal}>
            {guardando ? "Guardando…" : editando ? "Guardar cambios" : "Crear corto"}
          </button>
          <Link href="/admin" className={botonSecundario}>
            Cancelar
          </Link>
        </div>
      </form>

      {editando && (
        <form
          action={eliminarCorto}
          onSubmit={(e) => {
            if (!confirm(`¿Borrar “${corto!.titulo}”? No se puede deshacer.`)) e.preventDefault();
          }}
          className="mt-10 rounded-lg p-4 ring-1 ring-rojo/40"
        >
          <input type="hidden" name="id" value={corto!.id} />
          <p className="text-sm text-texto-suave">Borrar el corto, sus portadas subidas y sus estadísticas.</p>
          <button type="submit" className={`${botonSecundario} mt-3 text-rojo-texto`}>
            <Icono nombre="basura" className="size-4" /> Borrar corto
          </button>
        </form>
      )}
    </>
  );
}

function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-xl bg-superficie p-5 ring-1 ring-borde sm:p-6">
      <legend className="titular float-left w-full text-subtitulo text-texto">{titulo}</legend>
      {descripcion && <p className="clear-both pt-1 text-sm text-texto-suave">{descripcion}</p>}
      <div className="clear-both grid gap-5 pt-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Campo({
  nombre,
  texto,
  valor,
  tipo = "text",
  ejemplo,
}: {
  nombre: string;
  texto: string;
  valor?: string;
  tipo?: string;
  ejemplo?: string;
}) {
  return (
    <div>
      <label htmlFor={nombre} className={etiqueta}>
        {texto}
      </label>
      <input
        id={nombre}
        name={nombre}
        type={tipo}
        defaultValue={valor}
        placeholder={ejemplo ? `ej. ${ejemplo}` : undefined}
        required={texto.endsWith("*")}
        className={campo}
      />
    </div>
  );
}

function Lista({ nombre, texto, valor }: { nombre: string; texto: string; valor: string }) {
  return (
    <div>
      <label htmlFor={nombre} className={etiqueta}>
        {texto}
      </label>
      <textarea id={nombre} name={nombre} rows={2} defaultValue={valor} className={campo} />
    </div>
  );
}

function Casilla({ nombre, texto, marcado }: { nombre: string; texto: string; marcado: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-texto">
      <input type="checkbox" name={nombre} defaultChecked={marcado} className="size-5 accent-rojo" />
      {texto}
    </label>
  );
}
