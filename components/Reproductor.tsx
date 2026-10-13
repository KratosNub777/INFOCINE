"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { textos } from "@/config/sitio";
import { guardarProgreso, useProgreso } from "@/lib/almacen";
import { registrarVista } from "@/lib/estadisticas";
import { cursoYSeccion, formatoDuracion, idYoutube, type Corto } from "@/lib/cortos";
import { Portada } from "./Portada";
import { Icono } from "./Icono";
import { EtiquetaDemo } from "./Etiquetas";

export function Reproductor({ corto, siguiente }: { corto: Corto; siguiente?: Corto }) {
  const router = useRouter();
  const [terminado, setTerminado] = useState(false);
  const video = idYoutube(corto.youtube);

  function volver() {
    if (window.history.length > 1) router.back();
    else router.push(`/corto/${corto.id}`);
  }

  // Escape o “Atrás” del control remoto vuelven a la página anterior.
  useEffect(() => {
    function alPresionar(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
      if (e.key === "Escape" || e.key === "BrowserBack" || e.key === "GoBack") {
        e.preventDefault();
        if (window.history.length > 1) router.back();
        else router.push(`/corto/${corto.id}`);
      }
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [router, corto.id]);

  return (
    <div className="flex min-h-svh flex-col bg-black">
      <div className="flex items-center gap-3 px-[var(--gutter)] py-3">
        <button
          type="button"
          data-nav
          onClick={volver}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold text-texto transition-colors hover:bg-white/10"
        >
          <Icono nombre="volver" className="size-6" />
          {textos.volver}
        </button>
        <div className="min-w-0">
          <h1 className="titular truncate text-subtitulo text-texto">{corto.titulo}</h1>
          <p className="truncate text-xs text-texto-suave">
            {cursoYSeccion(corto)} · {corto.anio} · {formatoDuracion(corto.duracion)}
          </p>
        </div>
        {corto.demo && <EtiquetaDemo className="ml-auto shrink-0" />}
      </div>

      <div className="grid flex-1 place-items-center px-[var(--gutter)]">
        <div className="w-full max-w-[calc((100svh-11rem)*16/9)]">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-superficie shadow-2xl shadow-black ring-1 ring-white/10">
            {video ? (
              <VideoYoutube corto={corto} video={video} alTerminar={() => setTerminado(true)} />
            ) : (
              <ReproductorDemo corto={corto} alTerminar={() => setTerminado(true)} />
            )}
            <AnimatePresence>
              {terminado && siguiente && (
                <motion.div
                  className="absolute inset-0 z-10 grid place-items-center bg-black/80 p-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div>
                    <p className="text-sm text-texto-suave">A continuación</p>
                    <p className="titular mt-1 text-titulo text-texto">{siguiente.titulo}</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <Link
                        href={`/ver/${siguiente.id}`}
                        data-nav
                        autoFocus
                        className="inline-flex min-h-12 items-center gap-2 rounded-md bg-rojo px-6 font-bold text-white hover:bg-rojo-hover"
                      >
                        <Icono nombre="play" className="size-5" /> {textos.siguiente}
                      </Link>
                      <button
                        type="button"
                        data-nav
                        onClick={() => setTerminado(false)}
                        className="inline-flex min-h-12 items-center rounded-md bg-texto/20 px-6 font-bold text-texto hover:bg-texto/30"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {corto.demo && <p className="mt-3 text-center text-sm text-texto-suave sm:hidden">{textos.demoAviso}</p>}
        </div>
      </div>

      {siguiente && (
        <div className="flex justify-end px-[var(--gutter)] py-4">
          <Link
            href={`/ver/${siguiente.id}`}
            data-nav
            className="group inline-flex items-center gap-3 rounded-lg bg-superficie/80 p-2 pr-4 ring-1 ring-white/10 transition-colors hover:bg-superficie-alta"
          >
            <span className="relative block aspect-video w-24 overflow-hidden rounded-md bg-superficie-alta sm:w-32">
              <Portada src={siguiente.imagenHorizontal} alt="" sizes="8rem" />
            </span>
            <span className="text-left">
              <span className="flex items-center gap-1 text-xs font-semibold text-texto-suave">
                <Icono nombre="siguiente" className="size-3.5" /> {textos.siguiente}
              </span>
              <span className="titular block text-lg text-texto">{siguiente.titulo}</span>
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}

/* ───────────── YouTube ───────────── */

type JugadorYT = {
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  seekTo(segundos: number, permitir: boolean): void;
  destroy(): void;
};
type ApiYT = {
  Player: new (
    el: HTMLIFrameElement,
    opciones: {
      events: { onReady?: (e: { target: JugadorYT }) => void; onStateChange?: (e: { data: number }) => void };
    },
  ) => JugadorYT;
};
declare global {
  interface Window {
    YT?: ApiYT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function cargarApiYoutube(): Promise<ApiYT> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  return new Promise((resolver) => {
    const anterior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      anterior?.();
      if (window.YT) resolver(window.YT);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      document.head.append(s);
    }
  });
}

function VideoYoutube({ corto, video, alTerminar }: { corto: Corto; video: string; alTerminar: () => void }) {
  const marco = useRef<HTMLIFrameElement>(null);
  const progresos = useProgreso();
  const guardado = useRef(0);
  const terminar = useRef(alTerminar);
  const segundosGuardados = progresos[corto.id]?.segundos ?? 0;
  useEffect(() => {
    terminar.current = alTerminar;
    guardado.current = segundosGuardados;
  });

  useEffect(() => {
    let jugador: JugadorYT | null = null;
    let intervalo = 0;
    let cancelado = false;
    cargarApiYoutube().then((YT) => {
      if (cancelado || !marco.current) return;
      jugador = new YT.Player(marco.current, {
        events: {
          onReady: (e) => {
            const desde = guardado.current;
            if (desde > 5 && desde < e.target.getDuration() - 10) e.target.seekTo(desde, true);
          },
          onStateChange: (e) => {
            if (e.data === 0) {
              guardarProgreso(corto.id, 1, 1); // visto completo: sale de “Seguir viendo”
              terminar.current();
            }
          },
        },
      });
      intervalo = window.setInterval(() => {
        if (jugador && jugador.getPlayerState?.() === 1) {
          const visto = jugador.getCurrentTime();
          const total = jugador.getDuration();
          guardarProgreso(corto.id, visto, total);
          // Cuenta como vista al pasar el 30 % del corto.
          if (total && visto / total >= 0.3) registrarVista(corto.id);
        }
      }, 4000);
    });
    return () => {
      cancelado = true;
      window.clearInterval(intervalo);
      jugador?.destroy?.();
    };
  }, [corto.id, video]);

  // youtube-nocookie + rel=0: sin cookies de seguimiento hasta reproducir y
  // sin recomendaciones de otros canales. cc_load_policy=1 activa subtítulos si existen.
  const parametros = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    iv_load_policy: "3",
    cc_load_policy: "1",
    cc_lang_pref: "es",
    hl: "es",
    enablejsapi: "1",
    autoplay: "1",
  });

  return (
    <iframe
      ref={marco}
      src={`https://www.youtube-nocookie.com/embed/${video}?${parametros}`}
      title={`Reproductor de video: ${corto.titulo}`}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className="absolute inset-0 h-full w-full"
    />
  );
}

/* ───────────── Reproductor DEMO (sin video real) ───────────── */

function formatoTiempo(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function ReproductorDemo({ corto, alTerminar }: { corto: Corto; alTerminar: () => void }) {
  const total = corto.duracion * 60;
  const progresos = useProgreso();
  const guardado = progresos[corto.id]?.segundos ?? 0;
  const [segundos, setSegundos] = useState<number | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const actual = segundos ?? guardado;
  const posicion = useRef(0);
  const terminar = useRef(alTerminar);
  useEffect(() => {
    terminar.current = alTerminar;
  });

  useEffect(() => {
    if (!reproduciendo) return;
    const t = window.setInterval(() => {
      const nuevo = Math.min(total, posicion.current + 1);
      posicion.current = nuevo;
      setSegundos(nuevo);
      if (nuevo % 2 === 0 || nuevo === total) guardarProgreso(corto.id, nuevo, total);
      if (nuevo / total >= 0.3) registrarVista(corto.id);
      if (nuevo >= total) {
        setReproduciendo(false);
        terminar.current();
      }
    }, 1000);
    return () => window.clearInterval(t);
  }, [reproduciendo, total, corto.id]);

  function mover(a: number) {
    posicion.current = a;
    setSegundos(a);
  }

  function alternar() {
    if (segundos === null) mover(guardado >= total ? 0 : guardado);
    setReproduciendo((r) => !r);
  }

  return (
    <div className="absolute inset-0">
      <Portada src={corto.imagenHorizontal} alt={`Imagen de ${corto.titulo}`} sizes="100vw" prioridad />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
      <p className="absolute inset-x-0 top-0 hidden bg-black/60 px-4 py-2 text-center text-sm text-texto sm:block">
        Reproductor de demostración: {textos.demoAviso}
      </p>
      <button
        type="button"
        data-nav
        autoFocus
        onClick={alternar}
        onKeyDown={(e) => {
          if (e.key === " ") {
            e.preventDefault();
            alternar();
          }
        }}
        aria-label={
          reproduciendo ? "Pausar" : actual > 0 ? `Reanudar desde ${formatoTiempo(actual)}` : textos.reproducir
        }
        className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-rojo text-white shadow-2xl shadow-black/60 transition-transform hover:scale-105 active:scale-95 sm:size-20 lg:size-24"
      >
        <Icono nombre={reproduciendo ? "pausa" : "play"} className="size-7 sm:size-9 lg:size-10" />
      </button>
      <div className="absolute inset-x-0 bottom-0 px-3 pb-1.5 sm:p-5">
        <label className="sr-only" htmlFor="tiempo-demo">
          Posición de la reproducción
        </label>
        <input
          id="tiempo-demo"
          type="range"
          min={0}
          max={total}
          step={1}
          value={actual}
          onChange={(e) => {
            const v = Number(e.target.value);
            mover(v);
            guardarProgreso(corto.id, v, total);
          }}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-rojo"
          style={{
            background: `linear-gradient(to right, var(--c-rojo) ${(actual / total) * 100}%, rgba(255,255,255,0.25) 0)`,
          }}
        />
        <div className="mt-1 flex justify-between text-xs sm:mt-2 font-medium text-texto/90 tabular-nums">
          <span>{formatoTiempo(actual)}</span>
          <span>{formatoTiempo(total)}</span>
        </div>
      </div>
    </div>
  );
}
