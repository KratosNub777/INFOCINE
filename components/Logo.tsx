/**
 * Logotipo tipográfico de Infocine: “INFO” + rayo + “CINE”.
 * El rayo es un detalle inspirado en el escudo del colegio (no es el escudo).
 */
export const TRAZO_RAYO = "M10 0 L1 13.5 H7 L5 24 L15 9.5 H9 L11 0 Z";

export function Rayo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 24" aria-hidden="true" focusable="false" className={className}>
      <path d={TRAZO_RAYO} fill="currentColor" />
    </svg>
  );
}

export function Logo({ className = "", tamano = "md" }: { className?: string; tamano?: "md" | "lg" | "xl" }) {
  const tamanos = {
    md: "text-[1.6rem] lg:text-[1.9rem]",
    lg: "text-[2.6rem]",
    xl: "text-[clamp(3rem,2rem+5vw,6rem)]",
  };
  return (
    <span
      className={`titular inline-flex items-center leading-none tracking-[-0.02em] text-texto select-none ${tamanos[tamano]} ${className}`}
      style={{ fontWeight: 900, fontStretch: "62%" }}
      aria-label="Infocine"
      role="img"
    >
      <span aria-hidden="true">INFO</span>
      <Rayo className="-mx-[0.06em] h-[0.95em] w-auto -skew-x-6 text-dorado drop-shadow-[0_0_0.18em_rgba(229,169,26,0.55)]" />
      <span aria-hidden="true">CINE</span>
    </span>
  );
}
