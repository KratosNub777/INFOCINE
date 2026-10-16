import type { SVGProps } from "react";

const trazos = {
  play: (
    <path
      d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  pausa: <path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z" fill="currentColor" stroke="none" />,
  mas: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.01" />
    </>
  ),
  izquierda: <path d="m15 5-7 7 7 7" />,
  derecha: <path d="m9 5 7 7-7 7" />,
  abajo: <path d="m6 9 6 6 6-6" />,
  buscar: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  cerrar: <path d="M6 6l12 12M18 6 6 18" />,
  filtros: <path d="M4 6h16M7 12h10M10 18h4" />,
  inicio: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />,
  cortos: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M3.5 9h17M8 5l2 4M13 5l2 4" />
    </>
  ),
  anios: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  lista: (
    <>
      <path d="M6 4h12a1 1 0 0 1 1 1v15.5l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
    </>
  ),
  premio: (
    <path
      d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"
      fill="currentColor"
      stroke="none"
    />
  ),
  pantallaCompleta: <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />,
  salirPantallaCompleta: <path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />,
  volver: <path d="M19 12H5m6-7-7 7 7 7" />,
  siguiente: <path d="M5 5v14l10-7zM19 5v14" />,
  atras10: (
    <>
      <path d="M4 4v5h5M4.6 9A8.5 8.5 0 1 1 3.6 13" />
      <text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor" stroke="none">
        10
      </text>
    </>
  ),
  adelante10: (
    <>
      <path d="M20 4v5h-5M19.4 9A8.5 8.5 0 1 0 20.4 13" />
      <text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor" stroke="none">
        10
      </text>
    </>
  ),
  volumen: (
    <>
      <path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z" fill="currentColor" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  silencio: (
    <>
      <path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z" fill="currentColor" />
      <path d="m16 9.5 5 5M21 9.5l-5 5" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  corazon: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
  corazonLleno: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" fill="currentColor" />,
  ojo: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </>
  ),
  ojoTachado: (
    <>
      <path d="M10.6 5.6A9.9 9.9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.6 6.6C3.9 8.4 2.5 12 2.5 12S6 18.5 12 18.5c1.9 0 3.6-.6 5-1.5" />
      <path d="M9.9 9.9a2.75 2.75 0 0 0 4.2 4.2M3 3l18 18" />
    </>
  ),
  usuario: (
    <>
      <circle cx="12" cy="8.5" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  editar: <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" />,
  subir: <path d="M12 16V4m-5 5 5-5 5 5M5 20h14" />,
  basura: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  salir: <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />,
  candado: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </>
  ),
} as const;

export type NombreIcono = keyof typeof trazos;

export function Icono({ nombre, className = "size-5", ...props }: { nombre: NombreIcono } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {trazos[nombre]}
    </svg>
  );
}
