import { cortos, type Corto } from "@/data/cortos";
import { generos, sitio, type Genero } from "@/config/sitio";

export type { Corto };

export function todosLosCortos(): Corto[] {
  return cortos;
}

export function buscarCorto(id: string): Corto | undefined {
  return cortos.find((c) => c.id === id);
}

/** “3ero 1era” */
export function cursoYSeccion(c: Pick<Corto, "curso" | "seccion">): string {
  return `${c.curso} ${c.seccion}`;
}

export function nombreGenero(g: Genero): string {
  return generos[g] ?? g;
}

export function formatoDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Número que ordena cursos y secciones: “1ero” → 1, “3era” → 3. */
function numero(texto: string): number {
  const n = parseInt(texto, 10);
  return Number.isNaN(n) ? 99 : n;
}

export function porReciente(lista: Corto[] = cortos): Corto[] {
  return [...lista].sort((a, b) => b.agregado.localeCompare(a.agregado));
}

const idsNuevos = new Set(
  porReciente()
    .slice(0, sitio.cantidadNuevos)
    .map((c) => c.id),
);

export function esNuevo(c: Corto): boolean {
  return idsNuevos.has(c.id);
}

export function destacados(): Corto[] {
  const lista = cortos.filter((c) => c.destacado);
  return (lista.length ? lista : porReciente()).slice(0, 3);
}

export function premiados(): Corto[] {
  return porReciente(cortos.filter((c) => c.premios.length > 0 || c.destacado)).sort(
    (a, b) => b.premios.length - a.premios.length,
  );
}

export type Grupo = { clave: string; titulo: string; cortos: Corto[] };

export function agruparPorCurso(): Grupo[] {
  const mapa = new Map<string, Corto[]>();
  for (const c of cortos) {
    const clave = cursoYSeccion(c);
    mapa.set(clave, [...(mapa.get(clave) ?? []), c]);
  }
  return [...mapa.entries()]
    .sort(([a], [b]) => {
      const [ca, sa] = a.split(" ");
      const [cb, sb] = b.split(" ");
      return numero(cb) - numero(ca) || numero(sa) - numero(sb);
    })
    .map(([clave, lista]) => ({ clave, titulo: clave, cortos: porReciente(lista) }));
}

export function agruparPorGenero(): Grupo[] {
  return (Object.keys(generos) as Genero[])
    .map((g) => ({
      clave: g,
      titulo: generos[g],
      cortos: porReciente(cortos.filter((c) => c.generos.includes(g))),
    }))
    .filter((g) => g.cortos.length > 0)
    .sort((a, b) => b.cortos.length - a.cortos.length);
}

export function agruparPorAnio(): Grupo[] {
  const anios = [...new Set(cortos.map((c) => c.anio))].sort((a, b) => b - a);
  return anios.map((anio) => ({
    clave: String(anio),
    titulo: String(anio),
    cortos: porReciente(cortos.filter((c) => c.anio === anio)),
  }));
}

export function aniosDisponibles(): number[] {
  return [...new Set(cortos.map((c) => c.anio))].sort((a, b) => b - a);
}

export function cursosDisponibles(): string[] {
  return agruparPorCurso().map((g) => g.clave);
}

export function generosDisponibles(): Genero[] {
  return agruparPorGenero().map((g) => g.clave as Genero);
}

/** Relacionados: mismo curso o mismo género, los más parecidos primero. */
export function relacionados(corto: Corto, cantidad = 6): Corto[] {
  return cortos
    .filter((c) => c.id !== corto.id)
    .map((c) => {
      let puntos = c.generos.filter((g) => corto.generos.includes(g)).length * 2;
      if (cursoYSeccion(c) === cursoYSeccion(corto)) puntos += 3;
      else if (c.curso === corto.curso) puntos += 1;
      if (c.anio === corto.anio) puntos += 1;
      return { c, puntos };
    })
    .filter((x) => x.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos || b.c.agregado.localeCompare(a.c.agregado))
    .slice(0, cantidad)
    .map((x) => x.c);
}

/** El que sigue en “Recién agregados” (vuelve al principio al llegar al final). */
export function siguienteCorto(corto: Corto): Corto | undefined {
  const lista = porReciente();
  if (lista.length < 2) return undefined;
  const i = lista.findIndex((c) => c.id === corto.id);
  return lista[(i + 1) % lista.length];
}

/** Saca acentos y pasa a minúsculas: “Animación” → “animacion”. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** Variantes de escritura de los cursos: “3ero” = “3ro” = “3°” = “3”. */
function normalizarCurso(texto: string): string {
  return normalizar(texto).replace(/(\d+)\s*(ero|ro|er|do|to|era|ra|da|ta|°|º)\b/g, "$1");
}

function textoBuscable(c: Corto): string {
  const partes = [
    c.titulo,
    cursoYSeccion(c),
    `${c.curso} curso`,
    ...c.generos.map((g) => generos[g]),
    String(c.anio),
    c.profesorGuia,
    c.materia,
    ...Object.values(c.equipo).flat(),
  ];
  return normalizarCurso(partes.join(" | "));
}

const indice = cortos.map((c) => ({ c, texto: textoBuscable(c) }));

/** Búsqueda en vivo por título, curso, género o integrante. */
export function buscar(consulta: string): Corto[] {
  const terminos = normalizarCurso(consulta).split(/\s+/).filter(Boolean);
  if (!terminos.length) return [];
  // Los números (“3”, “2025”) tienen que coincidir enteros, no dentro de otro número.
  // “3ero 1era” (solo números) es curso + sección: tienen que ir juntos y en ese orden.
  const soloNumeros = terminos.length > 1 && terminos.every((t) => /^\d+$/.test(t));
  const pruebas = soloNumeros
    ? [(s: string) => new RegExp(`\\b${terminos.join(" ")}\\b`).test(s)]
    : terminos.map((t) =>
        /^\d+$/.test(t) ? (s: string) => new RegExp(`\\b${t}\\b`).test(s) : (s: string) => s.includes(t),
      );
  return indice
    .filter(({ texto }) => pruebas.every((p) => p(texto)))
    .map(({ c }) => c)
    .sort((a, b) => {
      const q = normalizar(consulta);
      const ta = normalizar(a.titulo).includes(q) ? 0 : 1;
      const tb = normalizar(b.titulo).includes(q) ? 0 : 1;
      return ta - tb || b.agregado.localeCompare(a.agregado);
    });
}

/** Extrae el ID de video de cualquier enlace de YouTube. */
export function idYoutube(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/,
  );
  if (m) return m[1];
  return /^[\w-]{11}$/.test(url) ? url : null;
}
