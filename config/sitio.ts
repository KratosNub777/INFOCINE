/**
 * ─────────────────────────────────────────────────────────────
 *  INFOCINE · Configuración central
 *  Colores y textos principales del sitio. Cambiá acá y se
 *  actualiza toda la plataforma.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Paleta tomada del escudo del Colegio Técnico Nacional
 * (engranaje dorado, círculo rojo y azul marino, rayo blanco).
 * Para confirmarla con el logo real: `npm run colores` (ver README).
 *
 * Contraste verificado (WCAG AA, texto normal ≥ 4.5:1):
 *  - texto sobre fondo ............ 18.0:1
 *  - textoSuave sobre fondo ....... 8.6:1
 *  - blanco sobre rojo (botones) .. 5.1:1
 *  - rojoTexto sobre fondo ........ 5.8:1  (el rojo puro da 3.9:1: solo para fondos)
 *  - dorado sobre fondo ........... 9.4:1
 *  - fondo sobre dorado ........... 9.4:1
 */
export const colores = {
  /** Color de acción: botones principales, barra de progreso, “Nuevo”. */
  rojo: "#D4262C",
  rojoHover: "#B81E24",
  /** Rojo aclarado para texto chico sobre fondo oscuro (AA). */
  rojoTexto: "#F0555A",
  /** Fondos de acento y degradados. */
  azul: "#1B2A78",
  azulOscuro: "#0F1638",
  /** Detalles: premios, estrellas, destacados, foco visible. */
  dorado: "#E5A91A",
  /** Fondo general (negro azulado) y superficies. */
  fondo: "#0A0B12",
  superficie: "#12142A",
  superficieAlta: "#1A1D3A",
  borde: "#2A2E52",
  /** Textos. */
  texto: "#F5F5F7",
  textoSuave: "#A9ABB8",
} as const;

export const sitio = {
  nombre: "Infocine",
  colegio: "Colegio Técnico Nacional",
  ciudad: "Asunción",
  pais: "Paraguay",
  idioma: "es-PY",
  /** URL pública. En Vercel se completa sola; podés fijarla con NEXT_PUBLIC_SITIO_URL. */
  url:
    process.env.NEXT_PUBLIC_SITIO_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  descripcion:
    "Infocine es la plataforma de cortometrajes hechos por estudiantes del Colegio Técnico Nacional de Asunción, Paraguay. Mirá dramas, comedias, documentales y animaciones creados en clase.",
  lema: "El cine que se hace en el Técnico",
  aviso: "Los cortometrajes pertenecen a sus autores, estudiantes del Colegio Técnico Nacional.",
  /** Correo de contacto que aparece en Privacidad y Términos (pedidos de borrado, dudas). */
  contacto: "facundovera0702@gmail.com",
  /** Cambiá esta fecha cada vez que modifiques /privacidad o /terminos. */
  legalesActualizados: "16 de octubre de 2026",
  /** Cuántos cortos (los más recientes) llevan la etiqueta “Nuevo”. */
  cantidadNuevos: 3,
  /** Segundos entre cada destacado del hero. */
  segundosHero: 8,
  /** En Inicio, las filas por género y año se muestran si tienen al menos esta cantidad. */
  minimoPorFila: 2,
} as const;

export const navegacion = [
  { href: "/", etiqueta: "Inicio", icono: "inicio" },
  { href: "/cortometrajes", etiqueta: "Cortometrajes", icono: "cortos" },
  { href: "/por-anio", etiqueta: "Por año", icono: "anios" },
  { href: "/mi-lista", etiqueta: "Mi lista", icono: "lista" },
] as const;

/** Géneros disponibles. La clave es la que se usa en data/cortos.ts. */
export const generos = {
  drama: "Drama",
  comedia: "Comedia",
  documental: "Documental",
  animacion: "Animación",
  terror: "Terror",
  suspenso: "Suspenso",
  "ciencia-ficcion": "Ciencia ficción",
  experimental: "Experimental",
  musical: "Musical",
  romance: "Romance",
} as const;

export type Genero = keyof typeof generos;

/** Textos de la interfaz. */
export const textos = {
  verAhora: "Ver ahora",
  masInformacion: "Más información",
  reproducir: "Reproducir",
  agregarMiLista: "Agregar a Mi lista",
  quitarMiLista: "Quitar de Mi lista",
  enMiLista: "En Mi lista",
  miLista: "Mi lista",
  nuevo: "Nuevo",
  demo: "DEMO",
  destacado: "Destacado",
  buscar: "Buscar",
  buscarPlaceholder: "Título, año, género o integrante…",
  buscarAyuda: "Probá con “2025”, “documental” o el nombre de alguien del equipo.",
  sinResultados: "No encontramos cortos con esa búsqueda.",
  filtros: "Filtros",
  todos: "Todos",
  volver: "Volver",
  siguiente: "Siguiente corto",
  recomendados: "Cortos recomendados",
  cerrar: "Cerrar",
  filas: {
    seguirViendo: "Seguir viendo",
    recientes: "Recién agregados",
    miLista: "Mi lista",
    premiados: "Premiados y destacados por los profesores",
    genero: (genero: string) => genero,
    anio: (anio: number) => `Cortos del ${anio}`,
  },
  ficha: {
    sinopsis: "Sinopsis",
    fichaTecnica: "Ficha técnica",
    equipo: "Equipo",
    relacionados: "Cortos relacionados",
    premios: "Premios y reconocimientos",
    anio: "Año",
    duracion: "Duración",
    genero: "Género",
    materia: "Materia o proyecto",
    direccion: "Dirección",
    guion: "Guion",
    elenco: "Elenco",
    edicion: "Edición",
    fotografia: "Fotografía",
    sonido: "Sonido",
    profesorGuia: "Profesor/a guía",
    paginaCompleta: "Abrir ficha completa",
  },
  miListaVacia: "Todavía no guardaste ningún corto. Tocá el botón “+” en cualquier corto para sumarlo acá.",
  miListaSinSesion:
    "Iniciá sesión para armar tu lista y verla en cualquier dispositivo. Para mirar los cortos no necesitás cuenta.",
  demoAviso: "Este es un corto de ejemplo (DEMO) para mostrar cómo se ve la plataforma. No tiene video real.",
  acceso: {
    titulo: "Acceso para la comunidad del Técnico",
    descripcion:
      "Esta plataforma es de uso exclusivo del Colegio Técnico Nacional. Ingresá el código que te dio tu profesor/a.",
    etiqueta: "Código de acceso",
    boton: "Entrar",
    error: "El código no es correcto. Revisalo e intentá de nuevo.",
    libre: "El acceso a Infocine es libre. No necesitás código.",
  },
} as const;
