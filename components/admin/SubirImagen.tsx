"use client";

import { useState } from "react";
import { BUCKET_PORTADAS } from "@/lib/supabase/config";
import { clienteNavegador } from "@/lib/supabase/navegador";
import { Icono } from "@/components/Icono";
import { ayuda, campo, etiqueta } from "./estilos";

const FORMATOS = {
  vertical: { ancho: 1000, alto: 1500, texto: "Vertical 2:3 (afiche con título)" },
  horizontal: { ancho: 1920, alto: 1080, texto: "Horizontal 16:9 (un fotograma, sin texto)" },
} as const;

/** Recorta al formato, achica y convierte a WebP antes de subir (más liviano). */
async function prepararImagen(archivo: File, formato: keyof typeof FORMATOS): Promise<Blob> {
  const { ancho, alto } = FORMATOS[formato];
  const imagen = await createImageBitmap(archivo);
  const proporcion = ancho / alto;
  let sw = imagen.width;
  let sh = imagen.height;
  if (sw / sh > proporcion) sw = sh * proporcion;
  else sh = sw / proporcion;
  const escala = Math.min(1, ancho / sw);
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(sw * escala);
  lienzo.height = Math.round(sh * escala);
  lienzo
    .getContext("2d")!
    .drawImage(imagen, (imagen.width - sw) / 2, (imagen.height - sh) / 2, sw, sh, 0, 0, lienzo.width, lienzo.height);
  return new Promise((ok, mal) =>
    lienzo.toBlob((b) => (b ? ok(b) : mal(new Error("No se pudo convertir la imagen"))), "image/webp", 0.85),
  );
}

export function SubirImagen({
  nombre,
  formato,
  valorInicial,
  carpeta,
}: {
  /** Nombre del campo del formulario (guarda la URL final). */
  nombre: string;
  formato: keyof typeof FORMATOS;
  valorInicial: string;
  /** Carpeta en Storage (el id del corto). */
  carpeta: () => string;
}) {
  const [url, setUrl] = useState(valorInicial);
  const [estado, setEstado] = useState<"" | "subiendo" | "error">("");
  const [mensaje, setMensaje] = useState("");
  const vertical = formato === "vertical";

  async function alElegir(archivo: File | undefined) {
    if (!archivo) return;
    setEstado("subiendo");
    setMensaje("");
    try {
      const blob = await prepararImagen(archivo, formato);
      const ruta = `${carpeta()}/${formato}-${Date.now()}.webp`;
      const supabase = clienteNavegador();
      const { error } = await supabase.storage
        .from(BUCKET_PORTADAS)
        .upload(ruta, blob, { contentType: "image/webp", cacheControl: "31536000" });
      if (error) throw error;
      setUrl(supabase.storage.from(BUCKET_PORTADAS).getPublicUrl(ruta).data.publicUrl);
      setEstado("");
    } catch (e) {
      setEstado("error");
      setMensaje(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    }
  }

  return (
    <div>
      <span className={etiqueta}>{vertical ? "Portada vertical" : "Imagen horizontal"}</span>
      <p className={ayuda}>{FORMATOS[formato].texto}. Se recorta y achica sola.</p>
      <div className="mt-2 flex items-start gap-4">
        <div
          className={`relative shrink-0 overflow-hidden rounded-md bg-fondo ring-1 ring-borde ${vertical ? "aspect-[2/3] w-24" : "aspect-video w-40"}`}
        >
          {url ? (
            // Vista previa local: no hace falta optimizarla.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-xs text-texto-suave">Sin imagen</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md bg-superficie-alta px-4 text-sm font-semibold text-texto ring-1 ring-borde focus-within:ring-2 focus-within:ring-dorado hover:bg-superficie-alta/70">
            <Icono nombre="subir" className="size-4" />
            {estado === "subiendo" ? "Subiendo…" : url ? "Cambiar imagen" : "Elegir imagen"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              disabled={estado === "subiendo"}
              onChange={(e) => alElegir(e.target.files?.[0])}
            />
          </label>
          <input
            name={nombre}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-label={`Dirección de la ${vertical ? "portada vertical" : "imagen horizontal"}`}
            placeholder="o pegá una dirección (/portadas/… o https://…)"
            className={`${campo} text-xs`}
          />
          {estado === "error" && (
            <p role="alert" className="text-xs font-semibold text-rojo-texto">
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
