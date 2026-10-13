import { Esqueleto } from "@/components/Portada";

/** Esqueleto del reproductor (también permite servir cortos nuevos al instante). */
export default function CargandoReproductor() {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black"
      role="status"
      aria-label="Cargando el reproductor"
    >
      <Esqueleto className="aspect-video w-[min(100vw,calc(100svh*16/9))]" />
    </div>
  );
}
