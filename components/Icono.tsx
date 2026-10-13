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
  cursos: (
    <>
      <path d="M3 9.5 12 5l9 4.5-9 4.5z" />
      <path d="M7 11.5V16c1.5 1.3 3.2 2 5 2s3.5-.7 5-2v-4.5" />
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
  volver: <path d="M19 12H5m6-7-7 7 7 7" />,
  siguiente: <path d="M5 5v14l10-7zM19 5v14" />,
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
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
