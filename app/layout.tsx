import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { colores, sitio } from "@/config/sitio";
import { accesoActivado } from "@/lib/acceso";
import { Proveedores } from "@/components/Proveedores";
import "./globals.css";

// Una sola familia: Archivo (variable), con eje de ancho para los títulos condensados.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const privado = accesoActivado();

export const metadata: Metadata = {
  metadataBase: new URL(sitio.url),
  title: {
    default: `${sitio.nombre} · Cortometrajes del ${sitio.colegio}`,
    template: `%s · ${sitio.nombre}`,
  },
  description: sitio.descripcion,
  applicationName: sitio.nombre,
  keywords: ["cortometrajes", "cine estudiantil", sitio.colegio, "Asunción", "Paraguay", "CTN", "Infocine"],
  openGraph: {
    type: "website",
    locale: "es_PY",
    siteName: sitio.nombre,
    title: `${sitio.nombre} · Cortometrajes del ${sitio.colegio}`,
    description: sitio.descripcion,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/", languages: { "es-PY": "/" } },
  robots: privado ? { index: false, follow: false } : { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: colores.fondo,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Los colores de config/sitio.ts se convierten en variables CSS (--c-rojo, etc.).
const variablesDeColor = `:root{${Object.entries(colores)
  .map(([k, v]) => `--c-${k}:${v}`)
  .join(";")}}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={sitio.idioma} className={archivo.variable}>
      <head>
        <style>{variablesDeColor}</style>
      </head>
      <body className="min-h-svh">
        {/* Degradado sutil de fondo hacia azul marino */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-50 bg-[radial-gradient(120%_70%_at_50%_-10%,var(--c-azulOscuro)_0%,transparent_60%),radial-gradient(80%_50%_at_100%_110%,color-mix(in_oklab,var(--c-azul)_25%,transparent)_0%,transparent_70%)]"
        />
        <Proveedores>{children}</Proveedores>
      </body>
    </html>
  );
}
