"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { textos } from "@/config/sitio";
import { guardarProgreso, useProgreso } from "@/lib/almacen";
import { registrarVista } from "@/lib/estadisticas";
import { formatoDuracion, idYoutube, type Corto } from "@/lib/cortos";
import { Portada } from "./Portada";
import { Icono } from "./Icono";
import { EtiquetaDemo } from "./Etiquetas";

const SEGUNDOS_BARRA = 3500;

/** El navegador de este equipo permite pasar un elemento a pantalla completa (iPhone no). */
const sinSuscripcion = () => () => {};
const fullscreenDisponible = () => document.fullscreenEnabled;
const sinDatosDelServidor = () => null;

/**
 * Reproductor a pantalla completa, como en Netflix: el video ocupa toda la ventana,
 * la barra de arriba (volver, título, siguiente, pantalla completa) se oculta sola
 * y vuelve al mover el mouse, tocar o acercarse al borde superior.
 */
export function Reproductor({ corto, siguiente }: { corto: Corto; siguiente?: Corto }) {
  const router = useRouter();
  const contenedor = useRef<HTMLDivElement>(null);
  const temporizador = useRef(0);
  const [terminado, setTerminado] = useState(false);
  const [barra, setBarra] = useState(true);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const video = idYoutube(corto.youtube);
  // null mientras se hidrata. Si se puede, la pantalla completa la maneja Infocine
  // (así la barra y el “siguiente” siguen disponibles) y se oculta el botón de YouTube.
  const fullscreenPropio = useSyncExternalStore(sinSuscripcion, fullscreenDisponible, sinDatosDelServidor);

  const mostrarBarra = useCallback(() => {
    setBarra(true);
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => setBarra(false), SEGUNDOS_BARRA);
  }, []);

  function volver() {
    if (window.history.length > 1) router.back();
    else router.push(`/corto/${corto.id}`);
  }

  const alternarPantallaCompleta = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void contenedor.current?.requestFullscreen?.({ navigationUI: "hide" })?.catch(() => {});
  }, []);

  // La barra se esconde sola unos segundos después de entrar.
  useEffect(() => {
    temporizador.current = window.setTimeout(() => setBarra(false), SEGUNDOS_BARRA);
    return () => window.clearTimeout(temporizador.current);
  }, []);

  // Intenta entrar en pantalla completa al abrir (el navegador solo lo deja si el
  // clic en “Ver ahora” fue reciente; si no, queda la ventana completa y el botón).
  useEffect(() => {
    const el = contenedor.current;
    const alCambiar = () => setPantallaCompleta(document.fullscreenElement === el);
    document.addEventListener("fullscreenchange", alCambiar);
    const orientacion = screen.orientation as (ScreenOrientation & { lock?: (o: string) => Promise<void> }) | undefined;
    Promise.resolve(el?.requestFullscreen?.({ navigationUI: "hide" }))
      .then(() => {
        if (document.fullscreenElement) return orientacion?.lock?.("landscape"); // celulares: acostar el video
      })
      .catch(() => {});
    return () => {
      document.removeEventListener("fullscreenchange", alCambiar);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
      try {
        orientacion?.unlock?.();
      } catch {}
    };
  }, []);

  // Escape o “Atrás” del control remoto vuelven a la página anterior; F alterna la pantalla completa.
  useEffect(() => {
    function alPresionar(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
      if (e.key === "Escape" || e.key === "BrowserBack" || e.key === "GoBack") {
        e.preventDefault();
        if (window.history.length > 1) router.back();
        else router.push(`/corto/${corto.id}`);
      } else if ((e.key === "f" || e.key === "F") && !e.ctrlKey && !e.metaKey && !e.altKey) {
        alternarPantallaCompleta();
      }
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [router, corto.id, alternarPantallaCompleta]);

  return (
    <div
      ref={contenedor}
      className="fixed inset-0 z-50 overflow-hidden bg-black"
      onPointerMove={mostrarBarra}
      onPointerDown={mostrarBarra}
      onKeyDown={mostrarBarra}
    >
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative aspect-video w-[min(100vw,calc(100svh*16/9))] bg-superficie">
          {video ? (
            fullscreenPropio !== null && (
              <VideoYoutube
                corto={corto}
                video={video}
                botonYoutube={!fullscreenPropio}
                alTerminar={() => setTerminado(true)}
              />
            )
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
        {corto.demo && (
          <p className="absolute inset-x-0 bottom-6 hidden px-6 text-center text-sm text-texto-suave portrait:max-sm:block">
            {textos.demoAviso}
          </p>
        )}
      </div>

      {/* El iframe de YouTube se queda con los eventos del mouse: esta franja los recibe y trae la barra. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-20 h-20" onPointerEnter={mostrarBarra} />

      <div
        className={`absolute inset-x-0 top-0 z-30 flex items-center gap-2 bg-gradient-to-b from-black/85 via-black/40 to-transparent px-[var(--gutter)] pt-3 pb-10 transition-opacity duration-300 sm:gap-3 ${
          barra
            ? "opacity-100"
            : "pointer-events-none opacity-0 focus-within:pointer-events-auto focus-within:opacity-100"
        }`}
      >
        <button
          type="button"
          data-nav
          onClick={volver}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 font-semibold text-texto transition-colors hover:bg-white/10"
        >
          <Icono nombre="volver" className="size-6" />
          <span className="max-sm:sr-only">{textos.volver}</span>
        </button>
        <div className="min-w-0">
          <h1 className="titular truncate text-subtitulo text-texto">{corto.titulo}</h1>
          <p className="truncate text-xs text-texto-suave">
            {corto.anio} · {formatoDuracion(corto.duracion)}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {corto.demo && <EtiquetaDemo className="mr-1" />}
          {siguiente && (
            <Link
              href={`/ver/${siguiente.id}`}
              data-nav
              title={`${textos.siguiente}: ${siguiente.titulo}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold text-texto transition-colors hover:bg-white/10"
            >
              <Icono nombre="siguiente" className="size-5" />
              <span className="max-md:sr-only">{textos.siguiente}</span>
            </Link>
          )}
          {fullscreenPropio && (
            <button
              type="button"
              data-nav
              onClick={alternarPantallaCompleta}
              aria-label={pantallaCompleta ? "Salir de pantalla completa" : "Pantalla completa"}
              title={pantallaCompleta ? "Salir de pantalla completa (F)" : "Pantalla completa (F)"}
              className="inline-flex size-11 items-center justify-center rounded-full text-texto transition-colors hover:bg-white/10"
            >
              <Icono nombre={pantallaCompleta ? "salirPantallaCompleta" : "pantallaCompleta"} className="size-6" />
            </button>
          )}
        </div>
      </div>
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

function VideoYoutube({
  corto,
  video,
  botonYoutube,
  alTerminar,
}: {
  corto: Corto;
  video: string;
  /** Muestra el botón de pantalla completa de YouTube (solo si Infocine no puede manejarla). */
  botonYoutube: boolean;
  alTerminar: () => void;
}) {
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
    fs: botonYoutube ? "1" : "0",
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
      <p className="absolute inset-x-0 top-24 hidden bg-black/60 px-4 py-2 text-center text-sm text-texto sm:block">
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
