"use server";

import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { generos } from "@/config/sitio";
import type { Corto } from "@/data/cortos";
import { aSlug, idYoutube } from "@/lib/cortos";
import { ETIQUETA_CORTOS } from "@/lib/datos";
import { BUCKET_PORTADAS } from "@/lib/supabase/config";
import { cortoAFila } from "@/lib/supabase/filas";
import { clienteServidor, sesionActual } from "@/lib/supabase/servidor";

export type EstadoIngreso = { enviado?: boolean; error?: string };
export type EstadoGuardado = { error?: string };

/* ───────────── Ingreso con enlace por e-mail ───────────── */

export async function ingresar(_previo: EstadoIngreso, datos: FormData): Promise<EstadoIngreso> {
  const email = String(datos.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Escribí un e-mail válido." };

  const h = await headers();
  const origen = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const supabase = await clienteServidor();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    // Solo pueden entrar profesores invitados (npm run agregar-editor).
    options: { shouldCreateUser: false, emailRedirectTo: `${origen}/admin/auth/confirmar` },
  });
  // Por privacidad, la respuesta es la misma aunque el e-mail no esté autorizado.
  if (error && error.status === 429) return { error: "Pediste muchos enlaces seguidos. Esperá un minuto." };
  return { enviado: true };
}

export async function salir() {
  const supabase = await clienteServidor();
  await supabase.auth.signOut();
  redirect("/admin/ingresar");
}

/* ───────────── Guardar y borrar cortos ───────────── */

const texto = (d: FormData, campo: string) => String(d.get(campo) ?? "").trim();
/** Un nombre por línea (o separados por coma). */
const lista = (d: FormData, campo: string) =>
  texto(d, campo)
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

async function exigirEditor() {
  const sesion = await sesionActual();
  if (!sesion.usuario || !sesion.esEditor) redirect("/admin/ingresar");
  return sesion.supabase;
}

export async function guardarCorto(_previo: EstadoGuardado, datos: FormData): Promise<EstadoGuardado> {
  const supabase = await exigirEditor();

  const idOriginal = texto(datos, "idOriginal");
  const titulo = texto(datos, "titulo");
  const id = idOriginal || aSlug(texto(datos, "id") || titulo);
  const anio = Number(texto(datos, "anio"));
  const duracion = Number(texto(datos, "duracion"));
  const youtube = texto(datos, "youtube");
  const video = idYoutube(youtube);

  const errores: string[] = [];
  if (!titulo) errores.push("Falta el título.");
  if (!id) errores.push("El título necesita al menos una letra o número.");
  if (!Number.isInteger(anio) || anio < 1990 || anio > 2100) errores.push("El año no es válido.");
  if (!Number.isInteger(duracion) || duracion < 1 || duracion > 300)
    errores.push("La duración va en minutos (1 a 300).");
  if (!texto(datos, "portada") || !texto(datos, "imagenHorizontal")) errores.push("Subí las dos imágenes.");
  if (youtube && !video) errores.push("El enlace de YouTube no es válido.");
  if (errores.length) return { error: errores.join(" ") };

  const corto: Corto = {
    id,
    titulo,
    sinopsis: texto(datos, "sinopsis"),
    anio,
    duracion,
    generos: datos
      .getAll("generos")
      .map(String)
      .filter((g): g is keyof typeof generos => g in generos),
    materia: texto(datos, "materia"),
    equipo: {
      direccion: lista(datos, "direccion"),
      guion: lista(datos, "guion"),
      elenco: lista(datos, "elenco"),
      edicion: lista(datos, "edicion"),
      fotografia: lista(datos, "fotografia"),
      sonido: lista(datos, "sonido"),
    },
    profesorGuia: texto(datos, "profesorGuia"),
    portada: texto(datos, "portada"),
    imagenHorizontal: texto(datos, "imagenHorizontal"),
    youtube: video ? `https://youtu.be/${video}` : null,
    destacado: datos.get("destacado") === "on",
    premios: texto(datos, "premios")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    agregado: texto(datos, "agregado") || new Date().toISOString().slice(0, 10),
  };
  const fila = cortoAFila(corto, datos.get("publicado") === "on");

  if (idOriginal) {
    const { data, error } = await supabase.from("cortos").update(fila).eq("id", idOriginal).select("id");
    if (error) return { error: `No se pudo guardar: ${error.message}` };
    if (!data?.length) return { error: "No se encontró el corto o no tenés permiso para editarlo." };
  } else {
    const { error } = await supabase.from("cortos").insert(fila);
    if (error?.code === "23505")
      return { error: `Ya existe un corto con la dirección “${id}”. Cambiá el título o la dirección.` };
    if (error) return { error: `No se pudo guardar: ${error.message}` };
  }

  updateTag(ETIQUETA_CORTOS);
  redirect(`/admin?guardado=${encodeURIComponent(id)}`);
}

export async function eliminarCorto(datos: FormData) {
  const supabase = await exigirEditor();
  const id = texto(datos, "id");
  const { data } = await supabase.from("cortos").delete().eq("id", id).select("id");
  if (data?.length) {
    // También se borran sus portadas subidas
    const { data: archivos } = await supabase.storage.from(BUCKET_PORTADAS).list(id);
    if (archivos?.length) await supabase.storage.from(BUCKET_PORTADAS).remove(archivos.map((a) => `${id}/${a.name}`));
    updateTag(ETIQUETA_CORTOS);
  }
  redirect("/admin?eliminado=1");
}
