import { Esqueleto } from "./Portada";

export function EsqueletoGrilla({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div
      className="mt-4 grid grid-cols-2 gap-x-[var(--gap)] gap-y-5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
      role="status"
      aria-label="Cargando"
    >
      {Array.from({ length: cantidad }, (_, i) => (
        <Esqueleto key={i} className="aspect-video" />
      ))}
    </div>
  );
}

export function EsqueletoFila() {
  return (
    <div className="px-[var(--gutter)]">
      <Esqueleto className="h-6 w-48" />
      <div className="mt-4 flex gap-[var(--gap)] overflow-hidden">
        {Array.from({ length: 7 }, (_, i) => (
          <Esqueleto key={i} className="tarjeta-h aspect-video" />
        ))}
      </div>
    </div>
  );
}

export function EsqueletoInicio() {
  return (
    <div role="status" aria-label="Cargando">
      <div className="relative h-[78svh] min-h-[32rem] w-full overflow-hidden bg-superficie/60">
        <div className="absolute bottom-[clamp(3.5rem,8vh,6rem)] left-[var(--gutter)] w-[min(40rem,80%)] space-y-4">
          <Esqueleto className="h-4 w-28" />
          <Esqueleto className="h-16 w-4/5" />
          <Esqueleto className="h-4 w-3/5" />
          <Esqueleto className="h-20 w-full" />
          <div className="flex gap-3">
            <Esqueleto className="h-12 w-36" />
            <Esqueleto className="h-12 w-44" />
          </div>
        </div>
      </div>
      <div className="mt-8 space-y-10">
        <EsqueletoFila />
        <EsqueletoFila />
      </div>
    </div>
  );
}
