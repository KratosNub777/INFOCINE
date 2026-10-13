import Image from "next/image";

/**
 * Imagen de portada optimizada. Las SVG (portadas DEMO) no necesitan
 * optimización; las .jpg/.webp reales se optimizan con next/image.
 */
export function Portada({
  src,
  alt,
  sizes,
  prioridad = false,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  prioridad?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized={src.endsWith(".svg")}
      loading={prioridad ? "eager" : "lazy"}
      fetchPriority={prioridad ? "high" : undefined}
      className={`object-cover ${className}`}
    />
  );
}

/** Rectángulo con brillo que se muestra mientras algo carga. */
export function Esqueleto({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-superficie ${className}`} aria-hidden="true">
      <div className="absolute inset-0 animate-brillo bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}
