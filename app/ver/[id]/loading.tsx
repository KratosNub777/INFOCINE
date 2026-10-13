import { Esqueleto } from "@/components/Portada";

/** Esqueleto del reproductor (también permite servir cortos nuevos al instante). */
export default function CargandoReproductor() {
  return (
    <div className="flex min-h-svh flex-col bg-black" role="status" aria-label="Cargando el reproductor">
      <div className="flex items-center gap-3 px-[var(--gutter)] py-3">
        <Esqueleto className="h-11 w-28 rounded-full" />
        <Esqueleto className="h-6 w-48" />
      </div>
      <div className="grid flex-1 place-items-center px-[var(--gutter)]">
        <Esqueleto className="aspect-video w-full max-w-[calc((100svh-11rem)*16/9)] rounded-lg" />
      </div>
    </div>
  );
}
