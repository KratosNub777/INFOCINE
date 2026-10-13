import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";
import { colores, sitio } from "@/config/sitio";
import { cursoYSeccion } from "@/lib/cortos";
import { idsDeCortos, obtenerCatalogo } from "@/lib/datos";
import { TRAZO_RAYO } from "@/components/Logo";

export const alt = "Portada del cortometraje en Infocine";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return idsDeCortos();
}

const TIPOS: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/** Imagen para compartir (WhatsApp, Facebook…): la portada horizontal + título. */
export default async function Imagen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const corto = (await obtenerCatalogo()).porId(id);

  // Las portadas reales (.jpg/.png/.webp) se usan de fondo. Las SVG demo se reemplazan por un degradado.
  let fondo: string | null = null;
  if (corto && /^https?:\/\//.test(corto.imagenHorizontal)) {
    // Portadas subidas desde el panel (Supabase Storage)
    fondo = corto.imagenHorizontal;
  } else if (corto && !corto.imagenHorizontal.endsWith(".svg")) {
    const ext = path.extname(corto.imagenHorizontal).toLowerCase();
    if (TIPOS[ext]) {
      try {
        const archivo = await fs.readFile(path.join(process.cwd(), "public", corto.imagenHorizontal));
        fondo = `data:${TIPOS[ext]};base64,${archivo.toString("base64")}`;
      } catch {
        fondo = null;
      }
    }
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: `linear-gradient(135deg, ${colores.azul} 0%, ${colores.fondo} 70%)`,
        color: colores.texto,
        fontFamily: "sans-serif",
      }}
    >
      {fondo && (
        <img
          src={fondo}
          alt=""
          width={1200}
          height={630}
          style={{ position: "absolute", inset: 0, objectFit: "cover" }}
        />
      )}
      {!fondo && (
        <svg
          width="420"
          height="630"
          viewBox="0 0 16 24"
          style={{ position: "absolute", right: 80, top: 0, opacity: 0.9 }}
        >
          <path d={TRAZO_RAYO} fill={colores.dorado} />
        </svg>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background: "linear-gradient(0deg, rgba(10,11,18,0.95) 0%, rgba(10,11,18,0.2) 60%, rgba(10,11,18,0.5) 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 64, top: 52, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, display: "flex" }}>INFOCINE</div>
        {corto?.demo && (
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              background: colores.rojo,
              color: "#fff",
              padding: "4px 12px",
              borderRadius: 6,
              letterSpacing: 3,
            }}
          >
            DEMO
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 56, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -2 }}>
          {corto?.titulo ?? sitio.nombre}
        </div>
        <div style={{ marginTop: 18, fontSize: 30, color: colores.textoSuave, display: "flex" }}>
          {corto ? `${cursoYSeccion(corto)} · ${corto.anio} · ${sitio.colegio}` : sitio.colegio}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 10,
          background: colores.rojo,
          display: "flex",
        }}
      />
    </div>,
    size,
  );
}
