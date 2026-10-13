/**
 * ─────────────────────────────────────────────────────────────
 *  INFOCINE · Catálogo de cortometrajes
 *
 *  Para agregar un corto nuevo, copiá uno de los bloques de abajo
 *  (desde “{” hasta “},”), pegalo al principio de la lista y
 *  cambiá los datos. Guía paso a paso en el README.
 *
 *  ⚠️ Los 8 cortos de este archivo son de EJEMPLO (demo: true).
 *  Borralos cuando cargues los cortos reales.
 * ─────────────────────────────────────────────────────────────
 */
import type { Genero } from "@/config/sitio";

export type Equipo = {
  direccion: string[];
  guion: string[];
  elenco: string[];
  edicion: string[];
  fotografia?: string[];
  sonido?: string[];
};

export type Corto = {
  /** Identificador único, en minúsculas y con guiones. Se usa en la URL: /corto/<id> */
  id: string;
  titulo: string;
  sinopsis: string;
  anio: number;
  /** Duración en minutos. */
  duracion: number;
  /** Curso, por ejemplo "1ero", "2do" o "3ero". */
  curso: string;
  /** Sección, por ejemplo "1era", "2da" o "3era". */
  seccion: string;
  generos: Genero[];
  /** Materia o proyecto en el que se hizo el corto. */
  materia: string;
  equipo: Equipo;
  profesorGuia: string;
  /** Portada vertical (2:3), por ejemplo "/portadas/mi-corto-vertical.jpg". */
  portada: string;
  /** Imagen horizontal (16:9), por ejemplo "/portadas/mi-corto-horizontal.jpg". */
  imagenHorizontal: string;
  /** Enlace de YouTube (no listado). Dejalo en null si todavía no está subido. */
  youtube: string | null;
  /** ¿Aparece en el carrusel grande de Inicio? */
  destacado: boolean;
  /** Premios o menciones. Si tiene alguno, aparece en “Premiados”. */
  premios: string[];
  /** Fecha en que se agregó a Infocine (AAAA-MM-DD). Ordena “Recién agregados”. */
  agregado: string;
  /** Marca de corto de ejemplo. No la uses en cortos reales. */
  demo?: boolean;
};

const equipoDemo = (n: number): Equipo => ({
  direccion: [`Integrante DEMO ${n}A`],
  guion: [`Integrante DEMO ${n}B`, `Integrante DEMO ${n}C`],
  elenco: [`Integrante DEMO ${n}D`, `Integrante DEMO ${n}E`, `Integrante DEMO ${n}F`],
  edicion: [`Integrante DEMO ${n}G`],
  fotografia: [`Integrante DEMO ${n}H`],
  sonido: [`Integrante DEMO ${n}I`],
});

export const cortos: Corto[] = [
  {
    id: "demo-la-ultima-clase",
    titulo: "La última clase",
    sinopsis:
      "[DEMO] Es el último día antes de las vacaciones de invierno y un profesor de taller decide que su clase no termina hasta que cada estudiante arregle algo que creía roto. Un drama sobre despedidas, herramientas y segundas oportunidades.",
    anio: 2026,
    duracion: 12,
    curso: "3ero",
    seccion: "1era",
    generos: ["drama"],
    materia: "Proyecto de Lenguaje Audiovisual (DEMO)",
    equipo: equipoDemo(1),
    profesorGuia: "Profesor/a DEMO",
    portada: "/portadas/demo/demo-la-ultima-clase-vertical.svg",
    imagenHorizontal: "/portadas/demo/demo-la-ultima-clase-horizontal.svg",
    youtube: null,
    destacado: true,
    premios: ["Mejor corto · Muestra Infocine 2026 (DEMO)"],
    agregado: "2026-09-20",
    demo: true,
  },
  {
    id: "demo-engranaje",
    titulo: "Engranaje",
    sinopsis:
      "[DEMO] Una pieza diminuta se escapa de una máquina y recorre el colegio buscando su lugar. Animación cuadro por cuadro hecha con recortes de papel y piezas del taller de mecánica.",
    anio: 2026,
    duracion: 6,
    curso: "1ero",
    seccion: "3era",
    generos: ["animacion", "experimental"],
    materia: "Taller de Animación (DEMO)",
    equipo: equipoDemo(2),
    profesorGuia: "Profesor/a DEMO",
    portada: "/portadas/demo/demo-engranaje-vertical.svg",
    imagenHorizontal: "/portadas/demo/demo-engranaje-horizontal.svg",
    youtube: null,
    destacado: true,
    premios: [],
    agregado: "2026-09-12",
    demo: true,
  },
  {
    id: "demo-corriente-alterna",
    titulo: "Corriente alterna",
    sinopsis:
      "[DEMO] En el laboratorio de electricidad, dos estudiantes descubren que un viejo transformador les deja hablar con quienes ocupaban su pupitre treinta años atrás. Ciencia ficción con olor a soldadura.",
    anio: 2026,
    duracion: 15,
    curso: "3ero",
    seccion: "2da",
    generos: ["ciencia-ficcion", "drama"],
    materia: "Proyecto Integrador de Electricidad (DEMO)",
    equipo: equipoDemo(3),
    profesorGuia: "Profesor/a DEMO",
    portada: "/portadas/demo/demo-corriente-alterna-vertical.svg",
    imagenHorizontal: "/portadas/demo/demo-corriente-alterna-horizontal.svg",
    youtube: null,
    destacado: true,
    premios: [],
    agregado: "2026-08-30",
    demo: true,
  },
  {
    id: "demo-voces-del-mercado",
    titulo: "Voces del Mercado",
    sinopsis:
      "[DEMO] Un recorrido de madrugada por un mercado de Asunción contado por quienes lo abren todos los días. Documental de observación grabado con celulares.",
    anio: 2025,
    duracion: 18,
    curso: "2do",
    seccion: "1era",
    generos: ["documental"],
    materia: "Ciencias Sociales · Proyecto Comunidad (DEMO)",
    equipo: equipoDemo(4),
    profesorGuia: "Profesor/a DEMO",
    portada: "/portadas/demo/demo-voces-del-mercado-vertical.svg",
    imagenHorizontal: "/portadas/demo/demo-voces-del-mercado-horizontal.svg",
    youtube: null,
    destacado: false,
    premios: ["Mención especial · Documental (DEMO)"],
    agregado: "2026-08-15",
    demo: true,
  },
  {
    id: "demo-el-turno-noche",
    titulo: "El turno noche",
    sinopsis:
      "[DEMO] Nadie se queda en el colegio después de las diez. Nadie, salvo el sereno… y algo que hace funcionar los tornos cuando todos se fueron. Terror de pasillos y luces de emergencia.",
    anio: 2025,
    duracion: 10,
    curso: "3ero",
    seccion: "2da",
    generos: ["terror", "suspenso"],
    materia: "Lenguaje Audiovisual (DEMO)",
    equipo: equipoDemo(5),
    profesorGuia: "Profesor/a DEMO",
    portada: "/portadas/demo/demo-el-turno-noche-vertical.svg",
    imagenHorizontal: "/portadas/demo/demo-el-turno-noche-horizontal.svg",
    youtube: null,
    destacado: false,
    premios: [],
    agregado: "2026-07-28",
    demo: true,
  },
  {
    id: "demo-terere-a-las-tres",
    titulo: "Tereré a las tres",
    sinopsis:
      "[DEMO] Un termo, una guampa y un recreo demasiado corto. Cuatro amigos intentan resolver el misterio de quién se tomó el último tereré antes de que toque el timbre. Comedia.",
    anio: 2024,
    duracion: 8,
    curso: "2do",
    seccion: "1era",
    generos: ["comedia"],
    materia: "Castellano · Guion (DEMO)",
    equipo: equipoDemo(6),
    profesorGuia: "Profesor/a DEMO",
    portada: "/portadas/demo/demo-terere-a-las-tres-vertical.svg",
    imagenHorizontal: "/portadas/demo/demo-terere-a-las-tres-horizontal.svg",
    youtube: null,
    destacado: false,
    premios: [],
    agregado: "2026-06-10",
    demo: true,
  },
  {
    id: "demo-lo-que-dejo-la-lluvia",
    titulo: "Lo que dejó la lluvia",
    sinopsis:
      "[DEMO] Después de una tormenta, una estudiante encuentra en el patio una caja con cartas que nunca llegaron a destino. Drama de suspenso sobre secretos de familia.",
    anio: 2024,
    duracion: 14,
    curso: "3ero",
    seccion: "1era",
    generos: ["drama", "suspenso"],
    materia: "Proyecto de Lenguaje Audiovisual (DEMO)",
    equipo: equipoDemo(7),
    profesorGuia: "Profesor/a DEMO",
    portada: "/portadas/demo/demo-lo-que-dejo-la-lluvia-vertical.svg",
    imagenHorizontal: "/portadas/demo/demo-lo-que-dejo-la-lluvia-horizontal.svg",
    youtube: null,
    destacado: false,
    premios: ["Mejor guion · Muestra Infocine 2024 (DEMO)"],
    agregado: "2026-05-02",
    demo: true,
  },
  {
    id: "demo-hora-libre",
    titulo: "Hora libre",
    sinopsis:
      "[DEMO] Una hora sin profesor, un aula vacía y una banda que nunca ensayó junta. Comedia musical sobre animarse a subir al escenario en el acto del colegio.",
    anio: 2025,
    duracion: 9,
    curso: "1ero",
    seccion: "3era",
    generos: ["comedia", "musical"],
    materia: "Educación Artística (DEMO)",
    equipo: equipoDemo(8),
    profesorGuia: "Profesor/a DEMO",
    portada: "/portadas/demo/demo-hora-libre-vertical.svg",
    imagenHorizontal: "/portadas/demo/demo-hora-libre-horizontal.svg",
    youtube: null,
    destacado: false,
    premios: [],
    agregado: "2026-04-18",
    demo: true,
  },
];
