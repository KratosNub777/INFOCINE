"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { textos } from "@/config/sitio";
import { guardarProgreso, useProgreso } from "@/lib/almacen";
import { registrarVista } from "@/lib/estadisticas";
import { formatoDuracion, idYoutube, type Corto } from "@/lib/cortos";
import { Portada } from "./Portada";
import { Icono, type NombreIcono } from "./Icono";
import { EtiquetaDemo } from "./Etiquetas";

const SEGUNDOS_BARRA = 3500;
const SALTO = 10;

/** Lo que el reproductor de abajo (YouTube o demo) le cuenta a los controles. */
type Estado = { listo: boolean; reproduciendo: boolean; tiempo: number; total: number; audio: boolean; silenciado: boolean };
/** Lo que los controles le piden al reproductor de abajo. */
type Mando = { alternar(): void; ir(segundos: number): void; silenciar(): void };

/** El navegador de este equipo permite pasar un elemento a pantalla completa (iPhone no). */
const sinSuscripcion = () => () => {};
const fullscreenDisponible = () => document.fullscreenEnabled;
const sinDatosDelServidor = () => null;

/**
 * Reproductor a pantalla completa, como en Netflix: el video ocupa toda la ventana
 * y los controles (volver arriba; progreso, play, ±10 s, volumen, título, siguiente
 * y pantalla completa abajo) se ocultan solos y vuelven al mover el mouse o tocar.
 */
export function Reproductor({ corto, siguiente }: { corto: Corto; siguiente?: Corto }) {
  const router = useRouter();
  const contenedor = useRef<HTMLDivElement>(null);
  const temporizador = useRef(0);
  const [terminado, setTerminado] = useState(false);
  const [barra, setBarra] = useState(true);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [estado, setEstado] = useState<Estado>({
    listo: false,
    reproduciendo: false,
    tiempo: 0,
    total: corto.duracion * 60,
    audio: false,
    silenciado: false,
  });
  const mando = useRef<Mando | null>(null);
  const estadoActual = useRef(estado);
  useEffect(() => {
    estadoActual.current = estado;
  });
  const actualizar = useCallback((cambios: Partial<Estado>) => setEstado((e) => ({ ...e, ...cambios })), []);
  const registrar = useCallback((m: Mando | null) => {
    mando.current = m;
  }, []);
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

  const saltar = useCallback((delta: number) => {
    const { tiempo, total } = estadoActual.current;
    mando.current?.ir(Math.max(0, Math.min(total, tiempo + delta)));
  }, []);

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
      } else if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      } else if (e.key === "f" || e.key === "F") {
        alternarPantallaCompleta();
      } else if (e.key === "j" || e.key === "J") {
        saltar(-SALTO);
      } else if (e.key === "l" || e.key === "L") {
        saltar(SALTO);
      } else if (e.key === "m" || e.key === "M") {
        mando.current?.silenciar();
      } else if (e.key === "k" || e.key === "K") {
        mando.current?.alternar();
      }
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [router, corto.id, alternarPantallaCompleta, saltar]);

  // En pausa los controles se quedan a la vista.
  const controlesVisibles = barra || !estado.reproduciendo;

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
                registrar={registrar}
                alEstado={actualizar}
                alTerminar={() => setTerminado(true)}
              />
            )
          ) : (
            <ReproductorDemo
              corto={corto}
              registrar={registrar}
              alEstado={actualizar}
              alTerminar={() => setTerminado(true)}
            />
          )}
          {/* Capa sobre el video: clic = play/pausa, doble clic = pantalla completa (el iframe no recibe clics). */}
          <button
            type="button"
            data-nav
            autoFocus
            onClick={() => mando.current?.alternar()}
            onDoubleClick={() => fullscreenPropio && alternarPantallaCompleta()}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                saltar(e.key === "ArrowLeft" ? -SALTO : SALTO);
              }
            }}
            aria-label={estado.reproduciendo ? "Pausar" : textos.reproducir}
            className="absolute inset-0 z-[5] grid cursor-default place-items-center focus-visible:outline-offset-[-6px]"
          >
            {estado.listo && !estado.reproduciendo && (
              <span className="grid size-16 place-items-center rounded-full bg-black/55 text-white ring-1 ring-white/30 sm:size-20">
                <Icono nombre="play" className="size-8 translate-x-0.5 sm:size-10" />
              </span>
            )}
          </button>
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
          <p className="absolute inset-x-0 top-20 hidden px-6 text-center text-sm text-texto-suave portrait:max-sm:block">
            {textos.demoAviso}
          </p>
        )}
      </div>

      {/* Arriba: solo volver (y la etiqueta DEMO) */}
      <div
        className={`absolute inset-x-0 top-0 z-30 flex items-center gap-3 bg-gradient-to-b from-black/80 to-transparent px-[var(--gutter)] pt-3 pb-12 transition-opacity duration-300 ${
          controlesVisibles
            ? "opacity-100"
            : "pointer-events-none opacity-0 focus-within:pointer-events-auto focus-within:opacity-100"
        }`}
      >
        <button
          type="button"
          data-nav
          onClick={volver}
          aria-label={textos.volver}
          title={textos.volver}
          className="inline-flex size-11 items-center justify-center rounded-full text-texto transition-colors hover:bg-white/10"
        >
          <Icono nombre="volver" className="size-7" />
        </button>
        {corto.demo && <EtiquetaDemo className="ml-auto" />}
      </div>

      {/* Abajo: progreso y controles */}
      <div
        className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-[var(--gutter)] pt-16 pb-3 transition-opacity duration-300 sm:pb-5 ${
          controlesVisibles
            ? "opacity-100"
            : "pointer-events-none opacity-0 focus-within:pointer-events-auto focus-within:opacity-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor="tiempo">
            Posición de la reproducción
          </label>
          <input
            id="tiempo"
            type="range"
            min={0}
            max={estado.total || 1}
            step={1}
            value={Math.min(estado.tiempo, estado.total || 1)}
            onChange={(e) => mando.current?.ir(Number(e.target.value))}
            className="barra-progreso h-5 min-w-0 flex-1"
            style={{ "--avance": `${estado.total ? (estado.tiempo / estado.total) * 100 : 0}%` } as CSSProperties}
          />
          <span className="w-12 shrink-0 text-right text-sm font-medium text-texto tabular-nums">
            {formatoTiempo(Math.max(0, estado.total - estado.tiempo))}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-0.5 sm:gap-1">
          <BotonControl
            nombre={estado.reproduciendo ? "pausa" : "play"}
            etiqueta={estado.reproduciendo ? "Pausar (K)" : `${textos.reproducir} (K)`}
            onClick={() => mando.current?.alternar()}
            grande
          />
          <BotonControl nombre="atras10" etiqueta={`Retroceder ${SALTO} segundos (J)`} onClick={() => saltar(-SALTO)} />
          <BotonControl nombre="adelante10" etiqueta={`Adelantar ${SALTO} segundos (L)`} onClick={() => saltar(SALTO)} />
          {estado.audio && (
            <BotonControl
              nombre={estado.silenciado ? "silencio" : "volumen"}
              etiqueta={estado.silenciado ? "Activar sonido (M)" : "Silenciar (M)"}
              onClick={() => mando.current?.silenciar()}
            />
          )}

          <p className="titular min-w-0 flex-1 truncate px-3 text-center text-base text-texto max-sm:hidden">
            {corto.titulo}
            <span className="ml-2 text-sm font-medium text-texto-suave">
              {corto.anio} · {formatoDuracion(corto.duracion)}
            </span>
          </p>
          <span className="flex-1 sm:hidden" />

          {siguiente && (
            <Link
              href={`/ver/${siguiente.id}`}
              data-nav
              aria-label={`${textos.siguiente}: ${siguiente.titulo}`}
              title={`${textos.siguiente}: ${siguiente.titulo}`}
              className="inline-flex size-11 items-center justify-center rounded-full text-texto transition-colors hover:bg-white/10 sm:size-12"
            >
              <Icono nombre="siguiente" className="size-6 sm:size-7" />
            </Link>
          )}
          {fullscreenPropio && (
            <BotonControl
              nombre={pantallaCompleta ? "salirPantallaCompleta" : "pantallaCompleta"}
              etiqueta={pantallaCompleta ? "Salir de pantalla completa (F)" : "Pantalla completa (F)"}
              onClick={alternarPantallaCompleta}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function formatoTiempo(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function BotonControl({
  nombre,
  etiqueta,
  onClick,
  grande = false,
}: {
  nombre: NombreIcono;
  etiqueta: string;
  onClick: () => void;
  grande?: boolean;
}) {
  return (
    <button
      type="button"
      data-nav
      onClick={onClick}
      aria-label={etiqueta}
      title={etiqueta}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-texto transition-[background-color,transform] hover:bg-white/10 active:scale-90 sm:size-12"
    >
      <Icono nombre={nombre} className={grande ? "size-7 sm:size-8" : "size-6 sm:size-7"} />
    </button>
  );
}

/* ───────────── YouTube ───────────── */

type JugadorYT = {
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  seekTo(segundos: number, permitir: boolean): void;
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
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
  registrar,
  alEstado,
  alTerminar,
}: {
  corto: Corto;
  video: string;
  registrar: (mando: Mando | null) => void;
  alEstado: (cambios: Partial<Estado>) => void;
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
    let intervaloBarra = 0;
    let cancelado = false;
    cargarApiYoutube().then((YT) => {
      if (cancelado || !marco.current) return;
      jugador = new YT.Player(marco.current, {
        events: {
          onReady: (e) => {
            const desde = guardado.current;
            if (desde > 5 && desde < e.target.getDuration() - 10) e.target.seekTo(desde, true);
            registrar({
              alternar: () => (e.target.getPlayerState() === 1 ? e.target.pauseVideo() : e.target.playVideo()),
              ir: (segundos) => {
                e.target.seekTo(segundos, true);
                alEstado({ tiempo: segundos });
              },
              silenciar: () => {
                if (e.target.isMuted()) e.target.unMute();
                else e.target.mute();
                alEstado({ silenciado: e.target.isMuted() });
              },
            });
            alEstado({ listo: true, audio: true, total: e.target.getDuration(), silenciado: e.target.isMuted() });
          },
          onStateChange: (e) => {
            if (e.data === 1) alEstado({ reproduciendo: true });
            else if (e.data === 2 || e.data === 0) alEstado({ reproduciendo: false });
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
      // Posición para la barra de progreso.
      intervaloBarra = window.setInterval(() => {
        if (!jugador?.getDuration) return;
        alEstado({ tiempo: jugador.getCurrentTime(), total: jugador.getDuration() });
      }, 500);
    });
    return () => {
      cancelado = true;
      window.clearInterval(intervalo);
      window.clearInterval(intervaloBarra);
      registrar(null);
      jugador?.destroy?.();
    };
  }, [corto.id, video, registrar, alEstado]);

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
    controls: "0", // los controles son los de Infocine
    fs: "0",
    disablekb: "1",
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

function ReproductorDemo({
  corto,
  registrar,
  alEstado,
  alTerminar,
}: {
  corto: Corto;
  registrar: (mando: Mando | null) => void;
  alEstado: (cambios: Partial<Estado>) => void;
  alTerminar: () => void;
}) {
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

  // Los controles de Reproductor mandan sobre este “video”.
  useEffect(() => {
    registrar({
      alternar,
      ir: (v) => {
        mover(v);
        guardarProgreso(corto.id, v, total);
      },
      silenciar: () => {},
    });
  });
  useEffect(() => () => registrar(null), [registrar]);
  useEffect(() => {
    alEstado({ listo: true, reproduciendo, tiempo: actual, total });
  }, [alEstado, reproduciendo, actual, total]);

  return (
    <div className="absolute inset-0">
      <Portada src={corto.imagenHorizontal} alt={`Imagen de ${corto.titulo}`} sizes="100vw" prioridad />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
      <p className="absolute inset-x-0 top-24 hidden bg-black/60 px-4 py-2 text-center text-sm text-texto sm:block">
        Reproductor de demostración: {textos.demoAviso}
      </p>
    </div>
  );
}
