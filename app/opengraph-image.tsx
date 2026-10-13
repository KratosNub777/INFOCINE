import { ImageResponse } from "next/og";
import { colores, sitio } from "@/config/sitio";
import { TRAZO_RAYO } from "@/components/Logo";

export const alt = `${sitio.nombre}: cortometrajes del ${sitio.colegio}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Imagen() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at 30% 0%, ${colores.azul} 0%, ${colores.fondo} 65%)`,
        color: colores.texto,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", fontSize: 150, fontWeight: 800, letterSpacing: -6 }}>
        <span>INFO</span>
        <svg width="80" height="140" viewBox="0 0 16 24" style={{ margin: "0 -4px" }}>
          <path d={TRAZO_RAYO} fill={colores.dorado} />
        </svg>
        <span>CINE</span>
      </div>
      <div style={{ marginTop: 20, fontSize: 36, color: colores.textoSuave, display: "flex" }}>
        {`${sitio.colegio} · ${sitio.ciudad}`}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 12,
          background: colores.rojo,
          display: "flex",
        }}
      />
    </div>,
    size,
  );
}
